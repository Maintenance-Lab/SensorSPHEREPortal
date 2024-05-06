import cleanup from "node-cleanup";
import WebServer from "./classes/WebServer.js";

const ws = new WebServer();

cleanup(() => {
  ws.close();
});
