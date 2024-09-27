import cleanup from "node-cleanup";
import WebServer from "./classes/WebServer.js";
import dbConnect from "./mongo.js";

const ws = new WebServer();

// dbConnect();

cleanup(() => {
  ws.close();
});
