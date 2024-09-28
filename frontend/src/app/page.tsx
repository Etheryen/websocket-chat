"use client";

import { useState } from "react";
import { Chat } from "~/components/chat";
import { UsernameForm } from "~/components/username-form";

export default function Home() {
  const [finalUsername, setFinalUsername] = useState("");

  return (
    <main className="p-8">
      {!!finalUsername ? (
        <Chat username={finalUsername} />
      ) : (
        <UsernameForm setFinalUsername={setFinalUsername} />
      )}
    </main>
  );
}
