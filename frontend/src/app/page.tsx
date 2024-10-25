import { getUsers } from "~/api/requests";
import UsernameForm from "~/components/username-form";

export default async function Home() {
  // TODO: when user refreshes chat, the users list still displays him but he is disconnected
  const users = await getUsers();

  return (
    <main className="p-4">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to chat</h1>
        {users.length === 0 && <h2 className="text-lg">Active users: none</h2>}
        {users.length > 0 && (
          <>
            <h2 className="text-lg">Active users:</h2>
            <ul className="text-center">
              {users.map((user) => (
                <li key={user}>{user}</li>
              ))}
            </ul>
          </>
        )}
        <h2 className="text-xl">Choose a username</h2>
        <UsernameForm />
      </div>
    </main>
  );
}
