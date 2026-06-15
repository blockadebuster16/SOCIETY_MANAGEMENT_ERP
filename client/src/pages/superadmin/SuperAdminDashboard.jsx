import React from 'react';
import StatCard from '../../components/dashboard/StatCard';

function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-society-primary">Portal System Health</h2>
        <p className="text-slate-500 text-xs mt-1">Monitor Postgres connections, disk storage quotas, and API log metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="PostgreSQL DB Connections" value="18 / 100" description="Pool status: HEALTHY" icon="🔌" />
        <StatCard label="Total Storage Used" value="1.45 GB / 5 GB" description="Quota state: Normal" icon="💾" />
        <StatCard label="API Request Load (24h)" value="14,230 calls" description="Error rate: 0.02%" icon="🚀" />
        <StatCard label="Active User Sessions" value="11" description="4 Admins, 7 Residents" icon="🛡️" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-society-primary text-base border-b border-slate-100 pb-2">Subsystem States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
            <strong>Supabase Connection:</strong> Online (Latency 14ms)
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
            <strong>Razorpay Webhook:</strong> Active (Succeeded)
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
            <strong>Mail SMTP Relay:</strong> Active (Sending circulars)
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
