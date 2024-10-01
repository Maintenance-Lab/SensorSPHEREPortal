import cleanup from "node-cleanup";
import WebServer from "./classes/WebServer.js";
// import dbConnect from "./mongo.js";
// import { dbConnect } from "./sqlite.js";

const ws = new WebServer();

// dbConnect();
// run ./sqlite.js

cleanup(() => {
  ws.close();
});
