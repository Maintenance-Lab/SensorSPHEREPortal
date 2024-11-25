import { Router } from "express";
import { IS_PROD } from "../../../config.js";
import { getSession } from "../../../utils.js";
import { getProjectById, updateProject } from "../../../services/Projects.js";
import { getAccountByEmail } from "../../../services/Account.js";
import AccountProjectMapping from "../../../models/mappings/AccountProjectMapping.js";

const router = Router();

router.post("/add", async (req, res) => {
  try {
    const session = await getSession(req, res);
    if (!session) return;

    const { account } = session;
    console.log("account!!!!!", account);
    const { projectId, email } = req.body;
    if (!projectId || !email) return res.status(400).json({ message: "Project ID and email are required" });
    const project = await getProjectById(projectId);

    if (!project) return res.status(400).json({ message: "Project not found" });

    const mapping = await AccountProjectMapping.findOne({ where: { accountId: account.accountId, projectId: projectId } });
    console.log("mapping", mapping);
    if (!mapping) return res.status(401).json({ message: "Unauthorized" });

    // if (project.owner?.toString() !== account._id) return res.status(401).json({ message: "Unauthorized" });

    const collaborator = await getAccountByEmail(email);
    console.log("invited collaborator", collaborator, collaborator.accountId);
    if (!collaborator) return res.status(400).json({ message: "Collaborator not found" });

    if (collaborator.accountId.toString() === account.toString())
        return res.status(400).json({ message: "Cannot add self as collaborator" });

    // const collaborators: any = project?.collaborators || [];
    const addedCollaborators = await AccountProjectMapping.findAll({ where: { projectId: projectId } });
    const collaborators: string[] = [];

    // add ids of existing collaborators
    for (const collab of addedCollaborators) {
      collaborators.push(collab.accountId.toString());
    }

    console.log("Existing collaborators", addedCollaborators);
    let found = false;
    for (const collab of addedCollaborators) {
      if (collab.toString() === collaborator.accountId.toString()) {
        found = true;
        break;
      }
    }
    if (found) return res.status(400).json({ message: "Collaborator already invited" });
    else collaborators.push(collaborator.accountId.toString());

    // add collaborator to project
    const result = await AccountProjectMapping.create({ accountId: collaborator.accountId, projectId: projectId, status: "pending" });
    if (!result) return res.status(400).json({ message: "Failed to add collaborator" });

    return res.json({ message: `Invited ${collaborator.name} to ${project.name}` });
  } catch (error) {
    if (!IS_PROD) console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
