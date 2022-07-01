const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  /*
   *
   * code goes here
   *
   */

  const decoder = new TextDecoder();

  try {
    const res = await fetch("/msgs");
    if (res.status !== 200) throw new Error("error while connecting");

    presence.innerHTML = "🟢";
    const reader = res.body.getReader();

    while (true) {
      let stream;
      try {
        stream = await reader.read();
      } catch (error) {
        console.error("error while reading a stream", error);
        break;
      }
      const textData = decoder.decode(stream.value, { stream: true });

      if (textData) {
        try {
          allChat = JSON.parse(textData);
          render();
        } catch (error) {
          console.error("error while parsing stream data", error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  presence.innerHTML = "🔴";
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
