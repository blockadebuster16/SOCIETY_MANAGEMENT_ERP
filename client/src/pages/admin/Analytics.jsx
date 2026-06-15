import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { FileDown, Calendar, Filter, Download, PieChart as PieIcon, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

function Analytics() {
  const { addToast } = useToast();
  const [dateRange, setDateRange] = useState({ start: '2026-06-01', end: '2026-06-30' });

  // 1. Collections Data (Expected vs. Collected)
  const collectionsData = [
    { month: 'Jan', Expected: 492000, Collected: 485000 },
    { month: 'Feb', Expected: 492000, Collected: 489000 },
    { month: 'Mar', Expected: 492000, Collected: 480000 },
    { month: 'Apr', Expected: 517000, Collected: 505000 }, // Raised rates commercial
    { month: 'May', Expected: 517000, Collected: 510000 },
    { month: 'June', Expected: 517000, Collected: 442000 }  // Mid cycle
  ];

  // 2. Complaints Statuses
  const complaintsData = [
    { name: 'Resolved', value: 34, color: '#10B981' },
    { name: 'In Progress', value: 12, color: '#F59E0B' },
    { name: 'Open / Pending', value: 5, color: '#EF4444' },
    { name: 'Closed', value: 18, color: '#6B7280' }
  ];

  // 3. Visitor Traffic (Daily averages)
  const visitorTrafficData = [
    { day: 'Mon', Guests: 25, Deliveries: 45, Staff: 60 },
    { day: 'Tue', Guests: 18, Deliveries: 52, Staff: 62 },
    { day: 'Wed', Guests: 22, Deliveries: 40, Staff: 58 },
    { day: 'Thu', Guests: 30, Deliveries: 48, Staff: 64 },
    { day: 'Fri', Guests: 35, Deliveries: 60, Staff: 61 },
    { day: 'Sat', Guests: 65, Deliveries: 75, Staff: 30 },
    { day: 'Sun', Guests: 80, Deliveries: 82, Staff: 15 }
  ];

  // 4. Events RSVP & Attendance
  const eventsData = [
    { name: 'Holi Fest', Registered: 120, Attended: 105 },
    { name: 'AGM 2025', Registered: 95, Attended: 88 },
    { name: 'Yoga Camp', Registered: 42, Attended: 38 },
    { name: 'Blood Drive', Registered: 68, Attended: 62 }
  ];

  // 5. Occupancy Ratios
  const occupancyData = [
    { name: 'Residential Occupied', value: 102, color: '#0F2D52' },
    { name: 'Residential Vacant', value: 10, color: '#1E3A8A' },
    { name: 'Commercial Occupied', value: 22, color: '#D4AF37' },
    { name: 'Commercial Vacant', value: 3, color: '#F59E0B' }
  ];

  // CSV Export utility
  const handleCSVExport = (datasetName) => {
    let headers = [];
    let rows = [];
    let title = datasetName;

    if (datasetName === 'collections') {
      headers = ['Month', 'Expected Amount (INR)', 'Collected Amount (INR)'];
      rows = collectionsData.map(d => [d.month, d.Expected, d.Collected]);
    } else if (datasetName === 'complaints') {
      headers = ['Status Category', 'Total Count'];
      rows = complaintsData.map(d => [d.name, d.value]);
    } else if (datasetName === 'visitors') {
      headers = ['Day', 'Guests Count', 'Deliveries Count', 'Staff Count'];
      rows = visitorTrafficData.map(d => [d.day, d.Guests, d.Deliveries, d.Staff]);
    } else {
      headers = ['Event Name', 'RSVP Count', 'Attendance Count'];
      rows = eventsData.map(d => [d.name, d.Registered, d.Attended]);
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `society_analytics_${title}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`${title.toUpperCase()} data log exported successfully!`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Society Reports & Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Track coop billing audits, resident complaints resolution indexes, security visitor traffic, and block occupancy rates.
          </p>
        </div>

        {/* Global Date Filters */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl transition-theme">
          <Calendar className="w-4 h-4 text-slate-450" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="border-none bg-transparent dark:text-white text-xs outline-none focus:ring-0 w-28"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="border-none bg-transparent dark:text-white text-xs outline-none focus:ring-0 w-28"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'YTD Maintenance Collection Rate', val: '94.2%', sub: 'Target: 98% (Avg ₹4.9L/m)', color: 'text-emerald-500', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
          { label: 'Complaints Resolution Index', val: '80.6%', sub: 'Target: 85% (Resolved: 52/69)', color: 'text-blue-500', icon: <ShieldAlert className="w-5 h-5 text-blue-500" /> },
          { label: 'Weekly Visitor Volume', val: '815 entries', sub: 'Peak traffic: Saturdays & Sundays', color: 'text-amber-500', icon: <Users className="w-5 h-5 text-amber-500" /> },
          { label: 'Society Occupancy Density', val: '90.5%', sub: '124 of 137 units occupied', color: 'text-[#D4AF37]', icon: <PieIcon className="w-5 h-5 text-[#D4AF37]" /> }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-theme">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div className={`text-2xl font-extrabold mt-2 ${kpi.color}`}>{kpi.val}</div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Collections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-society-primary dark:text-white uppercase tracking-wider">Maintenance Billings & Collections</h3>
              <p className="text-[10px] text-slate-450">Monthly aggregate expected invoice amounts vs. actual receipts cleared.</p>
            </div>
            <button 
              onClick={() => handleCSVExport('collections')}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" className="hidden dark:block" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: 11, pt: 10 }} />
                <Bar dataKey="Expected" fill="#0F2D52" name="Expected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Collected" fill="#D4AF37" name="Collected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Visitor Traffic */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-society-primary dark:text-white uppercase tracking-wider">Visitor Logs & Check-In Traffic</h3>
              <p className="text-[10px] text-slate-450">Weekly volume breakdown by visitor category entering gate checkpoints.</p>
            </div>
            <button 
              onClick={() => handleCSVExport('visitors')}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorTrafficData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" className="hidden dark:block" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, pt: 10 }} />
                <Area type="monotone" dataKey="Guests" stroke="#4F46E5" fillOpacity={1} fill="url(#colorGuests)" name="Guests" />
                <Area type="monotone" dataKey="Deliveries" stroke="#F59E0B" fillOpacity={1} fill="url(#colorDeliveries)" name="Deliveries" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Complaints Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-society-primary dark:text-white uppercase tracking-wider">Member Complaints Status Indexes</h3>
              <p className="text-[10px] text-slate-450">Active vs. completed service request tickets cataloged by resolution stage.</p>
            </div>
            <button 
              onClick={() => handleCSVExport('complaints')}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {complaintsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs w-full sm:w-1/2">
              {complaintsData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">{item.value} tickets</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Events RSVPs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-society-primary dark:text-white uppercase tracking-wider">Events RSVP vs. Actual Attendance</h3>
              <p className="text-[10px] text-slate-450">Attendance track verification ratios for cooperative society gatherings.</p>
            </div>
            <button 
              onClick={() => handleCSVExport('events')}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, pt: 10 }} />
                <Bar dataKey="Registered" fill="#4F46E5" radius={[4, 4, 0, 0]} name="RSVP Registrants" />
                <Bar dataKey="Attended" fill="#10B981" radius={[4, 4, 0, 0]} name="Actual Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
