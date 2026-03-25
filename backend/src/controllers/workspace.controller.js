const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");
const Activity = require("../models/activity.model");

exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    })
      .populate("owner", "email name")
      .populate("members.user", "email name")
      .sort({ updatedAt: -1 });

    res.json(workspaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ msg: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: req.user.id,
      members: [{ user: req.user.id, role: "owner" }],
    });

    await workspace.populate("owner", "email name");
    await workspace.populate("members.user", "email name");

    if (req.io) {
      req.io.to(`user:${req.user.id}`).emit("workspace:created", workspace);
    }

    res.status(201).json(workspace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { email, role = "editor" } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });
    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ msg: "Role must be editor or viewer" });
    }

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ msg: "Workspace not found" });

    if (!workspace.isOwner(req.user.id)) {
      return res
        .status(403)
        .json({ msg: "Only the workspace owner can invite members" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const owner = await User.findById(req.user.id);
    if (owner.email === normalizedEmail) {
      return res.status(400).json({ msg: "You cannot invite yourself" });
    }

    const existingMember = workspace.members.find((m) => {
      return false;
    });

    const invitedUser = await User.findOne({ email: normalizedEmail });

    if (invitedUser) {
      // Already a member?
      const alreadyMember = workspace.members.some(
        (m) => m.user.toString() === invitedUser._id.toString(),
      );
      if (alreadyMember) {
        return res.status(409).json({ msg: "User is already a member" });
      }

      workspace.members.push({ user: invitedUser._id, role });

      workspace.invites = workspace.invites.filter(
        (i) => i.email !== normalizedEmail,
      );
      await workspace.save();
      await workspace.populate("members.user", "email name");

      if (req.io) {
        req.io
          .to(`user:${invitedUser._id}`)
          .emit("workspace:invited", { workspace, role });
      }

      return res.json({
        msg: `${invitedUser.email} added to workspace`,
        workspace,
      });
    } else {
      const alreadyInvited = workspace.invites.some(
        (i) => i.email === normalizedEmail,
      );
      if (alreadyInvited) {
        return res
          .status(409)
          .json({ msg: "An invite is already pending for this email" });
      }

      workspace.invites.push({ email: normalizedEmail, role });
      await workspace.save();

      return res.status(200).json({
        msg: `Invite sent to ${normalizedEmail}. They'll be added when they sign up.`,
        pending: true,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
