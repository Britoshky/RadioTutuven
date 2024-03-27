const WebSocket = require('ws');
const Chat = require('../models/Chat');

function configureWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    console.log('Conexión WebSocket establecida');
    ws.on('message', async message => {
      try {
        const newChatMessage = new Chat({
          message: message,
          sender: 'Nombre del remitente'
        });
        console.log("Mensaje enviado");
        await newChatMessage.save();
      } catch (error) {
        console.error('Error al guardar el mensaje en la base de datos:', error);
        return;
      }

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  });

  return wss;
}

module.exports = configureWebSocket;
