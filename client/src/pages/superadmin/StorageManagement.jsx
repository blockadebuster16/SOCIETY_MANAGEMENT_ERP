import React from 'react';

function StorageManagement() {
  const buckets = [
    { name: 'documents', files: 42, size: '890 MB', reads: 'Public/Resident' },
    { name: 'gallery', files: 120, size: '480 MB', reads: 'Public' },
    { name: 'complaints', files: 15, size: '80 MB', reads: 'Private' }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Supabase Storage Buckets</h2>
        <p className="text-slate-500 text-xs mt-1">Audit directories and clear orphan document uploads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buckets.map((b, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-lg hover:shadow-md transition space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-bold text-society-primary text-base uppercase">{b.name}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">{b.reads}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>Files Count:</span><strong>{b.files}</strong></div>
              <div className="flex justify-between"><span>Storage Occupied:</span><strong>{b.size}</strong></div>
            </div>
            <button className="w-full border border-society-danger text-society-danger hover:bg-rose-50 text-xs py-2 rounded transition">
              Flush Orphaned Uploads
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StorageManagement;
