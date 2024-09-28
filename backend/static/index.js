import { WS } from "./socket.js";
/** @typedef {import("./types").Message} Message */
/** @typedef {import("./types").TextMessage} TextMessage */
/** @typedef {import("./types").State} State */

const usernameForm = /** @type {HTMLFormElement} */ (
  document.querySelector("#usernameForm")
);
const usernameInput = /** @type {HTMLInputElement} */ (
  document.querySelector("#usernameInput")
);
const usernameBtn = /** @type {HTMLButtonElement} */ (
  document.querySelector("#usernameBtn")
);
const usernameError = /** @type {Element} */ (
  document.querySelector("#usernameError")
);

/** @param {SubmitEvent} ev */
usernameForm.onsubmit = async (ev) => {
  ev.preventDefault();
  usernameError.innerHTML = "";
  usernameInput.disabled = true;
  usernameBtn.disabled = true;
  const username = usernameInput.value;
  const response = await fetch("http://localhost:8080/username", {
    method: "POST",
    body: JSON.stringify({ username }),
    headers: { "Content-type": "application/json" },
  });
  if (response.ok) {
    const chatBody = `
      <h1 class="text-4xl font-bold">Welcome to chat</h1>
      <h2 class="text-xl">State: <span id="state">uninitialied</span></h2>
      <h2 class="text-xl">Your username: <span id="username">${username}</span></h2>
      <h2 class="text-lg">Active users:</h2>
      <ul id="users"></ul>
      <div id="messages" class="mx-auto max-w-xl"></div>
      <form id="msgForm" class="join">
        <input
          type="text"
          placeholder="Your message..."
          autocomplete="off"
          maxlength="25"
          required
          id="msgInput"
          class="input input-bordered join-item"
        />
        <button class="btn join-item">Send</button>
      </form>
    `;
    document.body.innerHTML = chatBody;

    setupSocket(username);
    return;
  }

  usernameError.innerHTML = await response.text();
  usernameInput.disabled = false;
  usernameBtn.disabled = false;
  console.error(`Username ${username} is taken!`);
};

/** @param {string} username */
function setupSocket(username) {
  const ws = new WS(`ws://localhost:8080/ws?username=${username}`);

  /** @param {State} state */
  ws.onStateChange = (state) => {
    const stateElement = /** @type {Element} */ (
      document.querySelector("#state")
    );

    stateElement.innerHTML = state;
  };

  /** @param {Message} msg */
  ws.onMessage = (msg) => {
    const div = /** @type {Element} */ (document.querySelector("#messages"));
    const username = /** @type {Element} */ (
      document.querySelector("#username")
    );
    const users = /** @type {Element} */ (document.querySelector("#users"));

    /** @param {TextMessage} textMsg */
    const msgElFunc = (textMsg) => {
      const chatType = username.innerHTML === textMsg.author ? "end" : "start";
      return `<div class="chat chat-${chatType}">
                <div class="chat-header">${textMsg.author}</div>
                <div class="chat-bubble">${textMsg.content}</div>
              </div>`;
    };

    switch (msg.kind) {
      case "text":
        div.innerHTML += msgElFunc(msg.data);
        break;
      case "users":
        users.innerHTML = msg.data.map((id) => `<li>${id}</li>`).join("");
        break;
    }
  };

  const msgForm = /** @type {HTMLFormElement} */ (
    document.querySelector("#msgForm")
  );
  const input = /** @type {HTMLInputElement} */ (
    document.querySelector("#msgInput")
  );

  /** @param {SubmitEvent} ev */
  msgForm.onsubmit = (ev) => {
    ev.preventDefault();
    if (ws.state != "connected") return;

    ws.send(input.value);
    input.value = "";
  };
}
