const playBtn = document.getElementById("playBtn");
const link = new Audio();
let isPlaying = false;
let retryCount = 0;
const maxRetries = 3;

// URL del stream de radio - URL oficial confirmada
const streamUrls = [
    "https://stream.cloudmusic.cl/listen/radio_tutuven/radio.mp3"
];

// Configurar el audio para mejor compatibilidad con Chrome
link.crossOrigin = "anonymous";
link.preload = "none";

// Función para verificar conectividad del servidor de streaming
async function checkStreamServer() {
    try {
        const response = await fetch("https://stream.cloudmusic.cl/listen/radio_tutuven/radio.mp3", { 
            method: 'HEAD', 
            mode: 'no-cors',
            cache: 'no-cache'
        });
        return true;
    } catch (error) {
        console.warn('Servidor de streaming Radio Tutuven no accesible:', error);
        return false;
    }
}

// Función para intentar reproducir el stream
async function tryPlayStream() {
    return new Promise((resolve, reject) => {
        link.src = streamUrls[0]; // Usar la URL oficial
        
        // Timeout para evitar esperas largas
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Timeout al conectar con el servidor de streaming"));
        }, 15000); // 15 segundos timeout para streaming
        
        const onLoadedData = () => {
            clearTimeout(timeout);
            cleanup();
            resolve();
        };

        const onError = () => {
            clearTimeout(timeout);
            cleanup();
            reject(new Error("Error al conectar con el servidor de streaming"));
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
                } else if (error.message.includes("Timeout") || error.message.includes("Error al conectar")) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        showUserMessage(`Servidor temporalmente no disponible. Reintentando... (${retryCount}/${maxRetries})`);
                        setTimeout(() => {
                            if (!isPlaying) { // Solo reintentar si no se está reproduciendo
                                playBtn.click();
                            }
                        }, 3000); // Esperar 3 segundos antes de reintentar
                    } else {
                        showUserMessage('El servidor de Radio Tutuven no está disponible. Revisa tu conexión a internet o intenta más tarde.');
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