import { redirect } from "next/navigation";
import { checkUsername } from "~/api/requests";
import { Chat } from "~/components/chat";

interface ChatPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const username = (await searchParams)?.username;
  if (!username || typeof username != "string") {
    redirect("/");
  }

  const availability = await checkUsername(username);
  console.log({ username, availability });
  if (!availability.available) {
    redirect("/");
  }

  return <Chat username={username} />;
}
