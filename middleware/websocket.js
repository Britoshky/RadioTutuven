const WebSocket = require('ws');
const Chat = require('../models/Chat');

// Función de middleware WebSocket
function WebSocketMiddleware(req, res, next) {
  const wss = new WebSocket.Server({ noServer: true });

  // Manejar las conexiones WebSocket
  wss.on('connection', ws => {
    // Manejar mensajes WebSocket
    ws.on('message', async message => {
      try {
        // Guardar el mensaje en la base de datos
        const newChatMessage = new Chat({
          message: message,
          sender: 'Nombre del remitente' // Puedes cambiar esto según sea necesario
        });
        await newChatMessage.save();

        // Reenviar el mensaje a todos los clientes conectados
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
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
