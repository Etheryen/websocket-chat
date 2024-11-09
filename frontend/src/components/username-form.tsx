"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { checkUsername } from "~/api/requests";

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 25;

export default function UsernameForm() {
  const r = useRouter();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<null | HTMLInputElement>(null);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (username.length < MIN_USERNAME_LENGTH) {
      setError("Min length: " + MIN_USERNAME_LENGTH);
      return;
    }

    setError("");
    setIsSubmitting(true);

    const resp = await checkUsername(username);
    if (resp.available) {
      const queryString = new URLSearchParams({ username }).toString();

      r.push(`/chat?${queryString}`);
      return;
    }

    setIsSubmitting(false);
    setError(resp.error);
    // TODO: make sure it actually focuses / do something other than setTimeout fix
    setTimeout(() => inputRef.current?.focus(), 1);
  };

  const handleSetUsername = (ev: ChangeEvent<HTMLInputElement>) => {
    const newUsername = ev.target.value;
    if (newUsername.trim() !== newUsername) return;

    setUsername(newUsername);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-control flex flex-col justify-center"
    >
      <div className="join">
        <input
          type="text"
          name="username"
          placeholder="Username..."
          autoComplete="off"
          maxLength={MAX_USERNAME_LENGTH}
          ref={inputRef}
          disabled={isSubmitting}
          onChange={handleSetUsername}
          value={username}
          className="input input-sm join-item input-bordered sm:input-md"
        />
        <button
          disabled={isSubmitting}
          className="btn join-item btn-sm sm:btn-md"
        >
          Submit
        </button>
      </div>
      <div className="label">
        <span className="label-text-alt text-error">{error}</span>
      </div>
    </form>
  );
}
