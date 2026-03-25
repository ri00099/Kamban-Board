const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          default: "editor",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    invites: [
      {
        email: { type: String, lowercase: true, trim: true },
        role: { type: String, enum: ["editor", "viewer"], default: "editor" },
        token: String, 
        invitedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);


workspaceSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

workspaceSchema.methods.isOwner = function (userId) {
  return this.owner.toString() === userId.toString();
};

module.exports = mongoose.model("Workspace", workspaceSchema);