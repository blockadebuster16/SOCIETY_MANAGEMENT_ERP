// Client-side mock database using localStorage for state persistence between Resident and Admin portals.

const INITIAL_NOTICES = [
  { id: 'n-001', title: 'AGM 2025 — Annual General Meeting Notice', category: 'AGM', status: 'Published', is_pinned: true, created_at: '2026-06-01T10:00:00Z', created_by_name: 'Secretary', content: 'All members are cordially invited to attend the Annual General Meeting of Suyash Pride Housing Society Ltd.' },
  { id: 'n-002', title: 'Water Tank Cleaning Shutdown — June 15', category: 'Water Supply', status: 'Published', is_pinned: true, created_at: '2026-06-08T09:00:00Z', created_by_name: 'Maintenance Team', content: 'Water supply will be unavailable from 10 AM to 4 PM on June 15, 2026 due to tank cleaning. Please store sufficient water.' },
  { id: 'n-003', title: 'Corridor Pest Control Treatment Schedule', category: 'Maintenance', status: 'Published', is_pinned: false, created_at: '2026-06-05T08:30:00Z', created_by_name: 'Committee Office', content: 'Pest control treatment will be conducted in all corridors and common areas this weekend.' },
  { id: 'n-004', title: 'Emergency — Gas Leak Wing B Inspection', category: 'Emergency', status: 'Archived', is_pinned: false, created_at: '2026-05-20T14:00:00Z', created_by_name: 'President', content: 'Immediate inspection of Wing B gas lines is being conducted. Please vacate ground floor till further notice.' },
  { id: 'n-005', title: 'Holi Celebration & Cultural Events 2026', category: 'Festival', status: 'Archived', is_pinned: false, created_at: '2026-03-10T11:00:00Z', created_by_name: 'Cultural Committee', content: 'Join us for the Holi celebration in the society amphitheater.' },
  { id: 'n-006', title: 'New Visitor Security Protocol — Effective July 2026', category: 'Security', status: 'Draft', is_pinned: false, created_at: '2026-06-13T16:00:00Z', created_by_name: 'Security Manager', content: 'Draft of new visitor management guidelines for committee review.' },
];

const INITIAL_COMPLAINTS = [
  {
    id: 'comp-101',
    title: 'Water leakage in Master Toilet ceiling',
    description: 'There is continuous water seeping from the ceiling of the master toilet, possibly from flat A-202 above. It is spoiling the paint.',
    cat: 'Plumbing',
    status: 'IN_PROGRESS',
    date: 'Jun 10, 2026',
    flat: 'Flat A-102',
    residentName: 'Parth Patel',
    assignedTo: 'Ramesh Plumber (Cooperative Plumbers)',
    logs: [
      { time: '10-Jun-2026 10:30 AM', user: 'System', text: 'Ticket created successfully.' },
      { time: '11-Jun-2026 02:15 PM', user: 'Admin (Secretary)', text: 'Assigned plumber Ramesh Plumber to inspect toilet fittings in A-202.' }
    ]
  },
  {
    id: 'comp-098',
    title: 'Parking light socket spark',
    description: 'The electrical socket next to parking slot P-12 has visible sparks when plugging in the vehicle charger. Needs immediate inspection.',
    cat: 'Electrical',
    status: 'RESOLVED',
    date: 'May 12, 2026',
    flat: 'Flat A-102',
    residentName: 'Parth Patel',
    assignedTo: 'Sunil Electrician',
    logs: [
      { time: '12-May-2026 08:00 AM', user: 'System', text: 'Ticket created successfully.' },
      { time: '12-May-2026 11:30 AM', user: 'Admin', text: 'Assigned electrician Sunil.' },
      { time: '12-May-2026 04:00 PM', user: 'Sunil Electrician', text: 'Socket replaced. Checked insulation and wiring safety. Verified working.' },
      { time: '12-May-2026 04:30 PM', user: 'System', text: 'Ticket closed by resident approval.' }
    ]
  },
  {
    id: 'comp-105',
    title: 'Elevator Wing B emergency alarm button stuck',
    description: 'The emergency alarm button in elevator number 2 of Wing B is physically jammed/pressed down. Needs to be released and tested.',
    cat: 'Electrical',
    status: 'PENDING',
    date: 'Jun 13, 2026',
    flat: 'Flat B-504',
    residentName: 'Sanjay Shah',
    assignedTo: null,
    logs: [
      { time: '13-Jun-2026 09:15 AM', user: 'System', text: 'Ticket logged by resident.' }
    ]
  },
  {
    id: 'comp-106',
    title: 'CCTV Camera blind spot near garbage chute',
    description: 'The security camera on the Ground Floor next to the B-Wing garbage chute is angled downwards, causing a huge blind spot.',
    cat: 'Security',
    status: 'PENDING',
    date: 'Jun 14, 2026',
    flat: 'Flat B-201',
    residentName: 'Nisha Mehta',
    assignedTo: null,
    logs: [
      { time: '14-Jun-2026 01:20 PM', user: 'System', text: 'Ticket logged by resident.' }
    ]
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'inv-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Jun-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Flat A-102',
    residentName: 'Parth Patel',
    transactionId: null,
    receiptNo: null
  },
  {
    id: 'inv-2026-05',
    cycle: 'May 2026 Maintenance',
    amount: 3500,
    dueDate: '15-May-2026',
    status: 'SUCCESS',
    paidDate: '12-May-2026',
    flat: 'Flat A-102',
    residentName: 'Parth Patel',
    transactionId: 'pay_SpMay9281h',
    receiptNo: 'SP-REC-2026-05-102'
  },
  {
    id: 'inv-2026-04',
    cycle: 'April 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Apr-2026',
    status: 'SUCCESS',
    paidDate: '10-Apr-2026',
    flat: 'Flat A-102',
    residentName: 'Parth Patel',
    transactionId: 'pay_SpApr8293d',
    receiptNo: 'SP-REC-2026-04-102'
  },
  {
    id: 'inv-2026-03',
    cycle: 'March 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Mar-2026',
    status: 'SUCCESS',
    paidDate: '14-Mar-2026',
    flat: 'Flat A-102',
    residentName: 'Parth Patel',
    transactionId: 'pay_SpMar7218k',
    receiptNo: 'SP-REC-2026-03-102'
  },
  // Sanjay Shah Defaulter Setup (30+ and 60+ days)
  {
    id: 'inv-shah-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Jun-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Flat B-504',
    residentName: 'Sanjay Shah',
    transactionId: null,
    receiptNo: null
  },
  {
    id: 'inv-shah-2026-05',
    cycle: 'May 2026 Maintenance',
    amount: 3500,
    dueDate: '15-May-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Flat B-504',
    residentName: 'Sanjay Shah',
    transactionId: null,
    receiptNo: null
  },
  {
    id: 'inv-shah-2026-04',
    cycle: 'April 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Apr-2026',
    status: 'SUCCESS',
    paidDate: '12-Apr-2026',
    flat: 'Flat B-504',
    residentName: 'Sanjay Shah',
    transactionId: 'pay_shah_apr',
    receiptNo: 'SP-REC-2026-04-504'
  },
  // Nisha Mehta
  {
    id: 'inv-nisha-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Jun-2026',
    status: 'SUCCESS',
    paidDate: '14-Jun-2026',
    flat: 'Flat B-201',
    residentName: 'Nisha Mehta',
    transactionId: 'pay_nisha_jun',
    receiptNo: 'SP-REC-2026-06-201'
  },
  {
    id: 'inv-nisha-2026-05',
    cycle: 'May 2026 Maintenance',
    amount: 3500,
    dueDate: '15-May-2026',
    status: 'SUCCESS',
    paidDate: '11-May-2026',
    flat: 'Flat B-201',
    residentName: 'Nisha Mehta',
    transactionId: 'pay_nisha_may',
    receiptNo: 'SP-REC-2026-05-201'
  },
  // Rajesh Sharma
  {
    id: 'inv-raj-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Jun-2026',
    status: 'SUCCESS',
    paidDate: '10-Jun-2026',
    flat: 'Flat A-403',
    residentName: 'Rajesh Sharma',
    transactionId: 'pay_raj_jun',
    receiptNo: 'SP-REC-2026-06-403'
  },
  // Ankita Joshi
  {
    id: 'inv-ank-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Jun-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Flat B-102',
    residentName: 'Ankita Joshi',
    transactionId: null,
    receiptNo: null
  },
  // Vikram Malhotra (Inactive but has bill outstanding)
  {
    id: 'inv-vik-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 3500,
    dueDate: '15-Jun-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Flat A-501',
    residentName: 'Vikram Malhotra',
    transactionId: null,
    receiptNo: null
  },
  // Amit Gupta (Commercial Shop-01)
  {
    id: 'inv-amit-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 5000,
    dueDate: '15-Jun-2026',
    status: 'SUCCESS',
    paidDate: '11-Jun-2026',
    flat: 'Shop-01',
    residentName: 'Amit Gupta',
    transactionId: 'pay_amit_jun',
    receiptNo: 'SP-REC-2026-06-S01'
  },
  {
    id: 'inv-amit-2026-05',
    cycle: 'May 2026 Maintenance',
    amount: 5000,
    dueDate: '15-May-2026',
    status: 'SUCCESS',
    paidDate: '10-May-2026',
    flat: 'Shop-01',
    residentName: 'Amit Gupta',
    transactionId: 'pay_amit_may',
    receiptNo: 'SP-REC-2026-05-S01'
  },
  // Pooja Sharma (Commercial Shop-02) - Defaulter Setup (30+, 60+, 90+ days)
  {
    id: 'inv-pooja-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 5000,
    dueDate: '15-Jun-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Shop-02',
    residentName: 'Pooja Sharma',
    transactionId: null,
    receiptNo: null
  },
  {
    id: 'inv-pooja-2026-05',
    cycle: 'May 2026 Maintenance',
    amount: 5000,
    dueDate: '15-May-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Shop-02',
    residentName: 'Pooja Sharma',
    transactionId: null,
    receiptNo: null
  },
  {
    id: 'inv-pooja-2026-04',
    cycle: 'April 2026 Maintenance',
    amount: 5000,
    dueDate: '15-Apr-2026',
    status: 'PENDING',
    paidDate: null,
    flat: 'Shop-02',
    residentName: 'Pooja Sharma',
    transactionId: null,
    receiptNo: null
  },
  // Ketan Vora (Commercial Shop-03)
  {
    id: 'inv-ketan-2026-06',
    cycle: 'June 2026 Maintenance',
    amount: 5000,
    dueDate: '15-Jun-2026',
    status: 'SUCCESS',
    paidDate: '12-Jun-2026',
    flat: 'Shop-03',
    residentName: 'Ketan Vora',
    transactionId: 'pay_ketan_jun',
    receiptNo: 'SP-REC-2026-06-S03'
  }
];

const INITIAL_RESIDENTS = [
  { id: 'res-101', name: 'Parth Patel', email: 'parth@example.com', phone: '98200 12345', flat: 'A-102', role: 'Owner', status: 'Active', occupiedDate: '2024-10-12', unitType: 'Residential' },
  { id: 'res-102', name: 'Sanjay Shah', email: 'sanjay.s@example.com', phone: '98199 87654', flat: 'B-504', role: 'Owner', status: 'Active', occupiedDate: '2023-05-20', unitType: 'Residential' },
  { id: 'res-103', name: 'Nisha Mehta', email: 'nisha.m@example.com', phone: '97690 11223', flat: 'B-201', role: 'Tenant', status: 'Active', occupiedDate: '2025-01-15', unitType: 'Residential' },
  { id: 'res-104', name: 'Rajesh Sharma', email: 'sharma.r@example.com', phone: '98210 55667', flat: 'A-403', role: 'Owner', status: 'Active', occupiedDate: '2024-02-18', unitType: 'Residential' },
  { id: 'res-105', name: 'Ankita Joshi', email: 'ankita.j@example.com', phone: '91670 99887', flat: 'B-102', role: 'Tenant', status: 'Active', occupiedDate: '2025-04-01', unitType: 'Residential' },
  { id: 'res-106', name: 'Vikram Malhotra', email: 'vikram.m@example.com', phone: '98330 44556', flat: 'A-501', role: 'Owner', status: 'Inactive', occupiedDate: '2024-08-10', unitType: 'Residential' },
  { id: 'res-107', name: 'Amit Gupta', email: 'bakery@example.com', phone: '98200 99999', flat: 'Shop-01', role: 'Owner', status: 'Active', occupiedDate: '2024-11-01', unitType: 'Commercial' },
  { id: 'res-108', name: 'Pooja Sharma', email: 'meds@example.com', phone: '97690 88888', flat: 'Shop-02', role: 'Tenant', status: 'Active', occupiedDate: '2025-02-15', unitType: 'Commercial' },
  { id: 'res-109', name: 'Ketan Vora', email: 'ketan@example.com', phone: '98210 77777', flat: 'Shop-03', role: 'Owner', status: 'Active', occupiedDate: '2024-05-18', unitType: 'Commercial' }
];

const INITIAL_EVENTS = [
  {
    id: 'e-001',
    title: 'Monsoon Tree Plantation Drive',
    description: 'Let us plant 100 saplings in and around the society complex. Registered residents will get free gardening toolsets, soil kits, and high-tea coupons.',
    event_type: 'Cultural',
    eventType: 'Cultural',
    location: 'Society Perimeter Complex',
    event_date: '2026-07-12',
    eventDate: '2026-07-12',
    start_time: '09:00',
    startTime: '09:00',
    end_time: '12:00',
    endTime: '12:00',
    max_attendees: 50,
    maxAttendees: 50,
    status: 'Published',
    cover_image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    registrations: [
      { id: 'reg-001', resident_id: 'res-101', residentName: 'Parth Patel', flat: 'A-102', registration_status: 'Registered', registered_at: '2026-06-10T10:00:00Z', count: 2 }
    ],
    gallery: []
  },
  {
    id: 'e-002',
    title: 'Independence Day Flag Hoisting',
    description: 'Join the annual national flag hoisting ceremony at the main lawn, followed by cultural dances by children and breakfast.',
    event_type: 'Festival',
    eventType: 'Festival',
    location: 'Main Lawn Area',
    event_date: '2026-08-15',
    eventDate: '2026-08-15',
    start_time: '08:00',
    startTime: '08:00',
    end_time: '10:30',
    endTime: '10:30',
    max_attendees: 300,
    maxAttendees: 300,
    status: 'Published',
    cover_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    registrations: [],
    gallery: []
  },
  {
    id: 'e-003',
    title: 'Annual General Meeting (AGM) 2026',
    description: 'Annual General Meeting to discuss auditing reports, budget reviews, and maintenance planning for the next fiscal year.',
    event_type: 'AGM',
    eventType: 'AGM',
    location: 'Society Clubhouse Hall',
    event_date: '2026-06-28',
    eventDate: '2026-06-28',
    start_time: '10:00',
    startTime: '10:00',
    end_time: '13:00',
    endTime: '13:00',
    max_attendees: 150,
    maxAttendees: 150,
    status: 'Published',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    registrations: [],
    gallery: []
  },
  {
    id: 'e-004',
    title: 'Inter-Wing Cricket Championship',
    description: 'Annual society cricket league on the sports turf. Wing A vs Wing B matches with food stalls and trophy presentation.',
    event_type: 'Sports',
    eventType: 'Sports',
    location: 'Society Playground Turf',
    event_date: '2026-05-10',
    eventDate: '2026-05-10',
    start_time: '07:30',
    startTime: '07:30',
    end_time: '18:00',
    endTime: '18:00',
    max_attendees: 100,
    maxAttendees: 100,
    status: 'Completed',
    cover_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    registrations: [],
    gallery: [
      'https://images.unsplash.com/photo-154057467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'e-005',
    title: 'Emergency Fire Safety Drill',
    description: 'Mandatory fire evacuation drill conducted by local Wahal Fire Station officers. Training on extinguisher usage and exit protocols.',
    event_type: 'Emergency Meeting',
    eventType: 'Emergency Meeting',
    location: 'Society Main Compound & Driveway',
    event_date: '2026-06-20',
    eventDate: '2026-06-20',
    start_time: '16:00',
    startTime: '16:00',
    end_time: '17:30',
    endTime: '17:30',
    max_attendees: 200,
    maxAttendees: 200,
    status: 'Published',
    cover_image: 'https://images.unsplash.com/photo-1496307653780-3aee77888c76?auto=format&fit=crop&w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1496307653780-3aee77888c76?auto=format&fit=crop&w=800&q=80',
    registrations: [],
    gallery: []
  },
  {
    id: 'e-006',
    title: 'RFID Integration & Security Briefing',
    description: 'Admins-only briefing for planning gate RFID card distribution and security vendor handover.',
    event_type: 'Vendor Meeting',
    eventType: 'Vendor Meeting',
    location: 'Management Committee Office',
    event_date: '2026-06-19',
    eventDate: '2026-06-19',
    start_time: '11:00',
    startTime: '11:00',
    end_time: '13:00',
    endTime: '13:00',
    max_attendees: 15,
    maxAttendees: 15,
    status: 'Draft',
    cover_image: '',
    coverImage: '',
    registrations: [],
    gallery: []
  }
];

const INITIAL_SETTINGS = {
  penaltyRate: 18, // 18% per annum
  penaltyGraceDays: 5,
  monthlyMaintenanceAmount: 3500,
  shopMaintenanceAmount: 5000,
  lastBillingCycle: 'June 2026'
};

export const initMockDb = () => {
  if (!localStorage.getItem('suyash_notices')) {
    localStorage.setItem('suyash_notices', JSON.stringify(INITIAL_NOTICES));
  }
  if (!localStorage.getItem('suyash_complaints')) {
    localStorage.setItem('suyash_complaints', JSON.stringify(INITIAL_COMPLAINTS));
  }
  if (!localStorage.getItem('suyash_payments')) {
    localStorage.setItem('suyash_payments', JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem('suyash_residents')) {
    localStorage.setItem('suyash_residents', JSON.stringify(INITIAL_RESIDENTS));
  }
  if (!localStorage.getItem('suyash_settings')) {
    localStorage.setItem('suyash_settings', JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem('suyash_events')) {
    localStorage.setItem('suyash_events', JSON.stringify(INITIAL_EVENTS));
  }
};

// NOTICES HELPERS
export const getNotices = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem('suyash_notices'));
};

export const getNoticeById = (id) => {
  const list = getNotices();
  return list.find(n => n.id === id) || null;
};

export const saveNotice = (notice) => {
  const list = getNotices();
  const index = list.findIndex(n => n.id === notice.id);
  if (index >= 0) {
    list[index] = notice;
  } else {
    list.unshift(notice);
  }
  localStorage.setItem('suyash_notices', JSON.stringify(list));
  return list;
};

export const deleteNotice = (id) => {
  const list = getNotices();
  const filtered = list.filter(n => n.id !== id);
  localStorage.setItem('suyash_notices', JSON.stringify(filtered));
  return filtered;
};

// COMPLAINTS HELPERS
export const getComplaints = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem('suyash_complaints'));
};

export const getComplaintById = (id) => {
  const list = getComplaints();
  return list.find(c => c.id === id);
};

export const saveComplaint = (complaint) => {
  const list = getComplaints();
  const index = list.findIndex(c => c.id === complaint.id);
  if (index >= 0) {
    list[index] = complaint;
  } else {
    list.unshift(complaint);
  }
  localStorage.setItem('suyash_complaints', JSON.stringify(list));
  return list;
};

// PAYMENTS HELPERS
export const getPayments = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem('suyash_payments'));
};

export const getPaymentsForResident = (flat) => {
  const list = getPayments();
  // Filter for resident flat
  return list.filter(p => p.flat === flat || p.flat.includes(flat));
};

export const savePayment = (payment) => {
  const list = getPayments();
  const index = list.findIndex(p => p.id === payment.id);
  if (index >= 0) {
    list[index] = payment;
  } else {
    list.unshift(payment);
  }
  localStorage.setItem('suyash_payments', JSON.stringify(list));
  return list;
};

// RESIDENTS HELPERS
export const getResidents = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem('suyash_residents'));
};

export const saveResident = (res) => {
  const list = getResidents();
  const index = list.findIndex(r => r.id === res.id);
  if (index >= 0) {
    list[index] = res;
  } else {
    list.push(res);
  }
  localStorage.setItem('suyash_residents', JSON.stringify(list));
  return list;
};

export const deleteResident = (id) => {
  const list = getResidents();
  const filtered = list.filter(r => r.id !== id);
  localStorage.setItem('suyash_residents', JSON.stringify(filtered));
  return filtered;
};

// SETTINGS HELPERS
export const getSettings = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem('suyash_settings'));
};

export const saveSettings = (newSettings) => {
  const settings = { ...getSettings(), ...newSettings };
  localStorage.setItem('suyash_settings', JSON.stringify(settings));
  return settings;
};

// GENERATE DUES FOR A NEW CYCLE
export const generateBillingCycle = (cycleName, amount) => {
  const residents = getResidents().filter(r => r.status === 'Active');
  const payments = getPayments();
  const settings = getSettings();
  
  // Format cycle name e.g. "July 2026 Maintenance"
  const newBills = residents.map(res => {
    // Determine billing amount based on unitType if custom amount is not explicitly provided
    let billAmount = amount;
    if (!billAmount) {
      billAmount = res.unitType === 'Commercial' 
        ? (settings.shopMaintenanceAmount || 5000) 
        : (settings.monthlyMaintenanceAmount || 3500);
    }
    
    // Correct prefix based on property type
    const unitPrefix = res.unitType === 'Commercial' ? 'Shop ' : 'Flat ';
    const formattedFlat = res.flat.startsWith('Flat') || res.flat.startsWith('Shop') 
      ? res.flat 
      : `${unitPrefix}${res.flat}`;

    return {
      id: `inv-${Date.now()}-${res.flat}`,
      cycle: cycleName,
      amount: Number(billAmount),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/\s/g, '-'),
      status: 'PENDING',
      paidDate: null,
      flat: formattedFlat,
      residentName: res.name,
      transactionId: null,
      receiptNo: null
    };
  });

  const updatedPayments = [...newBills, ...payments];
  localStorage.setItem('suyash_payments', JSON.stringify(updatedPayments));
  
  // Update last billing cycle in settings
  saveSettings({ lastBillingCycle: cycleName.replace(' Maintenance', '') });
  
  return newBills.length;
};

// EVENTS HELPERS
export const getEvents = () => {
  initMockDb();
  return JSON.parse(localStorage.getItem('suyash_events'));
};

export const getEventById = (id) => {
  const list = getEvents();
  return list.find(e => e.id === id) || null;
};

export const saveEvent = (event) => {
  const list = getEvents();
  const index = list.findIndex(e => e.id === event.id);
  const formattedEvent = {
    ...event,
    event_type: event.event_type || event.eventType,
    eventType: event.eventType || event.event_type,
    event_date: event.event_date || event.eventDate,
    eventDate: event.eventDate || event.event_date,
    start_time: event.start_time || event.startTime,
    startTime: event.startTime || event.start_time,
    end_time: event.end_time || event.endTime,
    endTime: event.endTime || event.end_time,
    max_attendees: event.max_attendees !== undefined ? event.max_attendees : event.maxAttendees,
    maxAttendees: event.maxAttendees !== undefined ? event.maxAttendees : event.max_attendees,
    cover_image: event.cover_image !== undefined ? event.cover_image : event.coverImage,
    coverImage: event.coverImage !== undefined ? event.coverImage : event.cover_image,
    registrations: event.registrations || [],
    gallery: event.gallery || []
  };

  if (index >= 0) {
    list[index] = formattedEvent;
  } else {
    list.unshift(formattedEvent);
  }
  localStorage.setItem('suyash_events', JSON.stringify(list));
  return formattedEvent;
};

export const deleteEvent = (id) => {
  const list = getEvents();
  const filtered = list.filter(e => e.id !== id);
  localStorage.setItem('suyash_events', JSON.stringify(filtered));
  return filtered;
};

export const registerEventRSVP = (eventId, residentId, count = 1) => {
  const list = getEvents();
  const eventIndex = list.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return null;

  const event = list[eventIndex];
  
  const residents = getResidents();
  const resident = residents.find(r => r.id === residentId || r.flat === 'A-102');
  const residentName = resident ? resident.name : 'Resident';
  const flat = resident ? `Flat ${resident.flat}` : 'Flat A-102';

  if (!event.registrations) event.registrations = [];

  const existingRegIndex = event.registrations.findIndex(r => r.resident_id === residentId);
  if (existingRegIndex >= 0) {
    event.registrations[existingRegIndex] = {
      ...event.registrations[existingRegIndex],
      registration_status: 'Registered',
      registered_at: new Date().toISOString(),
      count: count
    };
  } else {
    event.registrations.push({
      id: `reg-${Date.now()}`,
      resident_id: residentId,
      residentName: residentName,
      flat: flat,
      registration_status: 'Registered',
      registered_at: new Date().toISOString(),
      count: count
    });
  }

  list[eventIndex] = event;
  localStorage.setItem('suyash_events', JSON.stringify(list));
  return event;
};

export const cancelEventRSVP = (eventId, residentId) => {
  const list = getEvents();
  const eventIndex = list.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return null;

  const event = list[eventIndex];
  if (!event.registrations) event.registrations = [];

  const existingRegIndex = event.registrations.findIndex(r => r.resident_id === residentId);
  if (existingRegIndex >= 0) {
    event.registrations[existingRegIndex].registration_status = 'Cancelled';
  }

  list[eventIndex] = event;
  localStorage.setItem('suyash_events', JSON.stringify(list));
  return event;
};

export const updateEventAttendance = (eventId, residentId, status) => {
  const list = getEvents();
  const eventIndex = list.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return null;

  const event = list[eventIndex];
  if (!event.registrations) event.registrations = [];

  const existingRegIndex = event.registrations.findIndex(r => r.resident_id === residentId);
  if (existingRegIndex >= 0) {
    event.registrations[existingRegIndex].registration_status = status;
  }

  list[eventIndex] = event;
  localStorage.setItem('suyash_events', JSON.stringify(list));
  return event;
};

export const uploadEventGalleryImages = (eventId, urls) => {
  const list = getEvents();
  const eventIndex = list.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return null;

  const event = list[eventIndex];
  if (!event.gallery) event.gallery = [];
  event.gallery = [...event.gallery, ...urls];

  list[eventIndex] = event;
  localStorage.setItem('suyash_events', JSON.stringify(list));
  return event;
};
