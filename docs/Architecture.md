# Architectural Specification

This portal follows a clean, decoupled design model separating concerns into standard layers.

## Layered Design Pattern

```text
       +---------------------------------------------+
       |                  Frontend                   |
       |  (React 19 + React Router + React Query)    |
       +----------------------|----------------------+
                              | HTTP REST Requests
                              v
       +---------------------------------------------+
       |                  Backend                    |
       |             (Express.js API)                |
       +---|-------------------------------------|---+
           | Data Actions                        | Storage API
           v                                     v
+----------|----------+               +----------|----------+
|      Database       |               |     File Bucket     |
| (Supabase Postgres) |               |  (Supabase Storage) |
+---------------------+               +---------------------+
```

## Folder Division Rules

### 1. `client/`
Responsible for the visual representation, route management, styling, and API integration:
- **`src/layouts`**: Controls root container elements, sidebar grids, and standard navigational headers for different user roles.
- **`src/pages`**: View layers corresponding to browser pathways.
- **`src/components`**: Smaller widgets categorized by domain context (e.g. notices cards, payments tables).
- **`src/services`**: Direct API callers (utilizing Axios and React Query).

### 2. `server/`
Coordinates APIs, access verification, and business calculations:
- **`controllers/`**: Receives requests, handles HTTP codes, and routes payloads to services.
- **`services/`**: Holds logic blocks, interacts with libraries (Supabase DB, Razorpay, etc.).
- **`routes/`**: Binds endpoints to handlers.
- **`middleware/`**: Encapsulates guards for sessions and roles.

### 3. `shared/`
Contains common resources like validation schemas, global constants, and custom models to keep frontend and backend in sync.
