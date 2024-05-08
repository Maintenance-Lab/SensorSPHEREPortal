import { Router } from "express";
import jwt from "jsonwebtoken";
import { IS_PROD, JWT_ACCESS_SECRET, JWT_EXPIRESIN } from "../../config.js";

const router = Router();

router.get("/", (_, res) => {
  res.send("login route");
});

router.post("/", async (req, res) => {
  console.log("login route", req.body);
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    const token = jwt.sign({ id: 1, name: "admin", role: "administrator" }, JWT_ACCESS_SECRET, { expiresIn: JWT_EXPIRESIN });
    return res
      .cookie("token", token, {
        secure: IS_PROD,
      })
      .json({ success: true, location: "/dashboards", error: null });
  }
  return res.status(401).send("Invalid credentials");
});

export default router;
