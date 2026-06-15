# REST API Architecture Specification (v1)

This document specifies the REST API contracts, payload schemas, versioning schemes, error codes, and headers for the **Suyash Pride Portal**.

## 1. Global Specifications

### A. API Prefix & Versioning
All endpoint routes must be prefixed with:
`/api/v1`

### B. Security Headers
Authenticated endpoints require a JWT token passed in the header:
`Authorization: Bearer <JWT_TOKEN>`

### C. Standard Error Payload
All error states (4xx, 5xx) must return a standardized JSON response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Detailed description of the validation failure.",
    "timestamp": "2026-06-11T22:15:00Z"
  }
}
```

---

## 2. Endpoint Registry & JSON Schemas

### A. Authentication Module (`/api/v1/auth`)

#### 1. `POST /api/v1/auth/register`
- **Description**: Registers a new resident profile.
- **Request Body**:
  ```json
  {
    "email": "resident@example.com",
    "password": "securePassword123",
    "firstName": "Parth",
    "lastName": "Patel",
    "phone": "9876543210"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "user": {
      "id": "uuid-string",
      "email": "resident@example.com",
      "role": "resident"
    }
  }
  ```

#### 2. `POST /api/v1/auth/login`
- **Description**: Verifies credentials and generates access token.
- **Request Body**:
  ```json
  {
    "email": "resident@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (`200 OK`)**: Same as register response.

---

### B. Property Management Module (`/api/v1/properties`)

#### 1. `GET /api/v1/properties`
- **Description**: Retrieves all properties (flat units, shops) in the database.
- **Query Filters**: `wingId=uuid&unitType=Residential`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "properties": [
      {
        "id": "uuid-string",
        "societyId": "uuid-string",
        "unitNumber": "A-102",
        "unitType": "Residential",
        "floorNumber": 1,
        "areaSqft": 1050.00,
        "ownershipStatus": "Owner Occupied"
      }
    ]
  }
  ```

---

### C. Resident Registry Module (`/api/v1/residents`)

#### 1. `GET /api/v1/residents/profile`
- **Description**: Fetch profile details of logged-in user.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "uuid-string",
      "firstName": "Parth",
      "lastName": "Patel",
      "email": "resident@example.com",
      "phone": "9876543210",
      "role": "resident"
    }
  }
  ```

---

### D. Notices Module (`/api/v1/notices`)

#### 1. `GET /api/v1/notices`
- **Description**: List all active circular notices.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "notices": [
      {
        "id": "uuid-string",
        "title": "Water Shutdown Notice",
        "content": "Water cleaning schedule...",
        "category": "Maintenance",
        "publishedAt": "2026-06-11T22:00:00Z"
      }
    ]
  }
  ```

---

### E. Document Center Module (`/api/v1/documents`)

#### 1. `POST /api/v1/documents/upload` (Multer, Admin Only)
- **Description**: Upload NOC templates or circular sheets.
- **Request (Multipart Form)**: File field `document` + Text fields `title`, `categoryId`.
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "document": {
      "id": "uuid-string",
      "title": "NOC resale form",
      "fileUrl": "https://supabase-storage-path/resale.pdf"
    }
  }
  ```

---

### F. Complaints Module (`/api/v1/complaints`)

#### 1. `POST /api/v1/complaints`
- **Description**: Log a new helpdesk repair ticket.
- **Request Body**:
  ```json
  {
    "propertyId": "uuid-string",
    "category": "Plumbing",
    "subject": "Ceiling leak in toilet",
    "description": "Leak from flat above...",
    "priority": "Medium"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "complaint": {
      "id": "uuid-string",
      "status": "Open",
      "createdAt": "2026-06-11T22:15:00Z"
    }
  }
  ```

---

### G. Payments Module (`/api/v1/payments`)

#### 1. `POST /api/v1/payments/create-order`
- **Description**: Request order generation from Razorpay.
- **Request Body**:
  ```json
  {
    "propertyId": "uuid-string",
    "amount": 3500.00,
    "purpose": "Maintenance Fee Jun 2026"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "orderId": "order_mock_razorpay_id",
    "amount": 3500.00
  }
  ```

---

### H. Events Module (`/api/v1/events`)

#### 1. `POST /api/v1/events/:id/register`
- **Description**: Register a resident RSVP for an upcoming program.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "RSVP registered successfully."
  }
  ```

---

### I. Gallery Module (`/api/v1/gallery`)

#### 1. `GET /api/v1/gallery`
- **Description**: Fetch all albums and their corresponding image URLs.

---

### J. Admin & Management Module (`/api/v1/admin`)

#### 1. `PATCH /api/v1/admin/complaints/:id/status` (Admin Only)
- **Description**: Resolve complaints or assign tasks.
- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "assignedTo": "uuid-string-contractor-id"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Complaint status updated."
  }
  ```
