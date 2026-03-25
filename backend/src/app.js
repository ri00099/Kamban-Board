const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const boardRoutes = require("./routes/board.route");
const cardRoutes = require("./routes/card.route");
const workspace = require("./routes/workspace.routes")

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/workspaces", workspace);
app.use("/api/cards", cardRoutes);

module.exports = app;
