const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");


const cookieOptions = {
  httpOnly: true,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    const token = generateToken(user);

    res.cookie("token", token, cookieOptions); // Set the cookie
    res
      .status(201)
      .json({
        msg: "User registered successfully",
        user: { email: user.email },
      });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user);

res.cookie("token", token, {
  httpOnly: true,
  secure: false,     
  sameSite: 'lax',   
  path: '/',         
  maxAge: 24 * 60 * 60 * 1000 
});
    res.json({ msg: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });
  res.json({ msg: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  try {
    // req.user was set by your authMiddleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
