const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getAllBoard,
  getBoardById, 
  createBoard,
  deleteBoardById,
} = require("../controllers/board.controller");

const { getBoardActivity } = require("../controllers/activity.controller");


router.get("/", authMiddleware, getAllBoard);


router.post("/", authMiddleware, createBoard);



router.get("/:id", authMiddleware, getBoardById);


router.delete("/:id", authMiddleware, deleteBoardById);

router.get("/:id/activity", authMiddleware, getBoardActivity);


module.exports = router;
