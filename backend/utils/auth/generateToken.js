import jwt from "jsonwebtoken";

const generateToken = (admin) => {
  if (!admin?._id) {
    throw new Error("Admin data missing for token generation");
  }

  const payload = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };

  // ✅ MUST return the token
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export default generateToken;
