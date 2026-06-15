import React from 'react';

function ManageGallery() {
  const images = [
    { id: 1, title: 'Main Entrance Gate', size: '2.4 MB' },
    { id: 2, title: 'Recreation Garden', size: '3.1 MB' }
  ];

  const handleUploadPhoto = (e) => {
    e.preventDefault();
    alert('Photo added to gallery successfully.');
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Society Gallery Management</h2>
        <p className="text-slate-500 text-xs mt-1">Upload files to public media galleries, festivals archives, or delete photos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Form */}
        <form onSubmit={handleUploadPhoto} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-society-primary text-sm border-b border-slate-100 pb-2">Add New Photo</h3>
          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Photo Title</label>
            <input type="text" placeholder="e.g. Holi Celebration 2026" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Select File</label>
            <input type="file" className="w-full text-xs text-slate-500" required />
          </div>
          <button type="submit" className="w-full bg-society-primary text-white font-bold text-xs py-2 rounded">Upload Photo</button>
        </form>

        {/* Existing photos table list */}
        <div className="md:col-span-2 bg-white border border-slate-205 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-society-primary text-sm border-b border-slate-100 pb-2">Gallery Upload Registry</h3>
          <div className="space-y-2.5">
            {images.map((img) => (
              <div key={img.id} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                <div>
                  <span className="font-semibold text-slate-800 block">{img.title}</span>
                  <span className="text-slate-400 text-[10px]">{img.size}</span>
                </div>
                <button className="text-society-danger hover:text-red-700 font-bold">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageGallery;
