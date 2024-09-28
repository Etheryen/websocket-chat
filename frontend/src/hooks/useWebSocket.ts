import { useEffect, useRef, useState } from "react";
import { Message, State } from "~/types/types";

interface UseWebSocketArgs {
  url: string;
  onMessage: (newMessage: Message) => void;
}

export const useWebSocket = ({ url, onMessage }: UseWebSocketArgs) => {
  const conn = useRef<WebSocket | null>(null);
  const [state, setState] = useState<State>("uninitialized");
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const send = (text: string) => {
    if (state === "connected") {
      conn?.current?.send(text);
      return;
    }
    console.error("WebSocket is not connected. Unable to send message.");
  };

  // TODO: fix warning
  const connect = (url: string) => {
    if (state === "connected" || conn.current) return;

    console.log("CONNECTING");
    setState("connecting");
    conn.current = new WebSocket(url);

    conn.current.onopen = () => {
      reconnectAttempts.current = 0;
      setState("connected");
    };

    conn.current.onmessage = (ev: MessageEvent<string>) => {
      const msg = JSON.parse(ev.data);
      onMessage(msg);
    };

    conn.current.onclose = async () => {
      await handleDisconnect();
    };

    conn.current.onerror = async () => {
      await handleDisconnect();
    };
  };

  useEffect(() => {
    connect(url);
  }, [url, connect]);

  const getReconnectDelay = () => {
    return Math.min(1000 * 2 ** reconnectAttempts.current, 30000); // Cap the delay to 30 seconds
  };

  const handleDisconnect = async () => {
    if (state == "reconnecting") return;

    // TODO: fix reconnecting

    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      setState("reconnecting");
      await sleep(getReconnectDelay());
      reconnectAttempts.current = reconnectAttempts.current + 1;
    } else {
      setState("disconnected");
      console.error(
        "Max reconnection attempts reached. WebSocket is disconnected.",
      );
    }
  };

  return { state, send };
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}
