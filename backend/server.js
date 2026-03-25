// server.js  (your updated entry point)
require("dotenv").config();
const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const initSocket = require("./src/sockets/socket");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

initSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
