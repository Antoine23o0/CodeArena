const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    socket.on('scoreboard:subscribe', ({ contestId }) => {
      if (contestId === 'global') {
        socket.join('scoreboard:global');
        return;
      }
      if (contestId) {
        socket.join(`contest:${contestId}`);
      }
    });

    socket.on('scoreboard:unsubscribe', ({ contestId }) => {
      if (contestId === 'global') {
        socket.leave('scoreboard:global');
        return;
      }
      if (contestId) {
        socket.leave(`contest:${contestId}`);
      }
    });
  });
};

export default registerSocketHandlers;

