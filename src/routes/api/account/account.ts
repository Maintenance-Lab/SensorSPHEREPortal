import { Router } from "express";
import { IS_PROD } from "../../../config.js";
import { updateAccount } from "../../../services/Account.js";
import { getSession } from "../../../utils.js";

const router = Router();

router.get("/", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  return res.json(response);
});

//

export default router;
