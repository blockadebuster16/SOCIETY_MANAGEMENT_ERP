import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Grid, Sun, Landmark, ZoomIn, X, Info } from 'lucide-react';

function FloorPlans() {
  const [activeTab, setActiveTab] = useState('residential');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = useMemo(() => ({
    residential: [
      { 
        id: 'r1',
        title: 'Wing A & C Typical Floor Plan', 
        desc: 'Floors 1st to 7th. Houses 4 flats per floor (2 BHK configurations).', 
        specs: { area: '1050 sq.ft.', configurations: '4 Flats per Floor', type: '2 BHK Premium' },
        blueprint: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
      },
      { 
        id: 'r2',
        title: 'Wing B & D Typical Floor Plan', 
        desc: 'Floors 1st to 7th. Houses 4 flats per floor (1 BHK & 2 BHK configurations).', 
        specs: { area: '750 - 980 sq.ft.', configurations: '4 Flats per Floor', type: '1 BHK & 2 BHK' },
        blueprint: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
      }
    ],
    commercial: [
      { 
        id: 'c1',
        title: 'Ground Floor Commercial Arcade Layout', 
        desc: 'Shops S-01 to S-25. Strategically located road-facing units with parking bays.', 
        specs: { units: '25 Retail Shops', sizeRange: '250 - 600 sq.ft.', frontage: '12 ft. average' },
        blueprint: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
      }
    ],
    utilities: [
      { 
        id: 'u1',
        title: 'Ground Level & Stilt Parking Grid Map', 
        desc: 'Allotted vehicle parking grid slots for 112 flats and 25 commercial shops.', 
        specs: { slots: '95 Car Bays / 140 Two-Wheelers', security: 'CCTV covered', heightLimit: '8.2 ft.' },
        blueprint: 'https://images.unsplash.com/photo-1506521788701-1e13a7222e2a?auto=format&fit=crop&w=600&q=80'
      },
      { 
        id: 'u2',
        title: 'Terrace Solar Grid & Water Harvest Layout', 
        desc: 'Solar panel configuration scheme and rainwater harvesting pipe lines.', 
        specs: { solarCapacity: '40 kWp Grid', rainwaterTanks: '50,000 Litres', location: 'Wing A-D Terraces' },
        blueprint: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80'
      }
    ]
  }), []);

  const tabs = [
    { id: 'residential', label: 'Residential Towers', icon: <Building className="w-4 h-4" /> },
    { id: 'commercial', label: 'Commercial Arcade', icon: <Landmark className="w-4 h-4" /> },
    { id: 'utilities', label: 'Common Utilities', icon: <Grid className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">
          Floor Plans & Blueprints
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          Review structural layout maps for residential units, ground retail shops, and common service areas.
        </p>
      </div>

      {/* Tab selectors */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold tracking-wide transition-all ${
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

      {/* Grid list of plans */}
      <div className="min-h-[350px]">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {plans[activeTab].map((plan) => (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-theme"
              >
                {/* Blueprint Preview Frame */}
                <div 
                  onClick={() => setSelectedPlan(plan)}
                  className="h-56 bg-slate-100 dark:bg-slate-950 relative overflow-hidden group cursor-zoom-in border-b border-slate-200 dark:border-slate-850"
                >
                  <img 
                    src={plan.blueprint} 
                    alt={plan.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 dark:opacity-60" 
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-white/95 text-society-primary px-4 py-2 rounded-lg font-bold text-xs shadow-md">
                      <ZoomIn className="w-4 h-4" />
                      <span>Inspect Plan</span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-150 text-base">{plan.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{plan.desc}</p>
                  </div>

                  {/* Specs Pill List */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-slate-400">
                    {Object.entries(plan.specs).map(([key, val]) => (
                      <span key={key} className="flex items-center gap-1.5 capitalize">
                        <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span><strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Blueprint Inspect Modal Popup */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlan(null)}
            className="fixed inset-0 bg-slate-950/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
              aria-label="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center gap-4 relative"
            >
              <img
                src={selectedPlan.blueprint}
                alt={selectedPlan.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
              <div className="text-center text-white space-y-1 px-4 max-w-xl">
                <h3 className="font-extrabold text-base md:text-lg">{selectedPlan.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{selectedPlan.desc}</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 text-[10px] text-slate-300">
                  {Object.entries(selectedPlan.specs).map(([key, val]) => (
                    <span key={key} className="capitalize">
                      <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FloorPlans;
