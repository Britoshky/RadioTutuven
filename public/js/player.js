const playBtn = document.getElementById("playBtn");
const link = new Audio();
let isPlaying = false;

if (playBtn == null) {
  console.log("playBtn es nulo");
} else {
  playBtn.addEventListener("click", async () => {
    if (isPlaying) {
      link.pause();
      playBtn.innerHTML = '<i class="bi bi-play"></i> Play';
    } else {
      playBtn.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div>  Cargando'; // Agrega "bi-spin" para la animación de rotación
      link.src = "https://stream.chanquinafm.cl/chanquina.mp3";

      // Elimina la animación de rotación cuando se ha cargado el audio
      link.addEventListener("loadeddata", () => {
        playBtn.innerHTML = '<i class="bi bi-pause"></i> Pausa';
        playBtn.classList.remove("bi-spin");
      });

      await link.play();
    }
    isPlaying = !isPlaying;
  });
}
