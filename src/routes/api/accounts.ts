import { Router } from "express";
import { IS_PROD } from "src/config";
import {
  getAccountByEmail,
  getAccountById,
  getAccountByName,
  getAllAccounts,
  updateAccount,
  createAccount,
  createAccounts,
} from "src/services/Account";

const router = Router();

/*
TODO:
- Handle auth middleware and check for correct permissions
*/

router.get("/all", async (_, res) => {
  // remove when auth is implemented
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const results = await getAllAccounts();
  return res.json(results);
});

router.get("/id/:id", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { id } = req.params;
  const doc = await getAccountById(id);
  return res.json(doc);
});

router.get("/email/:email", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { email } = req.params;
  const doc = await getAccountByEmail(email);
  return res.json(doc);
});

router.get("/name/:name", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { name } = req.params;
  const doc = await getAccountByName(name);
  return res.json(doc);
});

router.post("/create", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { body } = req;
  const result = await createAccount(body);
  return res.json(result);
});

router.post("/create-many", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { body } = req;
  const results = await createAccounts(body);
  return res.json(results);
});

router.put("/update/:id", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { id } = req.params;
  const { body } = req;
  const result = await updateAccount(id, body);
  return res.json(result);
});

export default router;
