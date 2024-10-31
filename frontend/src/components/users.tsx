"use client";

// import { useEffect, useState } from "react";
import { getUsers } from "~/api/requests";
import { usePromiseFn } from "~/hooks/usePromiseFn";

export function Users() {
  // const [users, setUsers] = useState<null | string[]>(null);
  //
  // useEffect(() => {
  //   (async () => {
  //     setUsers(await getUsers());
  //   })();
  // }, []);
  //
  // if (!users) {
  //   return <h2 className="text-lg">Active users: loading...</h2>;
  // }

  const { data: users, loading, error } = usePromiseFn(getUsers);

  if (loading) return <h2 className="text-lg">Active users: loading...</h2>;

  if (error) return <h2 className="text-lg">Active users: error</h2>;

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
