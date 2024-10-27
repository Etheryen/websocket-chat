import { getUsers } from "~/api/requests";

export async function Users() {
  const users = await getUsers();

  if (users.length === 0)
    return <h2 className="text-lg">Active users: none</h2>;

  return (
    <>
      <h2 className="text-lg">Active users:</h2>
      <ul className="text-center">
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </>
  );
}
