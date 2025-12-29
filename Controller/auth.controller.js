const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & password required" });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  // 🚨 Device limit check
  if (user.sessions.length >= 2) {
    user.sessions.shift();
    return res.status(403).json({
      message:
        "Maximum device limit reached. Please logout from another device.",
    });
  }

  const token = user.generateToken();

  // Store session
  user.sessions.push({ token });
  await user.save();

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
};
exports.logout = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ message: "Logged out" });

  const user = await User.findOne({ "sessions.token": token });
  if (user) {
    user.sessions = user.sessions.filter(
      (session) => session.token !== token
    );
    await user.save();
  }

  res.clearCookie("token").json({ message: "Logged out successfully" });
};

