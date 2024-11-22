import Link from "next/link";
import UsernameForm from "~/components/username-form";
import { Users } from "~/components/users";

export default async function Home() {
  return (
    <main className="p-8">
      <div className="flex flex-col items-center space-y-4">
        <h1>TEST TEST TEST</h1>
        <h1 className="text-center text-4xl font-bold">
          <Link href={"/"}>Welcome to chat</Link>
        </h1>
        <Users />
        <h2 className="text-xl">Choose a username</h2>
        <UsernameForm />
      </div>
    </main>
  );
}
