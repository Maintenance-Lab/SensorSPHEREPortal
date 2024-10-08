import cleanup from "node-cleanup";
import WebServer from "./classes/WebServer.js";
// import dbConnect from "./mongo.js";
import initDb from "./sqlite.js";

const ws = new WebServer();

const db = initDb();

cleanup(() => {
  ws.close();
});
