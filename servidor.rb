#!/usr/bin/env ruby
# MultiFácil - Servidor local con recarga en vivo (Live Server)
require 'webrick'
require 'json'

port = 5500
dir = File.expand_path(__dir__)

def latest_mtime(dir)
  files = Dir.glob(File.join(dir, '**', '*')).reject do |f| 
    File.directory?(f) || f.include?('.git') || f.include?('servidor.rb')
  end
  files.map { |f| File.mtime(f).to_i }.max || 0
end

server = WEBrick::HTTPServer.new(
  Port: port,
  BindAddress: '127.0.0.1',
  Logger: WEBrick::Log.new($stderr, WEBrick::Log::WARN),
  AccessLog: []
)

server.mount_proc '/liveserver-time' do |_req, res|
  res['Content-Type'] = 'application/json'
  res['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  res.body = { mtime: latest_mtime(dir) }.to_json
end

live_script = <<~HTML
  <!-- Live Server Auto-Reload Script -->
  <script>
    (function() {
      let lastMtime = null;
      async function checkReload() {
        try {
          const res = await fetch('/liveserver-time?_=' + Date.now());
          if (res.ok) {
            const data = await res.json();
            if (lastMtime !== null && data.mtime > lastMtime) {
              console.log('[LiveServer] Cambio detectado en los archivos, recargando...');
              window.location.reload();
              return;
            }
            lastMtime = data.mtime;
          }
        } catch (e) {}
        setTimeout(checkReload, 900);
      }
      checkReload();
    })();
  </script>
HTML

server.mount_proc '/' do |req, res|
  path = req.path
  path = '/index.html' if path == '/'
  file_path = File.join(dir, WEBrick::HTTPUtils.unescape(path))

  if File.file?(file_path)
    content_type = WEBrick::HTTPUtils.mime_type(file_path, WEBrick::HTTPUtils::DefaultMimeTypes)
    res['Content-Type'] = content_type
    res['Cache-Control'] = 'no-cache, no-store, must-revalidate'

    if file_path.end_with?('.html')
      content = File.read(file_path)
      if content.include?('</body>')
        content = content.sub('</body>', "#{live_script}\n</body>")
      else
        content << live_script
      end
      res.body = content
    else
      res.body = File.binread(file_path)
    end
  else
    res.status = 404
    res['Content-Type'] = 'text/plain'
    res.body = '404 - Archivo no encontrado'
  end
end

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

puts "🚀 Live Server corriendo en http://localhost:#{port}"
$stdout.flush
server.start
