import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Users, Car, Plus, Trash2, 
  Check, X, FileText, Info, ShieldAlert 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

function Profile() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'family' | 'vehicles'

  // Family Members State
  const [family, setFamily] = useState([
    { id: 'f1', name: 'Nisha Patel', relationship: 'Spouse', mobile: '98200 65432' },
    { id: 'f2', name: 'Aarav Patel', relationship: 'Child', mobile: '-' }
  ]);
  const [newFamilyForm, setNewFamilyForm] = useState({ name: '', relationship: 'Spouse', mobile: '' });
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  // Vehicles State
  const [vehicles, setVehicles] = useState([
    { id: 'v1', brand: 'Honda City', type: 'Car', regNo: 'MH-46-AZ-1234', slot: 'P-12' }
  ]);
  const [newVehicleForm, setNewVehicleForm] = useState({ brand: '', type: 'Car', regNo: '', slot: '' });
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Add Family Member
  const handleAddFamily = (e) => {
    e.preventDefault();
    if (!newFamilyForm.name) {
      addToast('Please input family member name.', 'warning');
      return;
    }
    const newMember = {
      id: 'f_' + Date.now(),
      name: newFamilyForm.name,
      relationship: newFamilyForm.relationship,
      mobile: newFamilyForm.mobile || '-'
    };
    setFamily([...family, newMember]);
    setNewFamilyForm({ name: '', relationship: 'Spouse', mobile: '' });
    setShowFamilyModal(false);
    addToast('Family member added to registry list.', 'success');
  };

  // Delete Family Member
  const handleDeleteFamily = (id, name) => {
    setFamily(family.filter(f => f.id !== id));
    addToast(`Removed ${name} from registry.`, 'info');
  };

  // Add Vehicle
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicleForm.brand || !newVehicleForm.regNo || !newVehicleForm.slot) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }
    const newVeh = {
      id: 'v_' + Date.now(),
      brand: newVehicleForm.brand,
      type: newVehicleForm.type,
      regNo: newVehicleForm.regNo.toUpperCase(),
      slot: newVehicleForm.slot.toUpperCase()
    };
    setVehicles([...vehicles, newVeh]);
    setNewVehicleForm({ brand: '', type: 'Car', regNo: '', slot: '' });
    setShowVehicleModal(false);
    addToast('Vehicle registered successfully.', 'success');
  };

  // Delete Vehicle
  const handleDeleteVehicle = (id, regNo) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    addToast(`Removed vehicle ${regNo} from slot logs.`, 'info');
  };

  const tabs = [
    { id: 'registry', label: 'Registry Info', icon: <User className="w-4 h-4" /> },
    { id: 'family', label: 'Family Roster', icon: <Users className="w-4 h-4" /> },
    { id: 'vehicles', label: 'Vehicle Records', icon: <Car className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-society-primary dark:text-white">Resident Registry Profile</h2>
        <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">Review official member allocations, parking slots, and registered residents.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-1 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition ${
              activeTab === tab.id
                ? 'border-[#D4AF37] text-society-primary dark:text-[#D4AF37] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          {activeTab === 'registry' && (
            // 1. REGISTRY DETAILS
            <motion.div
              key="registry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-theme">
                <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wide">Registry Details</h3>
                <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-250">
                  <div className="flex justify-between"><span className="text-slate-400">Full Name:</span><span className="font-bold">Parth Patel</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email Address:</span><span className="font-bold">parth@example.com</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Registered Phone:</span><span className="font-bold">+91 98200 12345</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Occupancy Type:</span><span className="font-bold bg-[#D4AF37]/10 text-society-primary dark:text-[#D4AF37] px-2 py-0.5 rounded">Primary Owner</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Flat allocation:</span><span className="font-bold">Flat A-102 (Wing A, Floor 1)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Membership Date:</span><span className="font-bold">Oct 12, 2024</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-theme flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wide">Agreement Details</h3>
                  <div className="space-y-3 pt-2 text-xs text-slate-550 dark:text-slate-400 leading-normal">
                    <p className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>Flat indices and sale registries are audited and certified under cooperative society register index-2.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>For updating ownership title or rental verification police records, please visit the society office.</span>
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/50 dark:border-slate-700 text-[10px] text-slate-500">
                  Contact admin for any discrepancies.
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'family' && (
            // 2. FAMILY ROSTER
            <motion.div
              key="family"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm uppercase tracking-wide">Family Members List</h3>
                <button
                  onClick={() => setShowFamilyModal(true)}
                  className="flex items-center gap-1.5 bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold px-3.5 py-1.5 rounded-lg text-xs tracking-wider transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              {family.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {family.map((f) => (
                    <div 
                      key={f.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 flex justify-between items-center transition"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{f.name}</h4>
                        <p className="text-slate-400 text-[10px] mt-0.5">{f.relationship} | Mobile: {f.mobile}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteFamily(f.id, f.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition"
                        aria-label="Remove Member"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No registered family members. Click Add Member to register.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'vehicles' && (
            // 3. VEHICLE RECORDS
            <motion.div
              key="vehicles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm uppercase tracking-wide">Registered Vehicles</h3>
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="flex items-center gap-1.5 bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold px-3.5 py-1.5 rounded-lg text-xs tracking-wider transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((v) => (
                    <div 
                      key={v.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 flex justify-between items-center transition"
                    >
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-slate-150 text-sm uppercase">{v.regNo}</h4>
                        <p className="text-slate-400 text-[10px] mt-0.5">{v.brand} ({v.type}) | Parking Bay: {v.slot}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteVehicle(v.id, v.regNo)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition"
                        aria-label="Remove Vehicle"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No registered vehicles found. Click Add Vehicle to register.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Family Member Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in scale-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Add Family Member</h4>
              <button onClick={() => setShowFamilyModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddFamily} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-750 dark:text-slate-350">Full Name *</label>
                <input 
                  type="text" 
                  value={newFamilyForm.name} 
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-755 dark:text-slate-355">Relationship *</label>
                <select 
                  value={newFamilyForm.relationship}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, relationship: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-750 dark:text-slate-350">Mobile Number</label>
                <input 
                  type="tel" 
                  value={newFamilyForm.mobile} 
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, mobile: e.target.value })} 
                  placeholder="e.g. 98200 98765"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-society-primary text-white hover:bg-slate-800 py-2.5 rounded-lg text-xs font-bold transition"
              >
                Add to Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in scale-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Register Vehicle</h4>
              <button onClick={() => setShowVehicleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-750 dark:text-slate-350">Make / Model *</label>
                <input 
                  type="text" 
                  value={newVehicleForm.brand} 
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, brand: e.target.value })} 
                  placeholder="e.g. Honda City, Activa"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-755 dark:text-slate-355">Vehicle Type *</label>
                <select 
                  value={newVehicleForm.type}
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                >
                  <option value="Car">4-Wheeler (Car)</option>
                  <option value="Two-Wheeler">2-Wheeler (Bike/Scooter)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-750 dark:text-slate-350">Registration Number *</label>
                <input 
                  type="text" 
                  value={newVehicleForm.regNo} 
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, regNo: e.target.value })} 
                  placeholder="e.g. MH-46-AZ-1234"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-750 dark:text-slate-350">Allotted Parking Slot *</label>
                <input 
                  type="text" 
                  value={newVehicleForm.slot} 
                  onChange={(e) => setNewVehicleForm({ ...newVehicleForm, slot: e.target.value })} 
                  placeholder="e.g. P-12"
                  className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-society-primary text-white hover:bg-slate-800 py-2.5 rounded-lg text-xs font-bold transition"
              >
                Register Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
