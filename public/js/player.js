const playBtn = document.getElementById("playBtn");
const link = new Audio();
let isPlaying = false;

if (playBtn == null) {
	console.log("playBtn es nulo");
} else {
	playBtn.addEventListener("click", async () => {
		if (isPlaying) {
			link.pause();
			playBtn.innerHTML = '<i class="fa-solid fa-play"></i><button id="playBtn" class="btn btn-light"><p> <div class="animated-text">ESCUCHA AQUÍ</div></p></button></div>';
		} else {
			playBtn.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div>  Cargando'; // Agrega "bi-spin" para la animación de rotación
			link.src = "https://stream.chanquinafm.cl/radiotutuven";

			// Elimina la animación de rotación cuando se ha cargado el audio
			link.addEventListener("loadeddata", () => {
				playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <div class="animated-text"> PAUSA</div>';
				playBtn.classList.remove("bi-spin");
			});

			await link.play();
		}
		isPlaying = !isPlaying;
	});
}