/**
 * MultiFácil - Lógica interactiva completa
 * - Menú hamburguesa accesible para móvil
 * - Acordeón para Preguntas Frecuentes
 * - Juego 1: Dibujo Mágico (con selector de tabla 2-9, coloreado SVG, teclado táctil y pistas visuales)
 * - Juego 2: Carrera de 60 segundos
 * - Sintetizador de audio alegre con Web Audio API (sin dependencias externas)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     0. Sintetizador de Sonidos (Web Audio API)
     ========================================================== */
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function obtenerAudioCtx() {
    if (!audioCtx && AudioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function sonarTono(frecuencia, tipo, duracion, retardo = 0) {
    try {
      const ctx = obtenerAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipo || 'sine';
      osc.frequency.setValueAtTime(frecuencia, ctx.currentTime + retardo);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + retardo);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + retardo + duracion);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + retardo);
      osc.stop(ctx.currentTime + retardo + duracion);
    } catch (e) {}
  }

  function sonarAcierto() {
    sonarTono(523.25, 'triangle', 0.15, 0);       // C5
    sonarTono(659.25, 'triangle', 0.25, 0.12);    // E5
    sonarTono(783.99, 'triangle', 0.35, 0.24);    // G5
  }

  function sonarError() {
    sonarTono(240, 'sine', 0.25, 0);
    sonarTono(190, 'sine', 0.35, 0.15);
  }

  function sonarVictoria() {
    const notas = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notas.forEach((nota, idx) => {
      sonarTono(nota, 'triangle', 0.3, idx * 0.12);
    });
  }

  function sonarPopBurbuja() {
    try {
      const ctx = obtenerAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  function sonarSaltoRana() {
    try {
      const ctx = obtenerAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }

  /* Contador de puntos global en localStorage */
  function obtenerPuntosGlobales() {
    const p = localStorage.getItem('multifacil_puntos_totales');
    return p !== null ? parseInt(p, 10) : 100;
  }

  function sumarPuntosGlobales(puntos) {
    const nuevos = obtenerPuntosGlobales() + puntos;
    localStorage.setItem('multifacil_puntos_totales', nuevos);
    actualizarVistaPuntosGlobales();
    return nuevos;
  }

  function actualizarVistaPuntosGlobales() {
    const el = document.getElementById('contador-puntos-global');
    if (el) {
      el.textContent = `⭐ ${obtenerPuntosGlobales()} pts`;
    }
  }

  actualizarVistaPuntosGlobales();

  /* ==========================================================
     1. Menú móvil hamburguesa
     ========================================================== */
  const btnMenu = document.getElementById('btn-menu');
  const navMenu = document.getElementById('nav-menu');
  const navEnlaces = document.querySelectorAll('.nav-enlace');

  if (btnMenu && navMenu) {
    btnMenu.addEventListener('click', () => {
      const estaAbierto = navMenu.classList.toggle('abierto');
      btnMenu.setAttribute('aria-expanded', estaAbierto);
      const iconoHamburguesa = btnMenu.querySelector('.icono-hamburguesa');
      if (iconoHamburguesa) {
        iconoHamburguesa.textContent = estaAbierto ? '✕' : '☰';
      }
    });

    navEnlaces.forEach(enlace => {
      enlace.addEventListener('click', () => {
        if (navMenu.classList.contains('abierto')) {
          navMenu.classList.remove('abierto');
          btnMenu.setAttribute('aria-expanded', 'false');
          const icono = btnMenu.querySelector('.icono-hamburguesa');
          if (icono) icono.textContent = '☰';
        }
      });
    });

    document.addEventListener('click', (evento) => {
      if (!navMenu.contains(evento.target) && !btnMenu.contains(evento.target)) {
        if (navMenu.classList.contains('abierto')) {
          navMenu.classList.remove('abierto');
          btnMenu.setAttribute('aria-expanded', 'false');
          const icono = btnMenu.querySelector('.icono-hamburguesa');
          if (icono) icono.textContent = '☰';
        }
      }
    });
  }

  /* ==========================================================
     2. Acordeón de Preguntas Frecuentes
     ========================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const botonPregunta = item.querySelector('.faq-pregunta');
    const respuesta = item.querySelector('.faq-respuesta');

    if (botonPregunta && respuesta) {
      botonPregunta.addEventListener('click', () => {
        const estaAbierto = item.classList.contains('abierto');

        faqItems.forEach(otroItem => {
          if (otroItem !== item && otroItem.classList.contains('abierto')) {
            otroItem.classList.remove('abierto');
            const otroBoton = otroItem.querySelector('.faq-pregunta');
            const otraRespuesta = otroItem.querySelector('.faq-respuesta');
            if (otroBoton) otroBoton.setAttribute('aria-expanded', 'false');
            if (otraRespuesta) otraRespuesta.style.maxHeight = null;
          }
        });

        if (estaAbierto) {
          item.classList.remove('abierto');
          botonPregunta.setAttribute('aria-expanded', 'false');
          respuesta.style.maxHeight = null;
        } else {
          item.classList.add('abierto');
          botonPregunta.setAttribute('aria-expanded', 'true');
          respuesta.style.maxHeight = respuesta.scrollHeight + 'px';
        }
      });
    }
  });

  /* ==========================================================
     3. Alternar pestañas entre juegos
     ========================================================== */
  const tabDibujo = document.getElementById('tab-dibujo-magico');
  const tabCarrera = document.getElementById('tab-carrera-60');
  const tabMemoria = document.getElementById('tab-memoria');
  const tabBurbujas = document.getElementById('tab-burbujas');
  const tabRana = document.getElementById('tab-rana');

  const vistaDibujo = document.getElementById('vista-dibujo-magico');
  const vistaCarrera = document.getElementById('vista-carrera-60');
  const vistaMemoria = document.getElementById('vista-memoria');
  const vistaBurbujas = document.getElementById('vista-burbujas');
  const vistaRana = document.getElementById('vista-rana');

  const juegosTabsList = [
    { id: 'dibujo', tab: tabDibujo, vista: vistaDibujo },
    { id: 'carrera', tab: tabCarrera, vista: vistaCarrera },
    { id: 'memoria', tab: tabMemoria, vista: vistaMemoria },
    { id: 'burbujas', tab: tabBurbujas, vista: vistaBurbujas },
    { id: 'rana', tab: tabRana, vista: vistaRana }
  ];

  function activarJuego(nombre) {
    juegosTabsList.forEach(j => {
      const activo = j.id === nombre;
      if (j.tab) j.tab.classList.toggle('activa', activo);
      if (j.vista) j.vista.style.display = activo ? 'block' : 'none';
    });

    if (nombre === 'dibujo') {
      const input = document.getElementById('input-resultado');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }

  juegosTabsList.forEach(j => {
    if (j.tab) {
      j.tab.addEventListener('click', () => activarJuego(j.id));
    }
  });

  // Enlaces de tarjetas principales
  const btnDibujoCard = document.getElementById('btn-dibujo-magico');
  const btnCarreraCard = document.getElementById('btn-carrera-jugar');
  const btnMemoriaCard = document.getElementById('btn-memoria-jugar');
  const btnBurbujasCard = document.getElementById('btn-burbujas-jugar');
  const btnRanaCard = document.getElementById('btn-rana-jugar');
  const zonaJuegos = document.getElementById('zona-juego');

  function scrollHaciaJuegos() {
    if (zonaJuegos) {
      zonaJuegos.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (btnDibujoCard) {
    btnDibujoCard.addEventListener('click', () => {
      activarJuego('dibujo');
      scrollHaciaJuegos();
    });
  }

  if (btnCarreraCard) {
    btnCarreraCard.addEventListener('click', () => {
      activarJuego('carrera');
      scrollHaciaJuegos();
    });
  }

  if (btnMemoriaCard) {
    btnMemoriaCard.addEventListener('click', () => {
      activarJuego('memoria');
      scrollHaciaJuegos();
    });
  }

  if (btnBurbujasCard) {
    btnBurbujasCard.addEventListener('click', () => {
      activarJuego('burbujas');
      scrollHaciaJuegos();
    });
  }

  if (btnRanaCard) {
    btnRanaCard.addEventListener('click', () => {
      activarJuego('rana');
      scrollHaciaJuegos();
    });
  }

  // Botón "Jugar ahora" en Hero
  const btnHeroJugar = document.querySelector('.portada-acciones a[href="#actividades"]');
  if (btnHeroJugar) {
    btnHeroJugar.addEventListener('click', (e) => {
      e.preventDefault();
      activarJuego('dibujo');
      scrollHaciaJuegos();
    });
  }

  /* ==========================================================
     4. JUEGO: DIBUJO MÁGICO (MOTOR PRINCIPAL)
     ========================================================== */

  // Definición de las 8 partes del Cohete Espacial
  const partesCohete = [
    { id: 0, nombre: 'Punta del cohete', mult: 2, color: '#EF4444' }, // Rojo vibrante
    { id: 1, nombre: 'Cuerpo superior', mult: 3, color: '#1D4ED8' }, // Azul principal
    { id: 2, nombre: 'Ventana redonda', mult: 4, color: '#38BDF8' }, // Celeste cielo
    { id: 3, nombre: 'Cuerpo inferior', mult: 5, color: '#FBBF24' }, // Amarillo secundario
    { id: 4, nombre: 'Ala izquierda', mult: 6, color: '#8B5CF6' },   // Morado
    { id: 5, nombre: 'Ala derecha', mult: 7, color: '#8B5CF6' },     // Morado
    { id: 6, nombre: 'Fuego propulsor', mult: 8, color: '#F97316' }, // Naranja
    { id: 7, nombre: 'Estrella mágica', mult: 9, color: '#FACC15' }  // Amarillo estrella
  ];

  let tablaActual = 3;
  let parteActiva = 0;
  let partesColoreadas = new Array(partesCohete.length).fill(false);

  // Elementos DOM
  const selectorBotonesTablas = document.querySelectorAll('.btn-tabla');
  const etiquetaParteActual = document.getElementById('etiqueta-parte-actual');
  const preguntaActualTexto = document.getElementById('pregunta-actual-texto');
  const inputResultado = document.getElementById('input-resultado');
  const btnComprobar = document.getElementById('btn-comprobar-respuesta');
  const cajaMensaje = document.getElementById('caja-mensaje');
  const cajaPistaVisual = document.getElementById('caja-pista-visual');
  const pistaGruposContenedor = document.getElementById('pista-grupos-contenedor');
  const pistaResumenSuma = document.getElementById('pista-resumen-suma');
  const btnReintentar = document.getElementById('btn-reintentar');
  const contadorProgreso = document.getElementById('contador-progreso');
  const barraProgreso = document.getElementById('barra-progreso');
  const modalVictoria = document.getElementById('modal-victoria');
  const victoriaTexto = document.getElementById('victoria-texto');
  const btnVictoriaRepetir = document.getElementById('btn-victoria-repetir');
  const btnVictoriaOtraTabla = document.getElementById('btn-victoria-otra-tabla');

  // Inicializar juego con la tabla seleccionada
  function iniciarDibujoMagico(tabla) {
    tablaActual = tabla;
    partesColoreadas.fill(false);
    parteActiva = 0;

    // Actualizar botones de selector
    selectorBotonesTablas.forEach(btn => {
      const valor = parseInt(btn.getAttribute('data-tabla'), 10);
      btn.classList.toggle('activa', valor === tablaActual);
    });

    // Actualizar etiquetas en el SVG
    partesCohete.forEach((parte, idx) => {
      const textoSvg = document.getElementById(`svg-texto-${idx}`);
      if (textoSvg) {
        textoSvg.textContent = `${tablaActual}×${parte.mult}`;
      }

      const parteG = document.getElementById(`parte-g-${idx}`);
      const segmento = document.getElementById(`svg-parte-${idx}`);
      if (parteG) {
        parteG.classList.remove('coloreado', 'activo');
      }
      if (segmento) {
        segmento.setAttribute('fill', '#FFFFFF');
      }
    });

    if (modalVictoria) modalVictoria.style.display = 'none';
    if (cajaMensaje) cajaMensaje.style.display = 'none';
    if (cajaPistaVisual) cajaPistaVisual.style.display = 'none';

    actualizarProgreso();
    seleccionarParte(0);
  }

  // Seleccionar la parte del dibujo a resolver
  function seleccionarParte(indice) {
    parteActiva = indice;
    const parte = partesCohete[indice];

    // Actualizar clases activas en SVG
    partesCohete.forEach((p, idx) => {
      const parteG = document.getElementById(`parte-g-${idx}`);
      if (parteG) {
        parteG.classList.toggle('activo', idx === indice);
      }
    });

    // Textos informativos
    if (etiquetaParteActual) {
      etiquetaParteActual.innerHTML = `🎯 Resolviendo: <strong>${parte.nombre}</strong>`;
    }
    if (preguntaActualTexto) {
      preguntaActualTexto.textContent = `${tablaActual} × ${parte.mult} = ?`;
    }

    if (inputResultado) {
      inputResultado.value = '';
      inputResultado.focus();
    }
    if (cajaMensaje) cajaMensaje.style.display = 'none';
    if (cajaPistaVisual) cajaPistaVisual.style.display = 'none';
  }

  // Actualizar barra y contador de progreso
  function actualizarProgreso() {
    const total = partesCohete.length;
    const resueltas = partesColoreadas.filter(Boolean).length;
    const porcentaje = Math.round((resueltas / total) * 100);

    if (contadorProgreso) {
      contadorProgreso.textContent = `${resueltas} de ${total} partes coloreadas`;
    }
    if (barraProgreso) {
      barraProgreso.style.width = `${porcentaje}%`;
    }
  }

  // Mostrar la pista pedagógica con dibujos de objetos en grupos
  function mostrarPistaVisual(factorA, factorB) {
    if (!cajaPistaVisual || !pistaGruposContenedor || !pistaResumenSuma) return;

    pistaGruposContenedor.innerHTML = '';
    const iconos = ['⭐', '🚀', '🎨', '🎈', '🍭'];
    const icono = iconos[factorA % iconos.length];

    // Crear las cajitas de grupos
    for (let i = 0; i < factorA; i++) {
      const cajaGrupo = document.createElement('div');
      cajaGrupo.className = 'caja-grupo-objeto';
      cajaGrupo.textContent = icono.repeat(factorB);
      pistaGruposContenedor.appendChild(cajaGrupo);

      if (i < factorA - 1) {
        const mas = document.createElement('span');
        mas.className = 'signo-mas';
        mas.textContent = '+';
        pistaGruposContenedor.appendChild(mas);
      }
    }

    const sumaStr = new Array(factorA).fill(factorB).join(' + ');
    const total = factorA * factorB;
    pistaResumenSuma.innerHTML = `Son <strong>${factorA} grupos de ${factorB}</strong>.<br>Es lo mismo que sumar: ${sumaStr} = <strong>${total}</strong>`;

    cajaPistaVisual.style.display = 'flex';
  }

  // Comprobar la respuesta ingresada
  function comprobarRespuestaDibujo() {
    if (!inputResultado) return;
    const valor = parseInt(inputResultado.value.trim(), 10);
    const parte = partesCohete[parteActiva];
    const esperado = tablaActual * parte.mult;

    if (isNaN(valor)) {
      if (inputResultado) inputResultado.focus();
      return;
    }

    if (valor === esperado) {
      // ¡ACIERTO!
      sonarAcierto();
      partesColoreadas[parteActiva] = true;

      // Colorear el SVG
      const segmento = document.getElementById(`svg-parte-${parteActiva}`);
      const parteG = document.getElementById(`parte-g-${parteActiva}`);
      if (segmento) segmento.setAttribute('fill', parte.color);
      if (parteG) {
        parteG.classList.add('coloreado');
        parteG.classList.remove('activo');
      }

      // Mensaje de éxito
      if (cajaMensaje) {
        cajaMensaje.className = 'retroalimentacion-caja retro-exito';
        cajaMensaje.innerHTML = `✨ ¡Muy bien! Has coloreado: <strong>${parte.nombre}</strong>`;
        cajaMensaje.style.display = 'block';
      }
      if (cajaPistaVisual) cajaPistaVisual.style.display = 'none';

      actualizarProgreso();

      // Verificar si completó todas las partes
      const todoCompletado = partesColoreadas.every(Boolean);
      if (todoCompletado) {
        sonarVictoria();
        setTimeout(() => {
          if (modalVictoria) {
            if (victoriaTexto) {
              victoriaTexto.textContent = `¡Has completado y coloreado todo el Cohete Espacial con la tabla del ${tablaActual}!`;
            }
            modalVictoria.style.display = 'flex';
          }
        }, 600);
      } else {
        // Pasar a la siguiente parte no coloreada
        setTimeout(() => {
          let siguiente = (parteActiva + 1) % partesCohete.length;
          while (partesColoreadas[siguiente]) {
            siguiente = (siguiente + 1) % partesCohete.length;
          }
          seleccionarParte(siguiente);
        }, 900);
      }
    } else {
      // ¡ERROR AMABLE Y PISTA!
      sonarError();
      if (cajaMensaje) {
        cajaMensaje.className = 'retroalimentacion-caja retro-error';
        cajaMensaje.innerHTML = `¡Casi! No te preocupes, mira la pista abajo para entenderlo mejor 👇`;
        cajaMensaje.style.display = 'block';
      }
      mostrarPistaVisual(tablaActual, parte.mult);
    }
  }

  // Eventos de comprobación
  if (btnComprobar) {
    btnComprobar.addEventListener('click', comprobarRespuestaDibujo);
  }

  if (inputResultado) {
    inputResultado.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        comprobarRespuestaDibujo();
      }
    });
  }

  if (btnReintentar) {
    btnReintentar.addEventListener('click', () => {
      if (cajaPistaVisual) cajaPistaVisual.style.display = 'none';
      if (inputResultado) {
        inputResultado.value = '';
        inputResultado.focus();
      }
    });
  }

  // Teclado táctil en pantalla
  const teclasNum = document.querySelectorAll('.tecla-num[data-num]');
  teclasNum.forEach(tecla => {
    tecla.addEventListener('click', () => {
      const num = tecla.getAttribute('data-num');
      if (inputResultado) {
        inputResultado.value += num;
        inputResultado.focus();
      }
    });
  });

  const btnTecladoBorrar = document.getElementById('btn-teclado-borrar');
  if (btnTecladoBorrar) {
    btnTecladoBorrar.addEventListener('click', () => {
      if (inputResultado) {
        inputResultado.value = inputResultado.value.slice(0, -1);
        inputResultado.focus();
      }
    });
  }

  const btnTecladoOk = document.getElementById('btn-teclado-comprobar');
  if (btnTecladoOk) {
    btnTecladoOk.addEventListener('click', comprobarRespuestaDibujo);
  }

  // Clic en segmentos del SVG para seleccionarlos directamente
  partesCohete.forEach((p, idx) => {
    const parteG = document.getElementById(`parte-g-${idx}`);
    if (parteG) {
      parteG.addEventListener('click', () => {
        seleccionarParte(idx);
      });
    }
  });

  // Selector de tablas del 2 al 9
  selectorBotonesTablas.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabla = parseInt(btn.getAttribute('data-tabla'), 10);
      iniciarDibujoMagico(tabla);
    });
  });

  // Botones de modal de victoria
  if (btnVictoriaRepetir) {
    btnVictoriaRepetir.addEventListener('click', () => {
      iniciarDibujoMagico(tablaActual);
    });
  }

  if (btnVictoriaOtraTabla) {
    btnVictoriaOtraTabla.addEventListener('click', () => {
      let nuevaTabla = tablaActual + 1;
      if (nuevaTabla > 9) nuevaTabla = 2;
      iniciarDibujoMagico(nuevaTabla);
    });
  }

  // Inicializar Dibujo Mágico por defecto en la tabla del 3
  iniciarDibujoMagico(3);

  /* ==========================================================
     5. JUEGO: CARRERA DE 60 SEGUNDOS
     ========================================================== */
  let tiempoCarrera = 60;
  let intervaloCarrera = null;
  let aciertosCarrera = 0;
  let rachaCarrera = 0;
  let operacionCorrectaCarrera = 0;

  const carreraTiempoEl = document.getElementById('carrera-tiempo');
  const carreraAciertosEl = document.getElementById('carrera-aciertos');
  const carreraRachaEl = document.getElementById('carrera-racha');
  const carreraInicioEl = document.getElementById('carrera-inicio');
  const carreraJuegoEl = document.getElementById('carrera-juego');
  const carreraFinEl = document.getElementById('carrera-fin');
  const btnIniciarCarrera = document.getElementById('btn-iniciar-carrera');
  const btnReiniciarCarrera = document.getElementById('btn-reiniciar-carrera');
  const carreraPreguntaTexto = document.getElementById('carrera-pregunta-texto');
  const carreraOpcionesGrid = document.getElementById('carrera-opciones');
  const carreraResultadoTexto = document.getElementById('carrera-resultado-texto');

  function siguientePreguntaCarrera() {
    const factorA = Math.floor(Math.random() * 8) + 2; // 2 al 9
    const factorB = Math.floor(Math.random() * 8) + 2; // 2 al 9
    operacionCorrectaCarrera = factorA * factorB;

    if (carreraPreguntaTexto) {
      carreraPreguntaTexto.textContent = `${factorA} × ${factorB} = ?`;
    }

    // 4 opciones (1 correcta y 3 opciones cercanas)
    const opciones = new Set([operacionCorrectaCarrera]);
    while (opciones.size < 4) {
      const offset = (Math.floor(Math.random() * 5) - 2) * factorA || 1;
      const fake = Math.max(2, operacionCorrectaCarrera + offset);
      opciones.add(fake);
    }

    const opcionesArray = Array.from(opciones).sort(() => Math.random() - 0.5);

    if (carreraOpcionesGrid) {
      carreraOpcionesGrid.innerHTML = '';
      opcionesArray.forEach(val => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-opcion-carrera';
        btn.textContent = val;
        btn.addEventListener('click', () => responderCarrera(val));
        carreraOpcionesGrid.appendChild(btn);
      });
    }
  }

  function responderCarrera(valor) {
    if (valor === operacionCorrectaCarrera) {
      sonarAcierto();
      aciertosCarrera++;
      rachaCarrera++;
    } else {
      sonarError();
      rachaCarrera = 0;
    }

    if (carreraAciertosEl) carreraAciertosEl.textContent = aciertosCarrera;
    if (carreraRachaEl) carreraRachaEl.textContent = rachaCarrera;

    siguientePreguntaCarrera();
  }

  function iniciarCarrera() {
    tiempoCarrera = 60;
    aciertosCarrera = 0;
    rachaCarrera = 0;

    if (carreraTiempoEl) carreraTiempoEl.textContent = '60s';
    if (carreraAciertosEl) carreraAciertosEl.textContent = '0';
    if (carreraRachaEl) carreraRachaEl.textContent = '0';

    if (carreraInicioEl) carreraInicioEl.style.display = 'none';
    if (carreraFinEl) carreraFinEl.style.display = 'none';
    if (carreraJuegoEl) carreraJuegoEl.style.display = 'block';

    siguientePreguntaCarrera();

    if (intervaloCarrera) clearInterval(intervaloCarrera);
    intervaloCarrera = setInterval(() => {
      tiempoCarrera--;
      if (carreraTiempoEl) carreraTiempoEl.textContent = `${tiempoCarrera}s`;

      if (tiempoCarrera <= 0) {
        clearInterval(intervaloCarrera);
        finalizarCarrera();
      }
    }, 1000);
  }

  function finalizarCarrera() {
    sonarVictoria();
    if (carreraJuegoEl) carreraJuegoEl.style.display = 'none';
    if (carreraFinEl) carreraFinEl.style.display = 'block';
    if (carreraResultadoTexto) {
      carreraResultadoTexto.textContent = `¡Lograste ${aciertosCarrera} aciertos en 60 segundos!`;
    }
  }

  if (btnIniciarCarrera) {
    btnIniciarCarrera.addEventListener('click', iniciarCarrera);
  }

  if (btnReiniciarCarrera) {
    btnReiniciarCarrera.addEventListener('click', iniciarCarrera);
  }

  /* ==========================================================
     6. JUEGO: MEMORIA DE PAREJAS
     ========================================================== */
  const memoriaCuadricula = document.getElementById('memoria-cuadricula');
  const memoriaParejasEl = document.getElementById('memoria-parejas');
  const memoriaIntentosEl = document.getElementById('memoria-intentos');
  const memoriaEstrellasEl = document.getElementById('memoria-estrellas');
  const btnReiniciarMemoria = document.getElementById('btn-reiniciar-memoria');
  const modalVictoriaMemoria = document.getElementById('modal-victoria-memoria');
  const victoriaMemoriaTexto = document.getElementById('victoria-memoria-texto');
  const btnVictoriaMemoriaRepetir = document.getElementById('btn-victoria-memoria-repetir');
  const btnVictoriaMemoriaOtraTabla = document.getElementById('btn-victoria-memoria-otra-tabla');
  const botonesTablaMemoria = document.querySelectorAll('.btn-tabla-memoria');

  let tablaMemoriaSeleccionada = 'todas';
  let primeraCarta = null;
  let segundaCarta = null;
  let bloqueoTablero = false;
  let parejasEncontradas = 0;
  let intentosMemoria = 0;
  const TOTAL_PAREJAS_MEMORIA = 6;

  function calcularEstrellasMemoria(intentos) {
    if (intentos <= 8) return '⭐⭐⭐';
    if (intentos <= 12) return '⭐⭐';
    return '⭐';
  }

  function generarParejasMemoria(tabla) {
    const pares = [];
    const operacionesUsadas = new Set();

    while (pares.length < TOTAL_PAREJAS_MEMORIA) {
      let fA, fB;
      if (tabla === 'todas') {
        fA = Math.floor(Math.random() * 8) + 2; // 2 al 9
        fB = Math.floor(Math.random() * 8) + 2; // 2 al 9
      } else {
        fA = parseInt(tabla, 10);
        fB = Math.floor(Math.random() * 8) + 2; // 2 al 9
      }

      const clave = `${fA}x${fB}`;
      if (!operacionesUsadas.has(clave)) {
        operacionesUsadas.add(clave);
        const resultado = fA * fB;
        const idPar = pares.length + 1;
        pares.push({
          idPar,
          operacion: `${fA} × ${fB}`,
          resultado: resultado.toString()
        });
      }
    }

    // Aplanar en 12 cartas: 6 con operación y 6 con resultado
    const cartas = [];
    pares.forEach(p => {
      cartas.push({ idPar: p.idPar, texto: p.operacion, tipo: 'op' });
      cartas.push({ idPar: p.idPar, texto: p.resultado, tipo: 'res' });
    });

    // Barajar (Fisher-Yates)
    for (let i = cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }

    return cartas;
  }

  function iniciarJuegoMemoria(tabla = tablaMemoriaSeleccionada) {
    tablaMemoriaSeleccionada = tabla;
    primeraCarta = null;
    segundaCarta = null;
    bloqueoTablero = false;
    parejasEncontradas = 0;
    intentosMemoria = 0;

    if (modalVictoriaMemoria) modalVictoriaMemoria.style.display = 'none';
    if (memoriaParejasEl) memoriaParejasEl.textContent = `0 / ${TOTAL_PAREJAS_MEMORIA}`;
    if (memoriaIntentosEl) memoriaIntentosEl.textContent = '0';
    if (memoriaEstrellasEl) memoriaEstrellasEl.textContent = '⭐⭐⭐';

    // Actualizar botones de selector
    botonesTablaMemoria.forEach(btn => {
      const valor = btn.getAttribute('data-tabla');
      btn.classList.toggle('activa', valor === tablaMemoriaSeleccionada);
    });

    if (!memoriaCuadricula) return;
    memoriaCuadricula.innerHTML = '';

    const cartas = generarParejasMemoria(tablaMemoriaSeleccionada);
    cartas.forEach((c) => {
      const cartaEl = document.createElement('div');
      cartaEl.className = 'carta-memoria';
      cartaEl.setAttribute('data-par-id', c.idPar);
      cartaEl.setAttribute('tabindex', '0');
      cartaEl.setAttribute('role', 'button');
      cartaEl.setAttribute('aria-label', 'Carta oculta');

      const dorso = document.createElement('div');
      dorso.className = 'carta-cara carta-dorso';
      dorso.innerHTML = '<span class="carta-dorso-icono">🎯</span><span class="carta-dorso-texto">MultiFácil</span>';

      const frente = document.createElement('div');
      frente.className = `carta-cara carta-frente ${c.tipo === 'op' ? 'es-operacion' : 'es-resultado'}`;
      frente.innerHTML = `<span>${c.texto}</span>`;

      cartaEl.appendChild(dorso);
      cartaEl.appendChild(frente);

      cartaEl.addEventListener('click', () => voltearCartaMemoria(cartaEl));
      cartaEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          voltearCartaMemoria(cartaEl);
        }
      });

      memoriaCuadricula.appendChild(cartaEl);
    });
  }

  function voltearCartaMemoria(carta) {
    if (bloqueoTablero) return;
    if (carta.classList.contains('volteada') || carta.classList.contains('emparejada')) return;
    if (carta === primeraCarta) return;

    sonarTono(440, 'sine', 0.08, 0);
    carta.classList.add('volteada');

    if (!primeraCarta) {
      primeraCarta = carta;
      return;
    }

    segundaCarta = carta;
    intentosMemoria++;
    if (memoriaIntentosEl) memoriaIntentosEl.textContent = intentosMemoria;
    if (memoriaEstrellasEl) memoriaEstrellasEl.textContent = calcularEstrellasMemoria(intentosMemoria);

    const parA = primeraCarta.getAttribute('data-par-id');
    const parB = segundaCarta.getAttribute('data-par-id');

    if (parA === parB) {
      // ¡Pareja encontrada!
      sonarAcierto();
      primeraCarta.classList.add('emparejada');
      segundaCarta.classList.add('emparejada');
      parejasEncontradas++;

      if (memoriaParejasEl) memoriaParejasEl.textContent = `${parejasEncontradas} / ${TOTAL_PAREJAS_MEMORIA}`;

      primeraCarta = null;
      segundaCarta = null;

      if (parejasEncontradas === TOTAL_PAREJAS_MEMORIA) {
        sonarVictoria();
        setTimeout(() => {
          if (modalVictoriaMemoria) {
            const estrellas = calcularEstrellasMemoria(intentosMemoria);
            if (victoriaMemoriaTexto) {
              victoriaMemoriaTexto.innerHTML = `¡Encontraste las <strong>${TOTAL_PAREJAS_MEMORIA} parejas</strong> en <strong>${intentosMemoria} intentos</strong>!<br>Tu puntuación: <strong>${estrellas}</strong>`;
            }
            modalVictoriaMemoria.style.display = 'flex';
          }
        }, 500);
      }
    } else {
      // No coinciden
      bloqueoTablero = true;
      sonarError();
      primeraCarta.classList.add('error-anim');
      segundaCarta.classList.add('error-anim');

      setTimeout(() => {
        if (primeraCarta) {
          primeraCarta.classList.remove('volteada', 'error-anim');
        }
        if (segundaCarta) {
          segundaCarta.classList.remove('volteada', 'error-anim');
        }
        primeraCarta = null;
        segundaCarta = null;
        bloqueoTablero = false;
      }, 900);
    }
  }

  // Eventos de selección de tabla para memoria
  botonesTablaMemoria.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabla = btn.getAttribute('data-tabla');
      iniciarJuegoMemoria(tabla);
    });
  });

  if (btnReiniciarMemoria) {
    btnReiniciarMemoria.addEventListener('click', () => {
      iniciarJuegoMemoria(tablaMemoriaSeleccionada);
    });
  }

  if (btnVictoriaMemoriaRepetir) {
    btnVictoriaMemoriaRepetir.addEventListener('click', () => {
      iniciarJuegoMemoria(tablaMemoriaSeleccionada);
    });
  }

  if (btnVictoriaMemoriaOtraTabla) {
    btnVictoriaMemoriaOtraTabla.addEventListener('click', () => {
      let siguiente;
      if (tablaMemoriaSeleccionada === 'todas') siguiente = '2';
      else {
        const num = parseInt(tablaMemoriaSeleccionada, 10);
        siguiente = num >= 9 ? 'todas' : (num + 1).toString();
      }
      iniciarJuegoMemoria(siguiente);
    });
  }

  // Inicializar juego de memoria en segundo plano
  iniciarJuegoMemoria('todas');

  /* ==========================================================
     7. JUEGO 5: ATRAPA LAS BURBUJAS 🫧
     ========================================================== */
  const burbujasInicioEl = document.getElementById('burbujas-inicio');
  const burbujasJuegoEl = document.getElementById('burbujas-juego');
  const burbujasFinEl = document.getElementById('burbujas-fin');
  const btnIniciarBurbujas = document.getElementById('btn-iniciar-burbujas');
  const btnReiniciarBurbujas = document.getElementById('btn-reiniciar-burbujas');
  const burbujasPreguntaTexto = document.getElementById('burbujas-pregunta-texto');
  const burbujasEscenario = document.getElementById('burbujas-escenario');
  const burbujasVidasEl = document.getElementById('burbujas-vidas');
  const burbujasPuntosEl = document.getElementById('burbujas-puntos');
  const burbujasRecordEl = document.getElementById('burbujas-record');
  const burbujasResultadoTexto = document.getElementById('burbujas-resultado-texto');
  const burbujasFeedbackEl = document.getElementById('burbujas-feedback');
  const botonesTablaBurbujas = document.querySelectorAll('.btn-tabla-burbujas');

  let tablaBurbujasSeleccionada = 'todas';
  let vidasBurbujas = 3;
  let puntosBurbujas = 0;
  let aciertosBurbujas = 0;
  let operacionCorrectaBurbujas = 0;
  let factorABurbujas = 0;
  let factorBBurbujas = 0;
  let animacionBurbujasId = null;
  let listaBurbujasActivas = [];
  let rondaActivaBurbujas = false;
  let feedbackTimeoutBurbujas = null;

  function obtenerRecordBurbujas() {
    const r = localStorage.getItem('multifacil_record_burbujas');
    return r ? parseInt(r, 10) : 0;
  }

  function guardarRecordBurbujas(puntos) {
    if (puntos > obtenerRecordBurbujas()) {
      localStorage.setItem('multifacil_record_burbujas', puntos);
    }
  }

  function actualizarVidasBurbujasUI() {
    if (!burbujasVidasEl) return;
    const llenos = '❤️'.repeat(Math.max(0, vidasBurbujas));
    const vacios = '🤍'.repeat(Math.max(0, 3 - vidasBurbujas));
    burbujasVidasEl.textContent = llenos + vacios;
  }

  function mostrarFeedbackBurbujas(mensaje) {
    if (!burbujasFeedbackEl) return;
    burbujasFeedbackEl.textContent = mensaje;
    burbujasFeedbackEl.style.display = 'inline-block';
    if (feedbackTimeoutBurbujas) clearTimeout(feedbackTimeoutBurbujas);
    feedbackTimeoutBurbujas = setTimeout(() => {
      burbujasFeedbackEl.style.display = 'none';
    }, 2200);
  }

  function calcularVelocidadBurbujas() {
    // Sube la velocidad suavemente cada 5 aciertos
    const incremento = Math.floor(aciertosBurbujas / 5) * 0.35;
    return 1.1 + incremento;
  }

  function siguientePreguntaBurbujas() {
    if (vidasBurbujas <= 0) return;
    rondaActivaBurbujas = true;

    if (animacionBurbujasId) cancelAnimationFrame(animacionBurbujasId);
    listaBurbujasActivas.forEach(b => {
      if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
    });
    listaBurbujasActivas = [];

    if (tablaBurbujasSeleccionada === 'todas') {
      factorABurbujas = Math.floor(Math.random() * 9) + 2; // 2 al 10
      factorBBurbujas = Math.floor(Math.random() * 9) + 2; // 2 al 10
    } else {
      factorABurbujas = parseInt(tablaBurbujasSeleccionada, 10);
      factorBBurbujas = Math.floor(Math.random() * 9) + 2; // 2 al 10
    }

    operacionCorrectaBurbujas = factorABurbujas * factorBBurbujas;
    if (burbujasPreguntaTexto) {
      burbujasPreguntaTexto.textContent = `${factorABurbujas} × ${factorBBurbujas} = ?`;
    }

    const valores = new Set([operacionCorrectaBurbujas]);
    const offsetsPosibles = [-3, -2, -1, 1, 2, 3, factorABurbujas, -factorABurbujas];
    while (valores.size < 4) {
      const off = offsetsPosibles[Math.floor(Math.random() * offsetsPosibles.length)];
      const fake = Math.max(2, operacionCorrectaBurbujas + off);
      if (fake !== operacionCorrectaBurbujas) {
        valores.add(fake);
      }
    }

    const valoresArray = Array.from(valores).sort(() => Math.random() - 0.5);
    if (Math.random() > 0.6 && valoresArray.length >= 4) {
      valoresArray[valoresArray.length - 1] = operacionCorrectaBurbujas;
    }

    const anchoEscenario = burbujasEscenario.clientWidth || 600;
    const altoEscenario = burbujasEscenario.clientHeight || 400;
    const pasoX = (anchoEscenario - 100) / (valoresArray.length - 1 || 1);
    const clasesColores = ['', 'color-rosa', 'color-amarillo', 'color-morado', 'color-verde'];
    const velBase = calcularVelocidadBurbujas();

    valoresArray.forEach((val, idx) => {
      const el = document.createElement('div');
      const colorClase = clasesColores[Math.floor(Math.random() * clasesColores.length)];
      el.className = `burbuja ${colorClase}`.trim();
      el.textContent = val;

      const posX = 20 + idx * pasoX + (Math.random() * 20 - 10);
      const posY = altoEscenario + 10 + (idx * 50) + Math.random() * 30;
      const speed = velBase + (Math.random() * 0.3 - 0.15);

      el.style.left = `${Math.max(10, Math.min(anchoEscenario - 90, posX))}px`;
      el.style.top = `${posY}px`;

      const esCorrecta = (val === operacionCorrectaBurbujas);

      const objetoBurbuja = {
        el,
        x: posX,
        y: posY,
        speed: Math.max(0.9, speed),
        valor: val,
        esCorrecta,
        popped: false
      };

      el.addEventListener('click', () => tocarBurbuja(objetoBurbuja));
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        tocarBurbuja(objetoBurbuja);
      }, { passive: false });

      burbujasEscenario.appendChild(el);
      listaBurbujasActivas.push(objetoBurbuja);
    });

    animarBurbujas();
  }

  function animarBurbujas() {
    let algunaCorrectaEscapo = false;

    listaBurbujasActivas.forEach(b => {
      if (!b.popped) {
        b.y -= b.speed;
        b.el.style.top = `${b.y}px`;

        if (b.y < -90) {
          b.popped = true;
          if (b.el.parentNode) b.el.parentNode.removeChild(b.el);

          if (b.esCorrecta && rondaActivaBurbujas) {
            algunaCorrectaEscapo = true;
          }
        }
      }
    });

    if (algunaCorrectaEscapo && rondaActivaBurbujas) {
      rondaActivaBurbujas = false;
      vidasBurbujas--;
      sonarError();
      actualizarVidasBurbujasUI();
      mostrarFeedbackBurbujas('¡Se escapó la burbuja correcta! ❤️-1');

      if (vidasBurbujas <= 0) {
        finalizarJuegoBurbujas();
        return;
      } else {
        setTimeout(siguientePreguntaBurbujas, 700);
        return;
      }
    }

    const quedanBurbujas = listaBurbujasActivas.some(b => !b.popped);
    if (!quedanBurbujas && rondaActivaBurbujas && vidasBurbujas > 0) {
      siguientePreguntaBurbujas();
      return;
    }

    if (vidasBurbujas > 0 && rondaActivaBurbujas) {
      animacionBurbujasId = requestAnimationFrame(animarBurbujas);
    }
  }

  function tocarBurbuja(b) {
    if (b.popped || !rondaActivaBurbujas) return;

    if (b.esCorrecta) {
      b.popped = true;
      rondaActivaBurbujas = false;
      sonarPopBurbuja();
      sonarAcierto();
      b.el.classList.add('pop-anim');

      puntosBurbujas += 10;
      aciertosBurbujas++;
      sumarPuntosGlobales(10);

      if (burbujasPuntosEl) burbujasPuntosEl.textContent = puntosBurbujas;
      guardarRecordBurbujas(puntosBurbujas);
      if (burbujasRecordEl) burbujasRecordEl.textContent = obtenerRecordBurbujas();

      mostrarFeedbackBurbujas('✨ ¡Muy bien! +10 puntos');

      setTimeout(() => {
        if (b.el.parentNode) b.el.parentNode.removeChild(b.el);
        siguientePreguntaBurbujas();
      }, 450);
    } else {
      sonarTono(240, 'sine', 0.18, 0);
      b.el.classList.add('shake-anim');
      setTimeout(() => {
        b.el.classList.remove('shake-anim');
      }, 420);
      mostrarFeedbackBurbujas('¡Casi! Inténtalo de nuevo 💡');
    }
  }

  function iniciarJuegoBurbujas() {
    vidasBurbujas = 3;
    puntosBurbujas = 0;
    aciertosBurbujas = 0;
    actualizarVidasBurbujasUI();

    if (burbujasPuntosEl) burbujasPuntosEl.textContent = '0';
    if (burbujasRecordEl) burbujasRecordEl.textContent = obtenerRecordBurbujas();

    if (burbujasInicioEl) burbujasInicioEl.style.display = 'none';
    if (burbujasFinEl) burbujasFinEl.style.display = 'none';
    if (burbujasJuegoEl) burbujasJuegoEl.style.display = 'block';

    siguientePreguntaBurbujas();
  }

  function finalizarJuegoBurbujas() {
    rondaActivaBurbujas = false;
    if (animacionBurbujasId) cancelAnimationFrame(animacionBurbujasId);
    sonarVictoria();
    guardarRecordBurbujas(puntosBurbujas);

    if (burbujasJuegoEl) burbujasJuegoEl.style.display = 'none';
    if (burbujasFinEl) burbujasFinEl.style.display = 'block';
    if (burbujasResultadoTexto) {
      burbujasResultadoTexto.innerHTML = `¡Lograste <strong>${puntosBurbujas} puntos</strong> con <strong>${aciertosBurbujas} burbujas</strong> acertadas!<br>Récord guardado: <strong>${obtenerRecordBurbujas()} pts</strong> 🏆`;
    }
  }

  if (btnIniciarBurbujas) btnIniciarBurbujas.addEventListener('click', iniciarJuegoBurbujas);
  if (btnReiniciarBurbujas) btnReiniciarBurbujas.addEventListener('click', iniciarJuegoBurbujas);

  botonesTablaBurbujas.forEach(btn => {
    btn.addEventListener('click', () => {
      tablaBurbujasSeleccionada = btn.getAttribute('data-tabla');
      botonesTablaBurbujas.forEach(b => {
        b.classList.toggle('activa', b.getAttribute('data-tabla') === tablaBurbujasSeleccionada);
      });
      if (burbujasJuegoEl && burbujasJuegoEl.style.display === 'block') {
        siguientePreguntaBurbujas();
      }
    });
  });

  if (burbujasRecordEl) burbujasRecordEl.textContent = obtenerRecordBurbujas();

  /* ==========================================================
     8. JUEGO 6: SALTOS DE RANA 🐸
     ========================================================== */
  const ranaProgresoEl = document.getElementById('rana-progreso');
  const ranaPuntosEl = document.getElementById('rana-puntos');
  const ranaEstrellasEl = document.getElementById('rana-estrellas');
  const ranaOperacionDisplay = document.getElementById('rana-operacion-display');
  const ranaTamanoTexto = document.getElementById('rana-tamano-texto');
  const ranaTamanoTexto2 = document.getElementById('rana-tamano-texto2');
  const ranaCantidadTexto = document.getElementById('rana-cantidad-texto');
  const ranaNenufaresContenedor = document.getElementById('rana-nenufares-contenedor');
  const btnRanaSaltar = document.getElementById('btn-rana-saltar');
  const ranaContadorBadge = document.getElementById('rana-contador-badge');
  const ranaAccionSaltar = document.getElementById('rana-accion-saltar');
  const ranaPanelPregunta = document.getElementById('rana-panel-pregunta');
  const ranaOpcionesGrid = document.getElementById('rana-opciones-grid');
  const ranaPistaVisual = document.getElementById('rana-pista-visual');
  const ranaPistaContenido = document.getElementById('rana-pista-contenido');
  const ranaFinEl = document.getElementById('rana-fin');
  const ranaJuegoEl = document.getElementById('rana-juego');
  const btnReiniciarRana = document.getElementById('btn-reiniciar-rana');
  const ranaResultadoTexto = document.getElementById('rana-resultado-texto');
  const botonesTablaRana = document.querySelectorAll('.btn-tabla-rana');

  let tablaRanaSeleccionada = 'todas';
  let ejercicioActualRana = 1;
  const TOTAL_EJERCICIOS_RANA = 10;
  let puntosRana = 0;
  let aciertosRana = 0;
  let tamanoSaltoRana = 4;
  let cantidadSaltosRana = 3;
  let saltoActualRana = 0;
  let resultadoCorrectoRana = 12;
  let puedeSaltarRana = true;
  let frogPersonajeEl = null;

  function obtenerEstrellasRana(aciertos) {
    if (aciertos >= 8) return '⭐⭐⭐';
    if (aciertos >= 5) return '⭐⭐';
    return '⭐';
  }

  function iniciarPartidaRana(tabla = tablaRanaSeleccionada) {
    tablaRanaSeleccionada = tabla;
    ejercicioActualRana = 1;
    puntosRana = 0;
    aciertosRana = 0;

    botonesTablaRana.forEach(btn => {
      btn.classList.toggle('activa', btn.getAttribute('data-tabla') === tablaRanaSeleccionada);
    });

    if (ranaPuntosEl) ranaPuntosEl.textContent = '0';
    if (ranaEstrellasEl) ranaEstrellasEl.textContent = '⭐⭐⭐';
    if (ranaFinEl) ranaFinEl.style.display = 'none';
    if (ranaJuegoEl) ranaJuegoEl.style.display = 'block';

    cargarEjercicioRana();
  }

  function cargarEjercicioRana() {
    saltoActualRana = 0;
    puedeSaltarRana = true;

    if (tablaRanaSeleccionada === 'todas') {
      tamanoSaltoRana = Math.floor(Math.random() * 9) + 2; // 2 al 10
    } else {
      tamanoSaltoRana = parseInt(tablaRanaSeleccionada, 10);
    }
    cantidadSaltosRana = Math.floor(Math.random() * 4) + 2; // 2 al 5
    resultadoCorrectoRana = tamanoSaltoRana * cantidadSaltosRana;

    if (ranaProgresoEl) ranaProgresoEl.textContent = `${ejercicioActualRana} / ${TOTAL_EJERCICIOS_RANA}`;
    if (ranaOperacionDisplay) ranaOperacionDisplay.textContent = `${tamanoSaltoRana} × ${cantidadSaltosRana} = ?`;
    if (ranaTamanoTexto) ranaTamanoTexto.textContent = tamanoSaltoRana;
    if (ranaTamanoTexto2) ranaTamanoTexto2.textContent = tamanoSaltoRana;
    if (ranaCantidadTexto) ranaCantidadTexto.textContent = cantidadSaltosRana;
    if (ranaContadorBadge) ranaContadorBadge.textContent = `(Salto 0 de ${cantidadSaltosRana})`;

    if (ranaAccionSaltar) ranaAccionSaltar.style.display = 'block';
    if (ranaPanelPregunta) ranaPanelPregunta.style.display = 'none';
    if (ranaPistaVisual) ranaPistaVisual.style.display = 'none';

    renderizarEstanqueRana();
  }

  function renderizarEstanqueRana() {
    if (!ranaNenufaresContenedor) return;
    ranaNenufaresContenedor.innerHTML = '';

    const nenufar0 = document.createElement('div');
    nenufar0.className = 'nenufar-caja';
    nenufar0.id = 'nenufar-caja-0';
    nenufar0.innerHTML = `
      <div class="nenufar-disco activo" id="nenufar-disco-0">0</div>
      <span class="nenufar-paso-etiqueta">Inicio</span>
    `;
    ranaNenufaresContenedor.appendChild(nenufar0);

    for (let i = 1; i <= cantidadSaltosRana; i++) {
      const nBox = document.createElement('div');
      nBox.className = 'nenufar-caja';
      nBox.id = `nenufar-caja-${i}`;
      nBox.innerHTML = `
        <div class="nenufar-disco" id="nenufar-disco-${i}">?</div>
        <span class="nenufar-paso-etiqueta">Salto ${i}</span>
      `;
      ranaNenufaresContenedor.appendChild(nBox);
    }

    frogPersonajeEl = document.createElement('div');
    frogPersonajeEl.className = 'rana-personaje';
    frogPersonajeEl.id = 'rana-personaje';
    frogPersonajeEl.textContent = '🐸';
    nenufar0.appendChild(frogPersonajeEl);
  }

  function ejecutarSaltoRana() {
    if (!puedeSaltarRana || saltoActualRana >= cantidadSaltosRana) return;
    puedeSaltarRana = false;

    saltoActualRana++;
    sonarSaltoRana();

    if (ranaContadorBadge) {
      ranaContadorBadge.textContent = `(Salto ${saltoActualRana} de ${cantidadSaltosRana})`;
    }

    const siguienteCaja = document.getElementById(`nenufar-caja-${saltoActualRana}`);
    const siguienteDisco = document.getElementById(`nenufar-disco-${saltoActualRana}`);

    if (frogPersonajeEl) {
      frogPersonajeEl.classList.add('saltando');
    }

    setTimeout(() => {
      if (siguienteCaja && frogPersonajeEl) {
        siguienteCaja.appendChild(frogPersonajeEl);
        frogPersonajeEl.classList.remove('saltando');
      }

      if (siguienteDisco) {
        siguienteDisco.classList.add('activo', 'visitado');
        const valorAcumulado = saltoActualRana * tamanoSaltoRana;
        siguienteDisco.textContent = valorAcumulado;
        sonarTono(320 + saltoActualRana * 60, 'triangle', 0.15, 0);
      }

      if (saltoActualRana >= cantidadSaltosRana) {
        setTimeout(mostrarPreguntaRana, 400);
      } else {
        puedeSaltarRana = true;
      }
    }, 420);
  }

  function mostrarPreguntaRana() {
    if (ranaAccionSaltar) ranaAccionSaltar.style.display = 'none';
    if (ranaPanelPregunta) ranaPanelPregunta.style.display = 'block';

    const opciones = new Set([resultadoCorrectoRana]);
    const offsets = [tamanoSaltoRana, -tamanoSaltoRana, 2, -2, tamanoSaltoRana * 2];
    while (opciones.size < 3) {
      const off = offsets[Math.floor(Math.random() * offsets.length)];
      const fake = Math.max(2, resultadoCorrectoRana + off);
      if (fake !== resultadoCorrectoRana) opciones.add(fake);
    }

    const opcionesArray = Array.from(opciones).sort(() => Math.random() - 0.5);

    if (ranaOpcionesGrid) {
      ranaOpcionesGrid.innerHTML = '';
      opcionesArray.forEach(val => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-opcion-rana';
        btn.textContent = val;
        btn.addEventListener('click', () => verificarRespuestaRana(val));
        ranaOpcionesGrid.appendChild(btn);
      });
    }
  }

  function verificarRespuestaRana(elegido) {
    if (elegido === resultadoCorrectoRana) {
      sonarAcierto();
      if (frogPersonajeEl) frogPersonajeEl.classList.add('celebrando');
      puntosRana += 10;
      aciertosRana++;
      sumarPuntosGlobales(10);

      if (ranaPuntosEl) ranaPuntosEl.textContent = puntosRana;
      if (ranaEstrellasEl) ranaEstrellasEl.textContent = obtenerEstrellasRana(aciertosRana);

      setTimeout(() => {
        if (frogPersonajeEl) frogPersonajeEl.classList.remove('celebrando');
        if (ejercicioActualRana < TOTAL_EJERCICIOS_RANA) {
          ejercicioActualRana++;
          cargarEjercicioRana();
        } else {
          finalizarPartidaRana();
        }
      }, 1200);
    } else {
      sonarError();
      const sumaTexto = new Array(cantidadSaltosRana).fill(tamanoSaltoRana).join(' + ');

      if (ranaPistaContenido) {
        ranaPistaContenido.innerHTML = `¡Casi! Diste <strong>${cantidadSaltosRana} saltos de ${tamanoSaltoRana} en ${tamanoSaltoRana}</strong>.<br>Es lo mismo que sumar: ${sumaTexto} = <strong>${resultadoCorrectoRana}</strong>.<br>¡Inténtalo otra vez! 👇`;
      }
      if (ranaPistaVisual) ranaPistaVisual.style.display = 'flex';

      for (let i = 1; i <= cantidadSaltosRana; i++) {
        const d = document.getElementById(`nenufar-disco-${i}`);
        if (d) d.classList.add('resaltado-pista');
      }
    }
  }

  function finalizarPartidaRana() {
    sonarVictoria();
    const estrellas = obtenerEstrellasRana(aciertosRana);
    const rAntiguo = localStorage.getItem('multifacil_record_rana') || 0;
    if (puntosRana > parseInt(rAntiguo, 10)) {
      localStorage.setItem('multifacil_record_rana', puntosRana);
    }

    if (ranaJuegoEl) ranaJuegoEl.style.display = 'none';
    if (ranaFinEl) ranaFinEl.style.display = 'block';
    if (ranaResultadoTexto) {
      ranaResultadoTexto.innerHTML = `¡Completaste los 10 ejercicios con <strong>${aciertosRana} aciertos</strong>!<br>Puntaje obtenido: <strong>${puntosRana} puntos</strong> (${estrellas})<br>Récord guardado: <strong>${localStorage.getItem('multifacil_record_rana')} pts</strong> 🏆`;
    }
  }

  if (btnRanaSaltar) {
    btnRanaSaltar.addEventListener('click', ejecutarSaltoRana);
  }

  if (btnReiniciarRana) {
    btnReiniciarRana.addEventListener('click', () => {
      iniciarPartidaRana(tablaRanaSeleccionada);
    });
  }

  botonesTablaRana.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabla = btn.getAttribute('data-tabla');
      iniciarPartidaRana(tabla);
    });
  });

  // Inicializar rana lista en segundo plano
  iniciarPartidaRana('todas');
});
