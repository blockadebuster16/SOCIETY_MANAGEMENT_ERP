/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} role - 'RESIDENT' | 'ADMIN' | 'SUPERADMIN'
 * @property {string} name
 * @property {string} flatNumber
 */

/**
 * @typedef {Object} Notice
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt
 * @property {string} authorId
 */

/**
 * @typedef {Object} Complaint
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status - 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'
 * @property {string} residentId
 * @property {string} createdAt
 */

export const TypesPlaceholder = {};
