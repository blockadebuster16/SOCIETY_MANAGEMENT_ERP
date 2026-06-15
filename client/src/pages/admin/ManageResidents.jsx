import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, UserCheck, UserX, Trash2, Edit2, 
  X, Filter, Sparkles, Phone, Mail, Home, Calendar, Users, Download, Upload
} from 'lucide-react';
import { getResidents, saveResident, deleteResident } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';
import * as XLSX from 'xlsx';
import api from '../../services/api';

function ManageResidents() {
  const { addToast } = useToast();
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('ALL'); // 'ALL' | 'A' | 'B'
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form State
  const [editingResident, setEditingResident] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    flat: '',
    role: 'Owner',
    status: 'Active',
    occupiedDate: new Date().toISOString().split('T')[0]
  });

  // Load residents
  const loadResidents = () => {
    setResidents(getResidents());
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleOpenCreate = () => {
    setEditingResident(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      flat: '',
      role: 'Owner',
      status: 'Active',
      occupiedDate: new Date().toISOString().split('T')[0]
    });
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResident(res);
    setForm({
      name: res.name,
      email: res.email,
      phone: res.phone,
      flat: res.flat,
      role: res.role,
      status: res.status,
      occupiedDate: res.occupiedDate
    });
    setIsSlideOverOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.flat || !form.phone) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    const residentData = {
      id: editingResident ? editingResident.id : `res-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      email: form.email || `${form.name.toLowerCase().replace(/\s/g, '')}@example.com`,
      phone: form.phone,
      flat: form.flat.toUpperCase().replace(/\s/g, ''),
      role: form.role,
      status: form.status,
      occupiedDate: form.occupiedDate
    };

    saveResident(residentData);
    loadResidents();
    setIsSlideOverOpen(false);
    
    if (editingResident) {
      addToast(`Resident ${form.name} updated successfully.`, 'success');
    } else {
      addToast(`Resident ${form.name} onboarded into cooperative registry.`, 'success');
    }
  };

  const handleToggleStatus = (res) => {
    const updated = {
      ...res,
      status: res.status === 'Active' ? 'Inactive' : 'Active'
    };
    saveResident(updated);
    loadResidents();
    addToast(`Resident status for ${res.name} set to ${updated.status}.`, 'info');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from society registries?`)) {
      deleteResident(id);
      loadResidents();
      addToast(`Resident ${name} removed from registry index.`, 'success');
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(residents);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Residents");
    XLSX.writeFile(wb, "Residents_Export.xlsx");
    addToast('Excel export downloaded.', 'success');
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Transform headers to match backend expectations
        const formattedData = data.map(row => ({
          firstName: row.name ? row.name.split(' ')[0] : 'Unknown',
          lastName: row.name && row.name.split(' ').length > 1 ? row.name.split(' ').slice(1).join(' ') : '',
          email: row.email,
          phone: row.phone,
          role: 'resident',
          status: 'Active'
        }));

        const res = await api.post('/residents/bulk-import', { residents: formattedData });
        if (res.data.success) {
          addToast(`Imported ${res.data.results.successful} residents successfully!`, 'success');
          loadResidents(); // Refresh the list
        }
      } catch (error) {
        console.error("Excel Import Error:", error);
        addToast("Error importing from Excel.", 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Filter residents
  const filteredResidents = residents.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.phone.includes(searchQuery);
    
    if (wingFilter === 'ALL') return matchesSearch;
    const wingOfFlat = res.flat.charAt(0).toUpperCase();
    return matchesSearch && wingOfFlat === wingFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Society Registry Directory</h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Audit, modify member flats allocation, onboard tenants, and configure property listings.</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase transition shadow-sm hover:bg-slate-200"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase transition shadow-sm hover:bg-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase transition shadow-sm hover:opacity-90 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Resident</span>
          </button>
        </div>
      </div>

      {/* Directory Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search residents by name, flat number, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme"
          />
        </div>

        {/* Wing Filters */}
        <div className="flex gap-2">
          {['ALL', 'A', 'B'].map((wing) => (
            <button
              key={wing}
              onClick={() => setWingFilter(wing)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide border transition ${
                wingFilter === wing 
                  ? 'bg-society-primary border-society-primary text-white dark:bg-society-secondary dark:border-society-secondary dark:text-society-primary font-bold' 
                  : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
              }`}
            >
              {wing === 'ALL' ? 'All Units' : `Wing ${wing}`}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-theme">
        {filteredResidents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-3.5">Resident Profile</th>
                  <th className="px-6 py-3.5">Flat/Unit</th>
                  <th className="px-6 py-3.5">Contact Detail</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Registry Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                {filteredResidents.map((res) => (
                  <tr 
                    key={res.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-society-primary dark:text-[#D4AF37]">
                          {res.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-xs">{res.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Onboarded: {res.occupiedDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {res.flat}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-0.5 text-[11px]">
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span>{res.phone}</span></p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="text-slate-450">{res.email}</span></p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        res.role === 'Owner' 
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400' 
                          : 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400'
                      }`}>
                        {res.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        res.status === 'Active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(res)}
                        title={res.status === 'Active' ? 'Deactivate Member' : 'Activate Member'}
                        className={`p-2 rounded-lg transition border ${
                          res.status === 'Active'
                            ? 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600'
                        }`}
                      >
                        {res.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(res)}
                        title="Edit Details"
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id, res.name)}
                        title="Delete Resident"
                        className="p-2 rounded-lg border border-rose-500/10 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-650 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Residents Registered</h4>
            <p className="text-slate-450 text-xs mt-1">Adjust search parameters or click "Onboard Resident" to append member record.</p>
          </div>
        )}
      </div>

      {/* Onboard / Edit Slide-over Form Panel */}
      <AnimatePresence>
        {isSlideOverOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSlideOverOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-theme"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-bold text-society-primary dark:text-white text-sm">
                      {editingResident ? 'Modify Registry Details' : 'Onboard Flat Resident'}
                    </h3>
                    <p className="text-slate-400 text-[10px]">Appends record to master cooperative housing index.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSlideOverOpen(false)}
                  className="p-1.5 text-slate-450 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Resident Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramesh Shah"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme"
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Flat/Unit Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. A-102"
                      value={form.flat}
                      onChange={(e) => setForm({ ...form, flat: e.target.value })}
                      disabled={!!editingResident}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-450 font-mono transition-theme"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Occupancy Type</label>
                    <select 
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-bold"
                    >
                      <option value="Owner">Primary Owner</option>
                      <option value="Tenant">Rental Tenant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Contact Phone Number *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 98200 98765"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. rshah@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Occupancy Date</label>
                    <input 
                      type="date" 
                      value={form.occupiedDate}
                      onChange={(e) => setForm({ ...form, occupiedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Initial Status</label>
                    <select 
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-bold"
                    >
                      <option value="Active">Active verified</option>
                      <option value="Inactive">Pending audit</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-[10px] text-blue-700 dark:text-blue-400 leading-normal">
                  <strong>Verification Note:</strong> Setting a resident status to "Active verified" grants login capability and configures maintenance ledger runs under their flat number automatically.
                </div>
              </form>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsSlideOverOpen(false)}
                  className="border border-slate-250 text-slate-600 dark:border-slate-700 dark:text-slate-350 px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  type="submit"
                  className="bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold px-5 py-2 rounded-lg transition"
                >
                  {editingResident ? 'Update Member' : 'Onboard Member'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageResidents;
