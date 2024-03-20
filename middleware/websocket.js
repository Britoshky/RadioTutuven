const WebSocket = require('ws');
const Chat = require('../models/Chat');

// Función de middleware WebSocket
function WebSocketMiddleware(req, res, next) {
  const wss = new WebSocket.Server({ port: 8080 });

  // Manejar las conexiones WebSocket
wss.on('connection', ws => {
    // Manejar mensajes WebSocket
    ws.on('message', async message => {
        try {
            // Obtener la hora actual
            const date = new Date();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const timestamp = `${hours}:${minutes}`;
            
            // Guardar el mensaje en la base de datos junto con la hora
            const newChatMessage = new Chat({
                message: message,
                sender: 'Nombre del remitente', // Puedes cambiar esto según sea necesario
                timestamp: timestamp  // Guarda la hora junto con el mensaje
            });
            await newChatMessage.save();

            // Reenviar el mensaje y la hora a todos los clientes conectados
            const messageWithTimestamp = { message, timestamp }; // Combina el mensaje y la hora en un objeto
            const messageJSON = JSON.stringify(messageWithTimestamp); // Convierte el objeto a JSON
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(messageJSON);
                }
            });
        } catch (error) {
            console.error('Error al guardar el mensaje en la base de datos:', error);
        }
    });
});


  // Adjuntar el servidor WebSocket al objeto de solicitud
  req.wss = wss;

  // Llamar al siguiente middleware
  next();
}

// Exportar el middleware de WebSocket
module.exports = WebSocketMiddleware;
