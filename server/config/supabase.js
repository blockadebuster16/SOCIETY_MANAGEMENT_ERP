import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import fs from 'fs';
import path from 'path';

// File-based persistence path for mock database
const dbFilePath = path.resolve('db/mockDb.json');

// Ensure parent directory exists
const ensureDbDirExists = () => {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Seed initial database state if it doesn't exist
const getInitialDb = () => {
  const db = {
    societies: [
      {
        id: 'soc-1234',
        name: 'Suyash Pride Housing Society Ltd.',
        registration_number: 'MHR/NAVI-MUM/HS/12345/2026',
        address: 'Plot-1, Sector-5, Ulwe Node, Wahal, Raigad District',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '410206',
        latitude: 18.966900,
        longitude: 73.020300,
        email: 'management@suyashpride.in',
        phone: '+91 22 2345 6789',
        website: 'www.suyashpride.in'
      }
    ],
    wings: [
      { id: 'wing-a-uuid', society_id: 'soc-1234', wing_name: 'Wing A', description: 'Residential Tower Wing A' },
      { id: 'wing-b-uuid', society_id: 'soc-1234', wing_name: 'Wing B', description: 'Residential Tower Wing B' },
      { id: 'wing-c-uuid', society_id: 'soc-1234', wing_name: 'Wing C', description: 'Residential Tower Wing C' },
      { id: 'wing-d-uuid', society_id: 'soc-1234', wing_name: 'Wing D', description: 'Residential/Commercial Tower Wing D' }
    ],
    users: [
      // Parth Patel (Resident)
      { id: 'mock-u-parth', auth_user_id: 'mock-auth-id-parth', first_name: 'Parth', last_name: 'Patel', email: 'parth@suyashpride.in', phone: '+91 98765 43210', role: 'resident', status: 'Active' },
      { id: 'mock-u-parth', auth_user_id: 'mock-auth-id-parth', first_name: 'Parth', last_name: 'Patel', email: 'parth@example.com', phone: '+91 98765 43210', role: 'resident', status: 'Active' },
      
      // Rohan Sharma (Resident)
      { id: 'mock-u-rohan', auth_user_id: 'mock-auth-id-rohan', first_name: 'Rohan', last_name: 'Sharma', email: 'rohan@suyashpride.in', phone: '+91 91234 56780', role: 'resident', status: 'Active' },
      
      // Amit Joshi (Secretary / Committee Member)
      { id: 'mock-u-sec', auth_user_id: 'mock-auth-id-secretary', first_name: 'Amit', last_name: 'Joshi', email: 'secretary@suyashpride.in', phone: '+91 92223 34455', role: 'committee_member', status: 'Active' },
      { id: 'mock-u-sec', auth_user_id: 'mock-auth-id-secretary', first_name: 'Amit', last_name: 'Joshi', email: 'secretary@suyashpride.org', phone: '+91 92223 34455', role: 'committee_member', status: 'Active' },
      
      // Suresh Mehta (Treasurer / Committee Member)
      { id: 'mock-u-tres', auth_user_id: 'mock-auth-id-treasurer', first_name: 'Suresh', last_name: 'Mehta', email: 'treasurer@suyashpride.in', phone: '+91 93334 45566', role: 'committee_member', status: 'Active' },
      
      // Root Developer (Super Admin)
      { id: 'mock-u-sa', auth_user_id: 'mock-auth-id-superadmin', first_name: 'Root', last_name: 'Developer', email: 'superadmin@suyashpride.in', phone: '+91 94445 56677', role: 'super_admin', status: 'Active' },
      { id: 'mock-u-sa', auth_user_id: 'mock-auth-id-superadmin', first_name: 'Root', last_name: 'Developer', email: 'superadmin@suyashpride.org', phone: '+91 94445 56677', role: 'super_admin', status: 'Active' },
      
      // Guard (Security)
      { id: 'mock-u-guard', auth_user_id: 'mock-auth-id-guard', first_name: 'Bahadur', last_name: 'Singh', email: 'security@suyashpride.in', phone: '+91 95556 67788', role: 'security', status: 'Active' }
    ],
    properties: [],
    property_owners: [],
    tenants: [],
    gate_passes: [
      { id: 'gp-001', property_id: 'prop-a102', resident_id: 'mock-u-parth', pass_code: 'GP-A102X', visitor_name: 'Ramesh Shah', visitor_phone: '9876543210', visitor_type: 'Guest', purpose: 'Social Visit', valid_from: '2026-06-01T00:00:00.000Z', valid_to: '2026-06-30T23:59:59.000Z', status: 'Active', created_at: '2026-06-10T10:00:00.000Z' },
      { id: 'gp-002', property_id: 'prop-b101', resident_id: 'mock-u-rohan', pass_code: 'GP-B101Y', visitor_name: 'Amazon Delivery', visitor_phone: '9988776655', visitor_type: 'Delivery', purpose: 'Parcel Delivery', valid_from: '2026-06-14T00:00:00.000Z', valid_to: '2026-06-14T23:59:59.000Z', status: 'Active', created_at: '2026-06-14T08:00:00.000Z' }
    ],
    visitors: [],
    visitor_entries: [],
    security_logs: [
      { id: 'log-001', logged_by: 'mock-u-guard', log_text: 'Main gate night shift started. No anomalies observed.', category: 'General', severity: 'Info', created_at: '2026-06-14T02:00:00.000Z' },
      { id: 'log-002', logged_by: 'mock-u-guard', log_text: 'Wrong vehicle parked in slot A-102. Notified resident to move it.', category: 'Parking', severity: 'Warning', created_at: '2026-06-14T11:30:00.000Z' }
    ],
    notices: [
      { id: 'n-001', title: 'AGM 2026 — Annual General Meeting Notice', category: 'AGM', status: 'Published', is_pinned: true, created_at: '2026-06-01T10:00:00Z', created_by_name: 'Secretary', content: 'All members are cordially invited to attend the Annual General Meeting of Suyash Pride Housing Society Ltd.' },
      { id: 'n-002', title: 'Water Tank Cleaning Shutdown — June 15', category: 'Water Supply', status: 'Published', is_pinned: true, created_at: '2026-06-08T09:00:00Z', created_by_name: 'Maintenance Team', content: 'Water supply will be unavailable from 10 AM to 4 PM on June 15, 2026 due to tank cleaning.' }
    ],
    complaints: [
      { id: 'comp-101', title: 'Water leakage in Master Toilet ceiling', description: 'Continuous seepage from toilet ceiling A-202.', cat: 'Plumbing', status: 'IN_PROGRESS', date: 'Jun 10, 2026', flat: 'Flat A-102', residentName: 'Parth Patel', assignedTo: 'Ramesh Plumber', logs: [] }
    ],
    events: [
      { id: 'e-001', title: 'Annual General Meeting (AGM)', description: 'Society annual general updates and collections reports review.', location: 'Clubhouse Ground Floor', start_time: '2026-06-28T11:00:00Z', end_time: '2026-06-28T13:00:00Z', max_attendees: 150, status: 'Published', event_type: 'General Meeting', event_date: '28-Jun-2026' }
    ],
    event_registrations: [],
    event_gallery: [],
    maintenance_bills: [],
    receipts: [],
    chatbot_faqs: [
      { id: 'faq-1', question: 'What are the office timings of the committee office?', answer: 'The committee office is open on Saturdays & Sundays from 10:00 AM to 1:00 PM. It is located in the Ground Floor Lobby area.' },
      { id: 'faq-2', question: 'When is maintenance due and how much is it?', answer: 'Maintenance bills are generated on the 1st of every month. For residential units, it is ₹3,500/month, and for commercial units, it is ₹5,000/month. Dues must be paid by the 15th to avoid an 18% p.a. late fee interest penalty.' },
      { id: 'faq-3', question: 'What are the visitor parking rules?', answer: 'Visitors are permitted to park in slots V-01 to V-05 for up to 4 hours. All guest vehicles must be logged at the gate or pre-approved in the resident dashboard.' },
      { id: 'faq-4', question: 'How do I request a No Objection Certificate (NOC) for renting or sale?', answer: 'Download the NOC Application form from the Documents Repository. Fill it out and submit it along with copy of the agreement and tenant police verification at the society office.' }
    ],
    audit_logs: []
  };

  // Generate 112 Residential flats
  const wings = ['Wing A', 'Wing B', 'Wing C', 'Wing D'];
  const wingIds = { 'Wing A': 'wing-a-uuid', 'Wing B': 'wing-b-uuid', 'Wing C': 'wing-c-uuid', 'Wing D': 'wing-d-uuid' };
  
  wings.forEach(wingName => {
    const wingId = wingIds[wingName];
    for (let floor = 1; floor <= 7; floor++) {
      for (let unit = 1; unit <= 4; unit++) {
        const unitNo = `${wingName.replace('Wing ', '')}-${floor * 100 + unit}`;
        const propId = `prop-${unitNo.toLowerCase()}`;
        db.properties.push({
          id: propId,
          society_id: 'soc-1234',
          wing_id: wingId,
          unit_number: unitNo,
          unit_type: 'Residential',
          floor_number: floor,
          area_sqft: 1050.00,
          ownership_status: 'Owner Occupied',
          status: 'Active'
        });
      }
    }
  });

  // Generate 25 Commercial shops
  for (let shop = 1; shop <= 25; shop++) {
    const unitNo = `S-${String(shop).padStart(2, '0')}`;
    const propId = `prop-${unitNo.toLowerCase()}`;
    db.properties.push({
      id: propId,
      society_id: 'soc-1234',
      wing_id: 'wing-d-uuid', // Commercial general shop wing
      unit_number: unitNo,
      unit_type: 'Commercial',
      floor_number: 0,
      area_sqft: 450.00,
      ownership_status: 'Owner Occupied',
      status: 'Active'
    });
  }

  // Link owners
  db.property_owners.push(
    { id: 'po-1', property_id: 'prop-a-102', user_id: 'mock-u-parth', ownership_percentage: 100.00, is_primary_owner: true },
    { id: 'po-2', property_id: 'prop-b-101', user_id: 'mock-u-rohan', ownership_percentage: 100.00, is_primary_owner: true }
  );

  return db;
};

// Read database from file
const readMockDb = () => {
  ensureDbDirExists();
  if (!fs.existsSync(dbFilePath)) {
    const initial = getInitialDb();
    writeMockDb(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading mock database file:', e);
    return getInitialDb();
  }
};

// Write database to file
const writeMockDb = (data) => {
  ensureDbDirExists();
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing mock database file:', e);
  }
};

// Relationship Helper
const joinRelations = (tableName, row, db) => {
  if (!row) return row;
  const copy = { ...row };
  
  if (['gate_passes', 'visitor_entries', 'visitors'].includes(tableName)) {
    if (copy.property_id) {
      copy.properties = db.properties.find(p => p.id === copy.property_id || p.unit_number.toLowerCase() === copy.property_id.toLowerCase());
      if (copy.properties) {
        copy.properties = { ...copy.properties };
        copy.properties.wings = db.wings.find(w => w.id === copy.properties.wing_id);
      }
    }
  }
  
  if (tableName === 'visitor_entries') {
    if (copy.checked_in_by) {
      const u = db.users.find(user => user.id === copy.checked_in_by);
      copy.checked_in_by_user = u ? { first_name: u.first_name, last_name: u.last_name } : null;
    }
    if (copy.checked_out_by) {
      const u = db.users.find(user => user.id === copy.checked_out_by);
      copy.checked_out_by_user = u ? { first_name: u.first_name, last_name: u.last_name } : null;
    }
  }

  if (tableName === 'security_logs') {
    if (copy.logged_by) {
      const u = db.users.find(user => user.id === copy.logged_by);
      copy.logged_by_user = u ? { first_name: u.first_name, last_name: u.last_name } : null;
    }
  }

  if (tableName === 'property_owners') {
    if (copy.property_id) {
      copy.properties = db.properties.find(p => p.id === copy.property_id || p.unit_number.toLowerCase() === copy.property_id.toLowerCase());
      if (copy.properties) {
        copy.properties = { ...copy.properties };
        copy.properties.wings = db.wings.find(w => w.id === copy.properties.wing_id);
      }
    }
  }

  return copy;
};

// Mock Query Builder Implementation
class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.selectColumns = '*';
    this.orderByField = null;
    this.orderByAsc = true;
    this.limitCount = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.updateData = null;
    this.insertRows = null;
    this.isDelete = false;
  }

  select(columns = '*') {
    this.selectColumns = columns;
    return this;
  }

  insert(rows) {
    this.insertRows = rows;
    return this;
  }

  update(data) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(col, val) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  neq(col, val) {
    this.filters.push({ type: 'neq', col, val });
    return this;
  }

  gte(col, val) {
    this.filters.push({ type: 'gte', col, val });
    return this;
  }

  lte(col, val) {
    this.filters.push({ type: 'lte', col, val });
    return this;
  }

  in(col, array) {
    this.filters.push({ type: 'in', col, val: array });
    return this;
  }

  or(expr) {
    this.filters.push({ type: 'or', val: expr });
    return this;
  }

  like(col, val) {
    this.filters.push({ type: 'like', col, val });
    return this;
  }

  ilike(col, val) {
    this.filters.push({ type: 'ilike', col, val });
    return this;
  }

  order(col, options = {}) {
    this.orderByField = col;
    this.orderByAsc = options.ascending !== false;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Promise execution block
  async then(resolve, reject) {
    try {
      const db = readMockDb();
      if (!db[this.tableName]) {
        db[this.tableName] = [];
      }

      let data = db[this.tableName];

      // Perform mutation operations
      if (this.insertRows) {
        const rowsToInsert = Array.isArray(this.insertRows) ? this.insertRows : [this.insertRows];
        const inserted = rowsToInsert.map(row => {
          const newRow = { 
            id: row.id || `mock-id-${Math.random().toString(36).substring(2, 12)}`,
            created_at: new Date().toISOString(),
            ...row 
          };
          db[this.tableName].push(newRow);
          return newRow;
        });
        writeMockDb(db);
        
        const returnData = Array.isArray(this.insertRows) ? inserted : inserted[0];
        resolve({ data: joinRelations(this.tableName, returnData, db), error: null });
        return;
      }

      // Filter query rows
      this.filters.forEach(filter => {
        if (filter.type === 'eq') {
          data = data.filter(row => String(row[filter.col]) === String(filter.val));
        } else if (filter.type === 'neq') {
          data = data.filter(row => String(row[filter.col]) !== String(filter.val));
        } else if (filter.type === 'gte') {
          data = data.filter(row => row[filter.col] >= filter.val);
        } else if (filter.type === 'lte') {
          data = data.filter(row => row[filter.col] <= filter.val);
        } else if (filter.type === 'in') {
          data = data.filter(row => filter.val.includes(row[filter.col]));
        } else if (filter.type === 'like' || filter.type === 'ilike') {
          const searchVal = String(filter.val).replace(/%/g, '').toLowerCase();
          data = data.filter(row => String(row[filter.col] || '').toLowerCase().includes(searchVal));
        } else if (filter.type === 'or') {
          const clauses = filter.val.split(',');
          data = data.filter(row => {
            return clauses.some(clause => {
              const parts = clause.split('.');
              if (parts.length < 3) return false;
              const col = parts[0];
              const op = parts[1];
              const val = parts.slice(2).join('.').replace(/%/g, '').toLowerCase();
              if (op === 'like' || op === 'ilike') {
                return String(row[col] || '').toLowerCase().includes(val);
              }
              if (op === 'eq') {
                return String(row[col]) === val;
              }
              return false;
            });
          });
        }
      });

      // Update or Delete
      if (this.updateData) {
        data.forEach(row => {
          Object.assign(row, this.updateData, { updated_at: new Date().toISOString() });
        });
        writeMockDb(db);
        
        const updatedResponse = this.isSingle || this.isMaybeSingle ? data[0] : data;
        resolve({ data: Array.isArray(updatedResponse) ? updatedResponse.map(r => joinRelations(this.tableName, r, db)) : joinRelations(this.tableName, updatedResponse, db), error: null });
        return;
      }

      if (this.isDelete) {
        const idsToDelete = data.map(r => r.id);
        db[this.tableName] = db[this.tableName].filter(row => !idsToDelete.includes(row.id));
        writeMockDb(db);
        resolve({ data, error: null });
        return;
      }

      // Sort
      if (this.orderByField) {
        data.sort((a, b) => {
          const valA = a[this.orderByField];
          const valB = b[this.orderByField];
          if (valA < valB) return this.orderByAsc ? -1 : 1;
          if (valA > valB) return this.orderByAsc ? 1 : -1;
          return 0;
        });
      }

      // Limit
      if (this.limitCount !== null) {
        data = data.slice(0, this.limitCount);
      }

      // Join relationships
      let mappedData = data.map(row => joinRelations(this.tableName, row, db));

      // Shape of results
      if (this.isSingle) {
        if (mappedData.length === 0) {
          resolve({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
        } else {
          resolve({ data: mappedData[0], error: null });
        }
      } else if (this.isMaybeSingle) {
        resolve({ data: mappedData.length > 0 ? mappedData[0] : null, error: null });
      } else {
        resolve({ data: mappedData, error: null });
      }
    } catch (e) {
      console.error('Error executing mock query:', e);
      reject(e);
    }
  }

  catch(onRejected) {
    return Promise.resolve(this).catch(onRejected);
  }
}

// Mock Supabase Client Object
const createMockSupabaseClient = () => {
  return {
    auth: {
      signUp: async ({ email, password }) => {
        const db = readMockDb();
        const existing = db.users.find(u => u.email === email);
        if (existing) {
          return { data: { user: { id: existing.auth_user_id, email } }, error: null };
        }
        const authUserId = `mock-auth-id-${Math.random().toString(36).substring(2, 10)}`;
        // Save to users table mock too
        const newUser = {
          id: `mock-u-${Math.random().toString(36).substring(2, 6)}`,
          auth_user_id: authUserId,
          first_name: email.split('@')[0],
          last_name: 'User',
          email,
          phone: null,
          role: 'resident',
          status: 'Active'
        };
        db.users.push(newUser);
        writeMockDb(db);
        return { data: { user: { id: authUserId, email } }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const db = readMockDb();
        const user = db.users.find(u => u.email === email);
        if (!user) {
          return { data: { user: null }, error: { message: 'Invalid credentials', status: 401 } };
        }
        return { data: { user: { id: user.auth_user_id, email } }, error: null };
      },
      admin: {
        deleteUser: async (id) => {
          return { data: {}, error: null };
        }
      }
    },
    from: (tableName) => {
      return new MockQueryBuilder(tableName);
    }
  };
};

const isMock = env.supabaseUrl.includes('mock');

export const supabase = isMock ? createMockSupabaseClient() : createClient(env.supabaseUrl, env.supabaseAnonKey);

export const supabaseAdmin = isMock ? createMockSupabaseClient() : createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
