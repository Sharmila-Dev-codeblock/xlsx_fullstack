import React from "react";
import { UserType } from "./types/user";

interface Props {
  users: UserType[];
}

const User: React.FC<Props> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="user-table">
      <h3>Uploaded Users</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default User;
