import Ws from 'App/Services/Ws';

Ws.boot();

/**
 * Listen for incoming socket connections
 */

Ws.io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle custom events
  socket.on('sendMessage', async (data) => {
    console.log('Message received:', data);
    // Broadcast the message to the recipient
    socket.to(data.friendId).emit('receiveMessage', data);
  });

    // Handle custom events
    socket.on('receiveMessage', async (data) => {
      console.log('Message received:', data);
    });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
