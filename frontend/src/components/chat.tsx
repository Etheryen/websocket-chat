import { FormEvent, useState } from "react";
import { useWebSocket } from "~/hooks/useWebSocket";
import { Message, TextMessage } from "~/types/types";

interface ChatProps {
  username: string;
}

export function Chat({ username }: ChatProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const [message, setMessage] = useState("");

  const onMessage = (newMessage: Message) => {
    console.log({ newMessage });

    switch (newMessage.kind) {
      case "text":
        setMessages((messages) => [...messages, newMessage.data]);
        break;
      case "users":
        setUsers(newMessage.data);
        break;
    }
  };

  // TODO: handle url prod and all
  const url = `ws://localhost:8080/ws?username=${username}`;
  const { send, state } = useWebSocket({ url, onMessage });

  const handleSend = (ev: FormEvent) => {
    ev.preventDefault();
    if (state != "connected") return;
    send(message);
    setMessage("");
  };

  return (
    <>
      {/* In a hidden part of your component or JSX */}
      <div className="chat chat-end chat-start" style={{ display: "none" }} />
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to chat</h1>
        <h2 className="text-xl">State: {state}</h2>
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
        className="pt-4 join text-center mx-auto block"
      >
        <input
          type="text"
          placeholder="Your message..."
          autoComplete="off"
          maxLength={25}
          required
          onChange={(ev) => setMessage(ev.target.value)}
          value={message}
          className="input input-bordered join-item"
        />
        <button className="btn join-item">Send</button>
      </form>
    </>
  );
}
