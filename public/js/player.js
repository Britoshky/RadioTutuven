const playBtn = document.getElementById("playBtn");
const link = new Audio();
let isPlaying = false;

if (playBtn == null) {
  console.log("playBtn es nulo");
} else {
  // Establecer el texto inicial para el botón
  playBtn.innerHTML = '<div class="animated-text">Escucha aquí</div>';

  playBtn.addEventListener("click", async () => {
    if (isPlaying) {
      link.pause();
      // Asegurarse de que el contenido se actualice correctamente a "Escucha aquí"
      playBtn.innerHTML = '<div class="animated-text">Escucha aquí</div>';
    } else {
      // Mostrar un indicador de carga mientras el audio se carga
      playBtn.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Cargando';
      link.src = "http://186.67.77.165:8000/radiotutuven";

      // Agregar el evento sólo una vez para evitar múltiples instancias
      link.addEventListener("loadeddata", () => {
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausa';
      }, { once: true });

      await link.play();
    }
    isPlaying = !isPlaying;
  });
}
