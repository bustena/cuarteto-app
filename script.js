let indice = 0;
let datos = [];
let jugadores = 0;
let solucionMostrada = [];
let audioGlobal = new Audio();
let URL_REGLAS = "https://view.genially.com/6834d0143c53b6064031a058?idSlide=7099ad60-bc41-4a7a-83be-0fe6381c3869";
let modoJuego = "";

window.onload = () => {
  fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQs4TXjmTrFMGNTqModfxjqReQFxqSm3Hi7dojisH2PvX6CWoB3Z_AU42VGaHvkjcEysdlYzLpwk9ny/pub?output=csv")
    .then(response => response.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

datos = parsed.data
  .slice(0, 40)  // ← lee solo filas 2 a 41
  .map(fila => ({
    año: fila["Año"],
    autor: fila["Autor"],
    obra: fila["Obra"],
    url: fila["URL"],
    color: fila["COLOR"]
  }))
  .sort(() => Math.random() - 0.5);

      solucionMostrada = new Array(datos.length).fill(false);
      document.getElementById("cargando").classList.add("hidden");
      document.getElementById("seleccionModo").classList.remove("hidden");
    });

  window.focus();

  document.addEventListener("keydown", function(event) {
    if (document.activeElement.tagName === "INPUT") return;

    const key = event.key;
    switch (key) {
      case "ArrowRight":
        const btnNext = document.getElementById("btnSiguiente");
        if (btnNext && !btnNext.disabled && btnNext.offsetParent !== null) siguiente();
        break;
      case "ArrowLeft":
        const btnPrev = document.getElementById("btnAnterior");
        if (btnPrev && !btnPrev.disabled && btnPrev.offsetParent !== null) anterior();
        else {
          const btnVolver = document.querySelector("#bienvenida button[onclick='volverASeleccionModo()']");
          if (btnVolver && btnVolver.offsetParent !== null) volverASeleccionModo();

          const btnVolverInicio = document.querySelector("#pantallaInicioJuego button[onclick='volverASeleccionModoDesdeInicio()']");
          if (btnVolverInicio && btnVolverInicio.offsetParent !== null) volverASeleccionModoDesdeInicio();
        }
        break;
      case "Enter":
        const btnSol = document.getElementById("btnSolucion");
        const pantallaInicio = document.getElementById("pantallaInicioJuego");
        if (pantallaInicio && pantallaInicio.offsetParent !== null) comenzarJuego();
        else if (btnSol && btnSol.offsetParent !== null) mostrarSolucion();
        break;
      case " ":
        event.preventDefault();
        if (audioGlobal) {
          if (audioGlobal.paused) {
            audioGlobal.play();
          } else {
            audioGlobal.pause();
          }
        }
        break;
      case "2": case "3": case "4": case "5": case "6":
        const bienvenida = document.getElementById("bienvenida");
        if (bienvenida && bienvenida.offsetParent !== null) empezar(parseInt(key));
        break;
    }
  });
};

function abrirReglas() {
  if (URL_REGLAS) window.open(URL_REGLAS, "_blank");
}

function seleccionarModo(modo) {
  document.getElementById("seleccionModo").classList.add("hidden");
  if (modo === "clasico") {
    document.getElementById("bienvenida").classList.remove("hidden");
  } else {
    modoJuego = modo;
    document.getElementById("pantallaInicioJuego").classList.remove("hidden");
  }
}

function empezar(num) {
  jugadores = num;
  document.getElementById("bienvenida").classList.add("hidden");
  document.getElementById("contenido").classList.remove("hidden");
  indice = 0;
  mostrar();
}

function mostrar() {
  if (datos.length === 0) return;
  const item = datos[indice];
  const titulo = document.getElementById("titulo");
  const detalles = document.getElementById("detalles");
  const botones = document.getElementById("botones");
  const solucion = document.getElementById("botonSolucion");

  document.getElementById("audio-container").innerHTML = "";
  detalles.classList.add("invisible");
  solucion.classList.add("hidden");
  botones.style.display = "none";
  document.body.style.backgroundColor = "#dcdcdc";

  if (indice < jugadores) {
    titulo.innerHTML = `<div class="inicio-label">Año de inicio del jugador/equipo ${indice + 1}</div><div class="inicio-anio">${item.año}</div>`;
    botones.style.display = "flex";
    document.getElementById("btnAnterior").style.display = (indice === 0) ? "none" : "inline-block";
    return;
  }

  if (indice === jugadores) {
    document.getElementById("contenido").classList.add("hidden");
    document.getElementById("pantallaInicioJuego").classList.remove("hidden");
    return;
  }

  // a partir de aquí es una obra
  titulo.innerHTML = `Cuarteto de cuerda ${indice - jugadores}`;

  audioGlobal.src = item.url;
  audioGlobal.currentTime = 0;
  audioGlobal.play();

  const cont = document.createElement("div");
  cont.className = "custom-audio-controls";
  cont.innerHTML = `
    <button id="btnRew" class="audio-btn"><i data-lucide="rewind"></i></button>
    <button id="btnPlayPause" class="audio-btn"><i data-lucide="pause"></i></button>
    <button id="btnFf" class="audio-btn"><i data-lucide="fast-forward"></i></button>
  `;
  document.getElementById("audio-container").appendChild(cont);
  lucide.createIcons();

  // botones
  document.getElementById("btnRew").onclick = () => {
    audioGlobal.currentTime = Math.max(0, audioGlobal.currentTime - 5);
  };
  document.getElementById("btnFf").onclick = () => {
    audioGlobal.currentTime = Math.min(audioGlobal.duration, audioGlobal.currentTime + 5);
  };
  document.getElementById("btnPlayPause").onclick = () => {
    const boton = document.getElementById("btnPlayPause");
    if (audioGlobal.paused) {
      audioGlobal.play().then(() => {
        boton.innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
      });
    } else {
      audioGlobal.pause();
      boton.innerHTML = '<i data-lucide="play"></i>';
      lucide.createIcons();
    }
  };

  // eventos para actualizar icono al pausar o al reanudar por otros medios
  audioGlobal.onpause = () => {
    const boton = document.getElementById("btnPlayPause");
    boton.innerHTML = '<i data-lucide="play"></i>';
    lucide.createIcons();
  };
  audioGlobal.onplay = () => {
    const boton = document.getElementById("btnPlayPause");
    boton.innerHTML = '<i data-lucide="pause"></i>';
    lucide.createIcons();
  };

  // mostrar detalles si ya estaba revelada la solución
  if (solucionMostrada[indice]) {
    document.getElementById("anio").textContent = item.año;
    document.getElementById("descripcion").innerHTML = `${item.autor}<br>${item.obra}`;
    detalles.classList.remove("hidden", "invisible");
    if (item.color) document.body.style.backgroundColor = item.color;
    botones.style.display = "flex";
  } else {
    solucion.classList.remove("hidden");
  }
}

function mostrarSolucion() {
  const item = datos[indice];
  solucionMostrada[indice] = true;
  document.getElementById("anio").textContent = item.año;
  document.getElementById("descripcion").innerHTML = `${item.autor}<br>${item.obra}`;
  document.getElementById("detalles").classList.remove("invisible");
  if (item.color) document.body.style.backgroundColor = item.color;
  document.getElementById("botonSolucion").classList.add("hidden");
  document.getElementById("botones").style.display = "flex";
}

function comenzarJuego() {
  document.getElementById("pantallaInicioJuego").classList.add("hidden");
  document.getElementById("contenido").classList.remove("hidden");
  indice++;
  mostrar();
}

function siguiente() {
  if (indice < datos.length - 1) {
    indice++;
    mostrar();
  } else {
    document.getElementById("botones").style.display = "none";
    document.getElementById("reinicio").classList.remove("hidden");
  }
}

function anterior() {
  if (indice > 0) {
    indice--;
    mostrar();
  }
}

function volverASeleccionModo() {
  document.getElementById("bienvenida").classList.add("hidden");
  document.getElementById("seleccionModo").classList.remove("hidden");
}

function volverASeleccionModoDesdeInicio() {
  document.getElementById("pantallaInicioJuego").classList.add("hidden");
  document.getElementById("seleccionModo").classList.remove("hidden");
}
