import * as net from "net";
import { newConn } from "./core/init";

const HOST = "127.0.0.1";
const PORT = 1234;

let server = net.createServer({ pauseOnConnect: true });

server.on("error", (err: Error) => {
  throw err;
});

server.on("connection", newConn);

server.listen({ host: HOST, port: PORT });
