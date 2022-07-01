import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";
import { Server } from "socket.io";

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
 * Code goes here
 *
 */
const socketio = new Server(server, {});

socketio.on("connection", (socket) => {
  console.log("new connection " + socket.id);
  socket.emit("msg:get", getMsgs());

  socket.on("msg:post", (data) => {
    const { user, text } = data;
    msg.push({ user, text, time: Date.now() });
    socketio.emit("msg:get", getMsgs());
  });

  socket.on("disconnect", () => {
    console.log("closed connection " + socket.id);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
