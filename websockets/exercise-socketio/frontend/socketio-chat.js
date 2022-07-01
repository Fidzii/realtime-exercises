// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

/*
 *
 * Code goes here
 *
 */
const socketio = io("http://localhost:8080");

socketio.on("connect", () => {
  console.log("connected");
  presence.innerText = "🟢";
});

socketio.on("disconnect", () => {
  console.log("disconnected");
  presence.innerText = "🔴";
});

socketio.on("msg:get", (data) => {
  allChat = data;
  render();
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  /*
   *
   * Code goes here
   *
   */
  socketio.emit("msg:post", { user, text });
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
