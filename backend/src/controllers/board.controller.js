const Board = require("../models/board.model");
const Card = require("../models/card.model"); // MUST import the Card model

exports.getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;


    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ msg: "Board not found" });


    if (board.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Not authorized to view this board" });
    }


    const cards = await Card.find({ boardId: id }).sort({ position: 1 });


    res.json({
      ...board._doc,
      cards: cards
    });
  } catch (err) {
    console.error("Fetch Board Error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getAllBoard = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const boards = await Board.find({ createdBy: userId }).lean();


    const boardIds = boards.map((b) => b._id);

    const cardCounts = await Card.aggregate([
      { $match: { boardId: { $in: boardIds } } },
      {
        $group: {
          _id: "$boardId",
          total:    { $sum: 1 },
          done:     { $sum: { $cond: [{ $eq: ["$status", "done"] },        1, 0] } },
          todo:     { $sum: { $cond: [{ $eq: ["$status", "todo"] },        1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
        },
      },
    ]);


    const countMap = {};
    cardCounts.forEach((c) => { countMap[c._id.toString()] = c; });

    const result = boards.map((b) => {
      const counts = countMap[b._id.toString()] || { total: 0, done: 0, todo: 0, inProgress: 0 };
      return {
        ...b,
        cardCount:   counts.total,
        doneCount:   counts.done,
        todoCount:   counts.todo,
        inProgCount: counts.inProgress,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error fetching boards" });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { title, color, colorId } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Please provide a board title" });
    }

    const userId = req.user.id || req.user._id;

    const board = await Board.create({
      title,
      color:   color   || "#F59E0B",
      colorId: colorId || "amber",
      createdBy: userId,
    });

    res.status(201).json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error creating board" });
  }
};

exports.getSingleBoardById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ msg: "Board not found" });
    }


    if (board.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Not authorized to view this board" });
    }

    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error fetching board" });
  }
}

exports.deleteBoardById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const board = await Board.findById(req.params.id);

    if (!board) return res.status(404).json({ msg: "Board not found" });

    if (board.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }


    await Card.deleteMany({ boardId: req.params.id });
    await board.deleteOne();
    
    res.json({ msg: "Board and associated cards deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting board" });
  }
};