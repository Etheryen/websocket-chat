"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { checkUsername } from "~/api/requests";

// TODO: use server actions
export default function UsernameForm() {
  const r = useRouter();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<null | HTMLInputElement>(null);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError("");
    setIsSubmitting(true);

    const resp = await checkUsername(username);
    if (resp.available) {
      r.push(`/chat?username=${username}`);
      return;
    }

    setIsSubmitting(false);
    setError(resp.error);
    // TODO: make sure it actually focuses
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="form-control mx-auto">
      <div className="join">
        <input
          type="text"
          placeholder="Username..."
          autoComplete="off"
          minLength={3}
          maxLength={25}
          required
          ref={inputRef}
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
  );
}
