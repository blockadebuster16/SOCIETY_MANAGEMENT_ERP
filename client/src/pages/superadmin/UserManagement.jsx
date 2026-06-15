import React from 'react';
import Table from '../../components/tables/Table';

function UserManagement() {
  const users = [
    { email: 'parth@suyashpride.in', role: 'Resident', verified: 'Yes', lock: 'No' },
    { email: 'admin@suyashpride.in', role: 'Committee Admin', verified: 'Yes', lock: 'No' }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Portal User Registry</h2>
        <p className="text-slate-500 text-xs mt-1">Unlock accounts, reset security passwords, or delete portal accounts.</p>
      </div>

      <Table headers={['Account Email', 'Assigned Role', 'Auth Verified', 'Account Locked', 'Actions']}>
        {users.map((u, idx) => (
          <tr key={idx} className="hover:bg-slate-50 text-xs">
            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{u.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.role}</td>
            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.verified}</td>
            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.lock}</td>
            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold space-x-3">
              <button className="text-society-primary hover:text-yellow-600">Reset Password</button>
              <button className="text-society-danger hover:text-red-700">Deactivate</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default UserManagement;
