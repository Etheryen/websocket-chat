"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { checkUsername, getHistory } from "~/api/requests";
import { Chat } from "~/components/chat";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
} from "~/components/username-form";
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

  const request = () => Promise.all([checkUsername(username!), getHistory()]);

  const { data, loading, error } = usePromiseFn(request, !!username);

  if (
    !username ||
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH
  ) {
    r.push("/");
    return null;
  }

  if (loading) return null;

  if (error) {
    r.push("/");
    return null;
  }

  const [availability, history] = data;

  if (!availability.available) {
    r.push("/");
    return null;
  }

  return <Chat username={username} history={history} />;
}
