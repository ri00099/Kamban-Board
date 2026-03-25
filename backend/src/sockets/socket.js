

const jwt = require("jsonwebtoken");

module.exports = function initSocket(io) {

  io.use((socket, next) => {
    try {

      const rawCookie = socket.handshake.headers.cookie || "";
      const tokenMatch = rawCookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (!tokenMatch) return next(new Error("Authentication error: no token"));

      const decoded = jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    console.log(`[socket] connected: ${userId}`);

    socket.join(`user:${userId}`);

    socket.on("board:join", (boardId) => {
      if (!boardId) return;
      socket.join(`board:${boardId}`);
      console.log(`[socket] ${userId} joined board:${boardId}`);
    });

    socket.on("board:leave", (boardId) => {
      if (!boardId) return;
      socket.leave(`board:${boardId}`);
    });


    socket.on("workspace:join", (workspaceId) => {
      if (!workspaceId) return;
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("workspace:leave", (workspaceId) => {
      if (!workspaceId) return;
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on("card:move", (payload) => {
      if (!payload?.boardId) return;

      socket.to(`board:${payload.boardId}`).emit("card:moved", payload);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${userId}`);
    });
  });
};