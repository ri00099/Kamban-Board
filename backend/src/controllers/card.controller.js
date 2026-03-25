const Card = require("../models/card.model");

exports.createCard = async (req, res) => {
  try {
    const { title, description, status, boardId, columnId, position } =
      req.body;

    // Basic Validation
    if (!title || !boardId) {
      return res.status(400).json({ msg: "Title and Board ID are required" });
    }

    const card = await Card.create({
      title,
      description,
      status: status || "todo",
      boardId,
      columnId: columnId || "default", // Fallback
      position: position || 0,
    });

    res.status(201).json(card);
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(400).json({ msg: err.message });
  }
};


exports.updateCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(">>> PATCH received", { id, status, fullBody: req.body });

    const validStatuses = ["todo", "in-progress", "done"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value." });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { $set: { status }, $inc: { version: 1 } },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ msg: "Card not found." });
    }

    return res.status(200).json(updatedCard);
  } catch (err) {
    console.error("updateCardStatus error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, columnId, version } = req.body;

    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ msg: "Card not found" });


    if (card.version !== version) {
      return res.status(409).json({
        msg: "Version conflict: This card has been modified by another user. Please refresh.",
        currentVersion: card.version,
      });
    }


    await Card.updateMany(
      {
        columnId: columnId,
        position: { $gte: position },
        _id: { $ne: id },
      },
      { $inc: { position: 1 } },
    );


    card.position = position;
    card.columnId = columnId;
    card.version += 1;

    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err.message);
    if (err.name === "CastError")
      return res.status(400).json({ msg: "Invalid Card ID" });
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: "Card not found" });

    await card.deleteOne();
    res.json({ msg: "Card removed" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
