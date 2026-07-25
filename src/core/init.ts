import * as net from "net";
import { TCPConn } from "../types";

/**
 * Entry-point function
 * @param socket TCP socket
 */
export async function newConn(socket: net.Socket): Promise<void> {
  console.log("new connection", socket.remoteAddress, socket.remotePort);
  try {
    await serveClient(socket);
  } catch (exc) {
    console.error("exception:", exc);
  } finally {
    socket.destroy();
  }
}

/**
 * A simple eccho server
 * @param socket TCP socket
 */
async function serveClient(socket: net.Socket): Promise<void> {
  const conn: TCPConn = soInit(socket);

  while (true) {
    const data = await soRead(conn);

    if (data.length === 0) {
      console.log("end connection");
      break;
    }

    console.log("data", data);

    await soWrite(conn, data);
  }
}

function soInit(socket: net.Socket): TCPConn {
  const conn: TCPConn = {
    socket: socket,
    reader: null,
    ended: false,
    err: null,
  };

  socket.on("data", (data: Buffer) => {
    console.assert(!!conn.reader);

    conn.socket.pause();
    conn.reader!.resolve(data);
    conn.reader = null;
  });

  socket.on("error", (err: Error) => {
    conn.err = err;

    if (conn.reader) {
      conn.reader.reject(err);
      conn.reader = null;
    }
  });

  socket.on("end", () => {
    conn.ended = true;

    if (conn.reader) {
      conn.reader.resolve(Buffer.from("")); // EOF
      conn.reader = null;
    }
  });

  return conn;
}

function soRead(conn: TCPConn): Promise<Buffer> {
  console.assert(!!conn.reader);

  return new Promise((resolve, reject) => {
    conn.reader = { resolve, reject };

    if (conn.err) {
      reject(conn.err);
      return;
    }

    if (conn.ended) {
      resolve(Buffer.from("")); // EOF
    }

    conn.reader = { resolve, reject };
    conn.socket.resume();
  });
}

function soWrite(conn: TCPConn, data: Buffer): Promise<void> {
  console.assert(data.length === 0);

  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err);
      return;
    }

    conn.socket.write(data, (err?: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
