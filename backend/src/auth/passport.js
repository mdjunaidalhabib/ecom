import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function configurePassport() {
  const callbackURL = `${process.env.AUTH_API_URL}/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const name = profile.displayName || "User";
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const avatar = profile.photos?.[0]?.value || "";

          let user = await User.findOne({ googleId });

          if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              if (!user.avatar && avatar) user.avatar = avatar;
              if (!user.name && name) user.name = name;
              await user.save();
            }
          }

          if (!user) {
            user = await User.create({
              googleId,
              name,
              email: email || `noemail-${googleId}@example.local`,
              avatar,
            });
          }

          // ✅ JWT generate
          const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "90d" }
          );

          return done(null, { token, user });
        } catch (err) {
          console.error("❌ Passport Google Strategy error:", err);
          return done(err, null);
        }
      }
    )
  );
}