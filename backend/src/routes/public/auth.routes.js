import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const router = express.Router();

// 🔹 JWT Middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = payload;
    next();
  });
}

// 🔹 Google Login (redirect → state এ carry করা হচ্ছে)
router.get("/google", (req, res, next) => {
  const redirect = req.query.redirect;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    state: redirect ? encodeURIComponent(redirect) : undefined,
  })(req, res, next);
});

// 🔹 Google Callback (✅ শুধুমাত্র একবার)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const { token, user } = req.user;

    // ✅ CLIENT_URLS থেকে প্রথম client url নিবে
    const clientUrls = process.env.CLIENT_URLS;
    if (!clientUrls) {
      return res.status(500).json({
        error: "CLIENT_URLS is not set in environment variables",
      });
    }
    const clientUrl = clientUrls.split(",")[0].trim();

    // state param থেকে redirect (optional)
    const redirect = req.query.state
      ? decodeURIComponent(req.query.state)
      : "/";

    // সবসময় /auth/callback এ পাঠানো হবে
    res.redirect(
      `${clientUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(
        redirect
      )}`
    );
  }
);

// 🔹 Current User (protected)
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
