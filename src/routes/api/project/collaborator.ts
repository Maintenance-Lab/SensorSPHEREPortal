import { Router } from "express";
import { IS_PROD } from "../../../config.js";
import { getSession } from "../../../utils.js";
import { getProjectById, updateProject } from "../../../services/Projects.js";
import { getAccountByEmail } from "../../../services/Account.js";

const router = Router();

router.post("/add", async (req, res) => {
  try {
    const session = await getSession(req, res);
    if (!session) return;
    const { account } = session;
    const { projectId, email } = req.body;
    if (!projectId || !email) return res.status(400).json({ message: "Project ID and email are required" });
    const project = await getProjectById(projectId);

    if (!project) return res.status(400).json({ message: "Project not found" });
    if (project.owner?.toString() !== account._id) return res.status(401).json({ message: "Unauthorized" });

    const collaborator = await getAccountByEmail(email);
    if (!collaborator) return res.status(400).json({ message: "Collaborator not found" });

    if (collaborator._id.toString() === project.owner?.toString())
      return res.status(400).json({ message: "Cannot add owner as collaborator" });

    const collaborators: any = project?.collaborators || [];
    let found = false;
    for (const collab of collaborators) {
      if (collab.toString() === collaborator._id.toString()) {
        found = true;
        break;
      }
    }
    if (found) return res.status(400).json({ message: "Collaborator already added" });
    else collaborators.push(collaborator._id);

    project.collaborators = collaborators;
    const result = await updateProject(projectId, project);
    if (!result) return res.status(400).json({ message: "Failed to add collaborator" });

    return res.json({ message: `Added ${collaborator.name} to ${project.name}` });
  } catch (error) {
    if (!IS_PROD) console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
