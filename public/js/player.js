const playBtn = document.getElementById("playBtn");
const link = new Audio();
let isPlaying = false;
let retryCount = 0;
const maxRetries = 3;

// URLs de streams alternativos (agregar más si tienes disponibles)
const streamUrls = [
    "https://stream.cloudmusic.cl/listen/radio_tutuven/radio.mp3",
    "https://stream.cloudmusic.cl/listen/radio_tutuven/radio.aac", // URL alternativa si existe
];

// Configurar el audio para mejor compatibilidad con Chrome
link.crossOrigin = "anonymous";
link.preload = "none";

// Función para intentar reproducir con diferentes URLs
async function tryPlayStream(urlIndex = 0) {
    if (urlIndex >= streamUrls.length) {
        throw new Error("No hay más URLs disponibles para intentar");
    }

    return new Promise((resolve, reject) => {
        link.src = streamUrls[urlIndex];
        
        const onLoadedData = () => {
            cleanup();
            resolve();
        };

        const onError = () => {
            cleanup();
            console.warn(`Error con URL ${streamUrls[urlIndex]}, intentando siguiente...`);
            tryPlayStream(urlIndex + 1).then(resolve).catch(reject);
        };

        const cleanup = () => {
            link.removeEventListener("loadeddata", onLoadedData);
            link.removeEventListener("error", onError);
        };

        link.addEventListener("loadeddata", onLoadedData, { once: true });
        link.addEventListener("error", onError, { once: true });
        
        link.load();
    });
}

if (playBtn == null) {
    console.log("playBtn es nulo");
} else {
    playBtn.addEventListener("click", async () => {
        if (isPlaying) {
            link.pause();
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i><div class="animated-text">ESCUCHA AQUÍ</div>';
            isPlaying = false;
        } else {
            try {
                playBtn.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div>  Cargando';
                
                // Intentar cargar el stream
                await tryPlayStream();
                
                // Si llegamos aquí, el stream se cargó correctamente
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <div class="animated-text"> PAUSA</div>';
                
                // Intentar reproducir
                await link.play();
                isPlaying = true;
                retryCount = 0; // Resetear contador de reintentos

            } catch (error) {
                console.error("Error al reproducir audio:", error);
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i><div class="animated-text">ESCUCHA AQUÍ</div>';
                
                // Manejo de errores específicos
                if (error.name === 'NotAllowedError') {
                    // El usuario necesita permitir autoplay
                    showUserMessage('Por favor, permite la reproducción de audio en tu navegador. Haz clic aquí para intentar de nuevo.');
                } else if (error.name === 'NotSupportedError') {
                    showUserMessage('Tu navegador no soporta la reproducción de este formato de audio. Intenta con otro navegador.');
                } else if (error.message.includes("No hay más URLs")) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        showUserMessage(`Error de conexión. Reintentando... (${retryCount}/${maxRetries})`);
                        setTimeout(() => {
                            if (!isPlaying) { // Solo reintentar si no se está reproduciendo
                                playBtn.click();
                            }
                        }, 2000);
                    } else {
                        showUserMessage('No se puede conectar al servidor de streaming. Por favor, intenta más tarde.');
                        retryCount = 0;
                    }
                } else {
                    showUserMessage('Error de reproducción. Por favor, intenta de nuevo.');
                }
            }
        }
    });

    // Manejar desconexiones durante la reproducción
    link.addEventListener('error', () => {
        if (isPlaying) {
            console.log("Error durante la reproducción, intentando reconectar...");
            isPlaying = false;
            playBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i><div class="animated-text">RECONECTANDO</div>';
            
            setTimeout(() => {
                if (!isPlaying) {
                    playBtn.click(); // Intentar reconectar
                }
            }, 3000);
        }
    });

    // Función auxiliar para mostrar mensajes al usuario
    function showUserMessage(message) {
        const originalContent = playBtn.innerHTML;
        playBtn.innerHTML = `<i class="fa-solid fa-info-circle"></i><div class="animated-text" style="font-size: 0.8em;">${message}</div>`;
        
        setTimeout(() => {
            playBtn.innerHTML = originalContent;
        }, 4000);
    }
}