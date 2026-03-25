const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
  const token = req.cookies?.token;
 
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};