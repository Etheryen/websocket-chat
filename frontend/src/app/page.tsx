import { Suspense } from "react";
import UsernameForm from "~/components/username-form";
import { Users } from "~/components/users";

export default async function Home() {
  // TODO: when user refreshes chat, the users list still displays him but he is disconnected

  return (
    <main className="p-4">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to chat</h1>
        <Suspense
          fallback={<h2 className="text-lg">Active users: loading...</h2>}
        >
          <Users />
        </Suspense>
        <h2 className="text-xl">Choose a username</h2>
        <UsernameForm />
      </div>
    </main>
  );
}
