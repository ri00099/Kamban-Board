const Activity = require("../models/activity.model");
const Workspace = require("../models/workspace.model");

exports.getBoardActivity = async (req, res) => {
  try {
    const boardId = req.params.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const sample = await Activity.findOne({ board: boardId });
    if (sample) {
      const workspace = await Workspace.findById(sample.workspace);
      if (workspace) {
        const hasAccess =
          workspace.isOwner(req.user.id) ||
          workspace.isMember(req.user.id);
        if (!hasAccess) {
          return res.status(403).json({ msg: "Access denied" });
        }
      }
    }

    const [activities, total] = await Promise.all([
      Activity.find({ board: boardId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actor", "email name"),
      Activity.countDocuments({ board: boardId }),
    ]);

    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


exports.logActivity = async ({ board, workspace, actor, action, summary, meta = {} }) => {
  try {
    const activity = await Activity.create({
      board,
      workspace,
      actor,
      action,
      summary,
      meta,
    });
    await activity.populate("actor", "email name");
    return activity;
  } catch (err) {
    console.error("Failed to log activity:", err.message);
    return null;
  }
};