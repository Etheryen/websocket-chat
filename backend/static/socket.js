/** @typedef {import("./types").State} State */
/** @typedef {import("./types").Message} Message */

export class WS {
  /** @type {string} */
  #url;

  /** @type {WebSocket} */
  #ws;

  /** @type {State} */
  #state;

  /** @type {null | ((msg: Message) => void)} */
  onMessage;

  /** @type {null | ((state: State) => void)} */
  onStateChange;

  /** @type {number} */
  #reconnectAttempts;

  /** @type {number} */
  #maxReconnectAttempts;

  /** @param {string} url */
  constructor(url) {
    this.#url = url;
    this.#state = "uninitialized";
    this.onMessage = null;
    this.onStateChange = null;
    this.#reconnectAttempts = 0;
    this.#maxReconnectAttempts = 5;
    this.#connect();
  }

  /** @param {string} msg */
  send(msg) {
    if (this.#state === "connected") {
      this.#ws.send(msg);
    } else {
      console.error("WebSocket is not connected. Unable to send message.");
    }
  }

  get state() {
    return this.#state;
  }

  /** @param {State} newState */
  #setState(newState) {
    this.#state = newState;
    console.log("Ws state:", newState);
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  #connect() {
    this.#setState("connecting");
    this.#ws = new WebSocket(this.#url);

    this.#ws.onopen = () => {
      this.#reconnectAttempts = 0;
      this.#setState("connected");
    };

    /** @param {MessageEvent<string>} ev */
    this.#ws.onmessage = (ev) => {
      /** @type {Message} */
      const msg = JSON.parse(ev.data);

      if (this.onMessage) {
        this.onMessage(msg);
      }
    };

    this.#ws.onclose = async () => {
      this.#handleDisconnect();
    };

    this.#ws.onerror = async () => {
      this.#handleDisconnect();
    };
  }

  async #handleDisconnect() {
    if (this.#state == "reconnecting") return;

    if (this.#reconnectAttempts < this.#maxReconnectAttempts) {
      this.#setState("reconnecting");
      await sleep(this.#getReconnectDelay());
      this.#reconnectAttempts++;
      this.#connect();
    } else {
      this.#setState("disconnected");
      console.error(
        "Max reconnection attempts reached. WebSocket is disconnected.",
      );
    }
  }

  /** Calculate delay for reconnection attempts using exponential backoff */
  #getReconnectDelay() {
    return Math.min(1000 * 2 ** this.#reconnectAttempts, 30000); // Cap the delay to 30 seconds
  }
}

/** @param {number} ms */
async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}
