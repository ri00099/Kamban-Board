const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const {
  getWorkspaces,
  createWorkspace,
  inviteMember,
} = require("../controllers/workspace.controller");

// Attach io to req so controllers can emit events
router.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});


router.get("/", auth, getWorkspaces);


router.post("/", auth, createWorkspace);


router.post("/:id/invite", auth, inviteMember);

module.exports = router;