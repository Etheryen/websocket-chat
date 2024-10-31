"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { checkUsername, getHistory } from "~/api/requests";
import { Chat } from "~/components/chat";
import { usePromiseFn } from "~/hooks/usePromiseFn";

export default function ChatPage() {
  return (
    <Suspense>
      <ActualChatPage />
    </Suspense>
  );
}

function ActualChatPage() {
  const r = useRouter();

  const username = useSearchParams().get("username");

  const {
    data: availability,
    loading: loadingUsername,
    error: errorUsername,
  } = usePromiseFn(() => checkUsername(username!), !!username);

  const {
    data: history,
    loading: loadingHistory,
    error: errorHistory,
  } = usePromiseFn(getHistory, !!username);

  if (!username) {
    r.push("/");
    return null;
  }

  if (loadingUsername || loadingHistory) return null;

  if (errorUsername || errorHistory || !availability.available) {
    r.push("/");
    return null;
  }

  return <Chat username={username} history={history} />;
}
