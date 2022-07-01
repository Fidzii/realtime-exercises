import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";

// these are helpers to help you deal with the binary data that websockets use
import objToResponse from "./obj-to-response.js";
import generateAcceptValue from "./generate-accept-value.js";
import parseMessage from "./parse-message.js";

let connections = [];
const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

/*
 *
 * your code goes here
 *
 */
server.on("upgrade", (req, socket) => {
  if (req.headers["upgrade"] !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }

  const key = req.headers["sec-websocket-key"];
  const accept = generateAcceptValue(key);
  const headers = [
    "HTTP/1.1 101 Web Socket Protocol Handshake",
    "Upgrade: WebSocket",
    "Connection: Upgrade",
    "Sec-WebSocket-Accept: " + accept,
    "Sec-WebSocket-Protocol: json",
    "\r\n",
  ];

  socket.write(headers.join("\r\n"));
  connections.push(socket);
  socket.write(objToResponse(getMsgs()));

  socket.on("data", (buff) => {
    const data = parseMessage(buff);
    if (!data) return socket.end();

    const { user, text } = data;
    msg.push({ user, text, time: Date.now() });

    connections.forEach((s) => s.write(objToResponse(getMsgs())));
  });

  socket.on("end", () => {
    connections = connections.filter((conn) => conn !== socket);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
