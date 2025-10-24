const playBtn = document.getElementById("playBtn");
const link = new Audio();
let isPlaying = false;
let retryCount = 0;
const maxRetries = 3;

// URLs de streams alternativos - añadir más formatos y servidores
const streamUrls = [
    "https://stream.cloudmusic.cl/listen/radio_tutuven/radio.mp3",
    "https://stream.cloudmusic.cl/listen/radio_tutuven/radio.aac",
    "https://stream.cloudmusic.cl:8000/radio_tutuven", // Puerto alternativo
    "https://stream.cloudmusic.cl/radio_tutuven.mp3", // URL simplificada
    "https://stream.cloudmusic.cl/radio_tutuven", // Sin extensión
];

// Configurar el audio para mejor compatibilidad con Chrome
link.crossOrigin = "anonymous";
link.preload = "none";

// Función para verificar conectividad básica
async function checkStreamServer() {
    try {
        const response = await fetch("https://stream.cloudmusic.cl/", { 
            method: 'HEAD', 
            mode: 'no-cors',
            cache: 'no-cache'
        });
        return true;
    } catch (error) {
        console.warn('Servidor de streaming no accesible:', error);
        return false;
    }
}

// Función para intentar reproducir con diferentes URLs
async function tryPlayStream(urlIndex = 0) {
    if (urlIndex >= streamUrls.length) {
        throw new Error("No hay más URLs disponibles para intentar");
    }

    return new Promise((resolve, reject) => {
        link.src = streamUrls[urlIndex];
        
        // Timeout para evitar esperas largas
        const timeout = setTimeout(() => {
            cleanup();
            console.warn(`Timeout con URL ${streamUrls[urlIndex]}, intentando siguiente...`);
            tryPlayStream(urlIndex + 1).then(resolve).catch(reject);
        }, 10000); // 10 segundos timeout
        
        const onLoadedData = () => {
            clearTimeout(timeout);
            cleanup();
            resolve();
        };

        const onError = () => {
            clearTimeout(timeout);
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
                        showUserMessage(`Servidor temporalmente no disponible. Reintentando... (${retryCount}/${maxRetries})`);
                        setTimeout(() => {
                            if (!isPlaying) { // Solo reintentar si no se está reproduciendo
                                playBtn.click();
                            }
                        }, 5000); // Esperar 5 segundos antes de reintentar
                    } else {
                        showUserMessage('El servidor de streaming no está disponible. Revisa tu conexión a internet o intenta más tarde.');
                        retryCount = 0;
                    }
                } else {
                    showUserMessage('Error de reproducción. Verifica tu conexión a internet.');
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