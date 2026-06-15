import React from 'react';
import Table from '../../components/tables/Table';

function RoleManagement() {
  const members = [
    { name: 'Parth Patel', role: 'Resident' },
    { name: 'Committee Treasurer', role: 'Admin' }
  ];

  const handleRoleChange = (e, name) => {
    alert(`Modified role for ${name} to ${e.target.value}.`);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Security Role Assignments</h2>
        <p className="text-slate-500 text-xs mt-1">Configure access ranks (Resident, Committee Admin, SuperAdmin).</p>
      </div>

      <Table headers={['Resident Name', 'Current Rank', 'Change Rank Setting']}>
        {members.map((m, idx) => (
          <tr key={idx} className="hover:bg-slate-50 text-xs">
            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{m.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-slate-550">{m.role}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select 
                defaultValue={m.role.toUpperCase()}
                onChange={(e) => handleRoleChange(e, m.name)}
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none"
              >
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default RoleManagement;
