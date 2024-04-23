/**
 * WebServer
 */
import { EventEmitter } from "events";
import { createServer, Server } from "http";
import express, { Express, Request, Response } from "express";

import { PORT } from "../config.js";
// import auth from "../middleware/auth.js";
// import cors from "../middleware/cors.js";
import routes from "../routes/index.js";

class WebServer extends EventEmitter {
  public app: Express | null = null;
  public server: Server | null = null;

  constructor() {
    super();
    this.init();
  }

  init() {
    // App
    this.app = express();
    // No need to credentials as behind an nginx https proxy
    this.server = createServer(this.app);

    // Docker has nginx proxy in front so we need to ensure
    // cookies/session/etc gets passed through
    this.app.set("trust proxy", 1);

    // this.app.get("/", (_: Request, res: Response) => {
    //   return res.send("ResearchRunner Data Home");
    // });

    // this.app.use(auth()); // Every request must have auth header
    this.app.use(express.json({limit: '900mb'}));
    // this.app.use(cors());

    this.app.use(routes);

    this.server.listen(PORT, () => {
      console.log(`Server listening on port: ${PORT}`);
      this.emit("ready");
    });
  }

  close() {
    if (this.server) this.server.close();
    console.log(`WebServer closed`);
  }
}

export default WebServer;
