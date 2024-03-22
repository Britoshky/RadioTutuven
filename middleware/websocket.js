const WebSocket = require('ws');
const Chat = require('../models/Chat');

// Función de middleware WebSocket
function WebSocketMiddleware(req, res, next) {
  // Crear el servidor WebSocket sin vincularlo a un servidor HTTP específico
  const wss = new WebSocket.Server({ noServer: true });

  // Manejo de conexiones WebSocket
  wss.on('connection', ws => {
    ws.on('message', async message => {
      // Guardar el mensaje en la base de datos
      try {
        const newChatMessage = new Chat({
          message: message,
          sender: 'Nombre del remitente' // Puedes cambiar esto según sea necesario
        });
        await newChatMessage.save();
      } catch (error) {
        console.error('Error al guardar el mensaje en la base de datos:', error);
        return;
      }
      // Envía el mensaje a todos los clientes conectados
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  });

  // Adjuntar el servidor WebSocket al objeto de solicitud
  req.wss = wss;

 
}

// Exportar el middleware de WebSocket
module.exports = WebSocketMiddleware;
