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
  const vistaDibujo = document.getElementById('vista-dibujo-magico');
  const vistaCarrera = document.getElementById('vista-carrera-60');
  const vistaMemoria = document.getElementById('vista-memoria');

  function activarJuego(nombre) {
    if (nombre === 'dibujo') {
      tabDibujo.classList.add('activa');
      tabCarrera.classList.remove('activa');
      if (tabMemoria) tabMemoria.classList.remove('activa');
      vistaDibujo.style.display = 'block';
      vistaCarrera.style.display = 'none';
      if (vistaMemoria) vistaMemoria.style.display = 'none';
      const input = document.getElementById('input-resultado');
      if (input) setTimeout(() => input.focus(), 150);
    } else if (nombre === 'carrera') {
      tabCarrera.classList.add('activa');
      tabDibujo.classList.remove('activa');
      if (tabMemoria) tabMemoria.classList.remove('activa');
      vistaCarrera.style.display = 'block';
      vistaDibujo.style.display = 'none';
      if (vistaMemoria) vistaMemoria.style.display = 'none';
    } else if (nombre === 'memoria') {
      if (tabMemoria) tabMemoria.classList.add('activa');
      tabDibujo.classList.remove('activa');
      tabCarrera.classList.remove('activa');
      if (vistaMemoria) vistaMemoria.style.display = 'block';
      vistaDibujo.style.display = 'none';
      vistaCarrera.style.display = 'none';
    }
  }

  if (tabDibujo) tabDibujo.addEventListener('click', () => activarJuego('dibujo'));
  if (tabCarrera) tabCarrera.addEventListener('click', () => activarJuego('carrera'));
  if (tabMemoria) tabMemoria.addEventListener('click', () => activarJuego('memoria'));

  // Enlaces de tarjetas principales
  const btnDibujoCard = document.getElementById('btn-dibujo-magico');
  const btnCarreraCard = document.getElementById('btn-carrera-jugar');
  const btnMemoriaCard = document.getElementById('btn-memoria-jugar');
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
});
