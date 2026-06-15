import React from 'react';
import Table from '../../components/tables/Table';

function AuditLogs() {
  const logs = [
    { time: '11-Jun-2026 21:40', user: 'admin@suyashpride.in', action: 'Create Notice: "Water supply maintenance"', ip: '192.168.1.5' },
    { time: '11-Jun-2026 21:35', user: 'superadmin@suyashpride.in', action: 'Modified role for Parth Patel to RESIDENT', ip: '192.168.1.1' }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Portal Security Audit Logs</h2>
        <p className="text-slate-500 text-xs mt-1">Track access history and modifications performed by administrative users.</p>
      </div>

      <Table headers={['Time Stamp', 'Operator User', 'Operation Action', 'IP Address']}>
        {logs.map((log, idx) => (
          <tr key={idx} className="hover:bg-slate-50 text-xs">
            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.time}</td>
            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{log.user}</td>
            <td className="px-6 py-4 whitespace-nowrap text-slate-650">{log.action}</td>
            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.ip}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default AuditLogs;
