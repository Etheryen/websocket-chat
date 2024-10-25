"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { getWsUrl } from "~/api/url";
import { Message, TextMessage } from "~/types/types";

interface ChatProps {
  username: string;
}

export function Chat({ username }: ChatProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const [message, setMessage] = useState("");

  const onMessage = (ev: MessageEvent) => {
    const msg = JSON.parse(ev.data) as Message;

    switch (msg.kind) {
      case "text":
        setMessages((messages) => [...messages, msg.data]);
        break;
      case "users":
        setUsers(msg.data);
        break;
    }
  };

  const didUnmount = useRef(false);
  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, []);

  const url = `${getWsUrl()}/api/ws?username=${username}`;
  const { readyState, sendMessage } = useWebSocket(url, {
    onMessage,
    retryOnError: true,
    shouldReconnect: () => didUnmount.current === false,
    queryParams: { username },
  });

  const handleSend = (ev: FormEvent) => {
    ev.preventDefault();
    if (readyState != ReadyState.OPEN) return;

    sendMessage(message);
    setMessage("");
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: "connecting...",
    [ReadyState.OPEN]: "connected",
    [ReadyState.CLOSING]: "closing...",
    [ReadyState.CLOSED]: "closed",
    [ReadyState.UNINSTANTIATED]: "uninstantiated",
  }[readyState];
  return (
    <main className="p-4">
      {/* TODO: wtf is that under me */}
      {/* In a hidden part of your component or JSX */}
      <div className="chat chat-start chat-end" style={{ display: "none" }} />
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to chat</h1>
        <h2 className="text-xl">Status: {connectionStatus}</h2>
        <h2 className="text-xl">Your username: {username}</h2>
        <h2 className="text-lg">Active users:</h2>
        <ul>
          {users.map((user) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
      <div className="mx-auto max-w-xl">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat chat-${username === msg.author ? "end" : "start"}`}
          >
            <div className="chat-header">{msg.author}</div>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSend}
        className="join mx-auto block pt-4 text-center"
      >
        <input
          type="text"
          placeholder="Your message..."
          autoComplete="off"
          maxLength={25}
          required
          onChange={(ev) => setMessage(ev.target.value)}
          value={message}
          className="input join-item input-bordered"
        />
        <button className="btn join-item">Send</button>
      </form>
    </main>
  );
}
