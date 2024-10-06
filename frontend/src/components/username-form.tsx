"use client";

import { FormEvent, useState } from "react";

interface UsernameFormProps {
  setFinalUsername: (username: string) => void;
}

// TODO: fix warning
export function UsernameForm({ setFinalUsername }: UsernameFormProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError("");
    setIsSubmitting(true);

    // TODO: handle prod and docker url
    let text = "";
    try {
      const response = await fetch("http://localhost:8080/username", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-type": "application/json" },
      });
      text = await response.text();

      if (response.ok) {
        setFinalUsername(username);
        return;
      }

      setIsSubmitting(false);
      setError(text);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      setError(text);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-4xl font-bold">Welcome to chat</h1>
      <h2 className="text-xl">Choose a username</h2>
      <form onSubmit={handleSubmit} className="form-control mx-auto">
        <div className="join">
          <input
            type="text"
            placeholder="Username..."
            autoComplete="off"
            maxLength={25}
            required
            disabled={isSubmitting}
            onChange={(ev) => setUsername(ev.target.value)}
            value={username}
            className="input join-item input-bordered"
          />
          <button disabled={isSubmitting} className="btn join-item">
            Submit
          </button>
        </div>
        <div className="label">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      </form>
    </div>
  );
}
