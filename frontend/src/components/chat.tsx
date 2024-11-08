"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { getWsUrl } from "~/api/url";
import { Message, TextMessage } from "~/types";

interface ChatProps {
  username: string;
  history: TextMessage[];
}

// TODO: maybe make that a flag or env or sth
const MAX_CHAT_HISTORY = 6;

export function Chat({ username, history }: ChatProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<TextMessage[]>(history);
  const [message, setMessage] = useState("");

  const handleNewMessage = (newMsg: TextMessage) => {
    const messagesCopy = [...messages];

    if (messagesCopy.length >= MAX_CHAT_HISTORY) messagesCopy.shift();
    messagesCopy.push(newMsg);

    setMessages(messagesCopy);
  };

  const onMessage = (ev: MessageEvent) => {
    const msg = JSON.parse(ev.data) as Message;

    switch (msg.kind) {
      case "text":
        handleNewMessage(msg.data);
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
    if (message.trim() == "") return;
    if (readyState != ReadyState.OPEN) return;

    sendMessage(message.trim());
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
        <h1 className="text-4xl font-bold">
          <Link href={"/"}>Welcome to chat</Link>
        </h1>
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
            <div className="chat-bubble">
              <div className="truncate text-wrap">{msg.content}</div>
            </div>
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
          maxLength={100}
          onChange={(ev) => setMessage(ev.target.value)}
          value={message}
          className="input input-sm join-item input-bordered sm:input-md"
        />
        <button className="btn join-item btn-sm sm:btn-md">Send</button>
      </form>
    </main>
  );
}
