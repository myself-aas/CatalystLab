import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../lib/firebase';
import type { UserProfile } from '../../types';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error);
  }, []);

  return (
    <div className="w-full mx-auto p-6 bg-muted text-foreground rounded-xl">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-muted/50">
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
