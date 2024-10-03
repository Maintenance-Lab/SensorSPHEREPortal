import { Router } from "express";
import { getSession } from "../../../utils.js";
import { deleteLoginSession } from "../../../services/LoginSession.js";
import { IS_PROD } from "../../../config.js";

const router = Router();

router.get("/", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { sessions } = response;
  return res.json(sessions);
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid request" });

    // Make sure the user is logged in and the session exists
    const response = await getSession(req, res);
    if (!response) return;

    const { sessions } = response;

    // Make sure it is our session and not someone else's
    const session = sessions.find((s) => s.LoginSessionId === id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    await deleteLoginSession(id);

    return res.json({ message: "Session deleted" });
  } catch (error) {
    if (!IS_PROD) console.error("Error deleting session", error);
    return res.status(500).json({ message: "Error deleting session" });
  }
});

export default router;
