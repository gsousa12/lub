import * as net from "net";

/**
 * A promise-based API for TCP sockets.
 */
export type TCPConn = {
  /**
   * TCP socket
   */
  socket: net.Socket;

  /**
   * A field to store the resolve and reject promise callbacks
   */
  reader: null | {
    resolve: (value: Buffer) => void;
    reject: (reason: Error) => void;
  };

  /**
   * Error in the connection
   */
  err: null | Error;

  /**
   * Define if the connection is ended
   */
  ended: boolean;
};
