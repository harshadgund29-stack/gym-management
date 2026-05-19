# 💪 FitPro — Gym Management System

A full-stack Gym Management System built with **Spring Boot**, **MySQL**, and **React**.

---

## 📁 Project Structure

```
gym-management-system/
├── backend/                        # Spring Boot (Maven) backend
│   ├── pom.xml
│   └── src/main/java/com/gym/
│       ├── GymManagementApplication.java
│       ├── entity/                 # JPA entities (database tables)
│       │   ├── Role.java
│       │   ├── User.java
│       │   ├── MembershipPlan.java
│       │   ├── Membership.java
│       │   ├── Payment.java
│       │   ├── TrainingSession.java
│       │   └── WorkoutPlan.java
│       ├── repository/             # Spring Data JPA repositories
│       ├── service/                # Business logic layer
│       ├── controller/             # REST API controllers
│       ├── dto/                    # Data Transfer Objects
│       ├── security/               # JWT + Spring Security
│       └── exception/              # Global error handling
│
├── frontend/                       # React frontend
│   ├── package.json
│   └── src/
│       ├── App.js                  # Routes
│       ├── context/AuthContext.js  # Global auth state
│       ├── api/                    # Axios API calls
│       ├── components/             # Shared components (Navbar, Layout)
│       └── pages/
│           ├── Login.js / Register.js
│           ├── admin/              # Admin dashboard pages
│           ├── trainer/            # Trainer pages
│           └── member/             # Member pages
│
└── database/
    ├── schema.sql                  # MySQL table definitions
    └── sample_data.sql             # Test data
```

---

## ⚙️ Prerequisites

| Tool        | Version  | Download |
|-------------|----------|----------|
| Java JDK    | 17+      | https://adoptium.net |
| Maven       | 3.8+     | https://maven.apache.org |
| MySQL       | 8.0+     | https://dev.mysql.com/downloads |
| Node.js     | 18+      | https://nodejs.org |
| npm         | 9+       | Included with Node.js |

---

## 🚀 Setup Instructions

### Step 1 — Set up MySQL

1. Start your MySQL server.
2. Open MySQL Workbench or the MySQL CLI.
3. Run the schema script:
   ```sql
   source /path/to/database/schema.sql
   ```
4. (Optional) Load sample data:
   ```sql
   source /path/to/database/sample_data.sql
   ```

### Step 2 — Configure the Backend

Open `backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.username=root        # your MySQL username
spring.datasource.password=root        # your MySQL password
```

> The database `gym_management` will be created automatically on first run.

### Step 3 — Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The API will start at **http://localhost:8080**

You should see: `Started GymManagementApplication`

### Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm start
```

The React app will open at **http://localhost:3000**

---

## 🔑 Demo Login Credentials

All accounts are seeded automatically by `DataInitializer` on every backend startup.

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@gmail.com        | 123456       |
| Trainer | trainer@fitpro.com     | trainer123   |
| Member  | member@fitpro.com      | member123    |

> Passwords are re-hashed with BCrypt on every startup, so they always match.

---

## 🔐 Authentication Flow

```
1. User submits email + password to POST /api/auth/login
2. Spring Security verifies credentials via BCrypt
3. Server generates a JWT token (valid 24 hours)
4. Frontend stores token in localStorage
5. Every subsequent request includes: Authorization: Bearer <token>
6. JwtAuthFilter validates the token on each request
7. Spring Security sets the user's role in the SecurityContext
8. @PreAuthorize annotations enforce role-based access
```

---

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Register new user  |
| POST   | /api/auth/login      | Login, get JWT     |

### Users (Protected)
| Method | Endpoint              | Role     | Description          |
|--------|-----------------------|----------|----------------------|
| GET    | /api/users            | ADMIN    | Get all users        |
| GET    | /api/users/members    | ADMIN    | Get all members      |
| GET    | /api/users/trainers   | ADMIN    | Get all trainers     |
| GET    | /api/users/profile    | Any      | Get own profile      |
| PUT    | /api/users/profile    | Any      | Update own profile   |
| DELETE | /api/users/{id}       | ADMIN    | Delete a user        |

### Membership Plans
| Method | Endpoint          | Role     | Description       |
|--------|-------------------|----------|-------------------|
| GET    | /api/plans        | Any      | Get all plans     |
| GET    | /api/plans/active | Any      | Get active plans  |
| POST   | /api/plans        | ADMIN    | Create plan       |
| PUT    | /api/plans/{id}   | ADMIN    | Update plan       |
| DELETE | /api/plans/{id}   | ADMIN    | Delete plan       |

### Memberships
| Method | Endpoint                        | Role         | Description            |
|--------|---------------------------------|--------------|------------------------|
| GET    | /api/memberships                | ADMIN        | Get all memberships    |
| GET    | /api/memberships/member/{id}    | ADMIN/MEMBER | Get member's memberships|
| POST   | /api/memberships                | ADMIN        | Create membership      |
| PATCH  | /api/memberships/{id}/status    | ADMIN        | Update status          |

### Payments
| Method | Endpoint                     | Role         | Description         |
|--------|------------------------------|--------------|---------------------|
| GET    | /api/payments                | ADMIN        | Get all payments    |
| GET    | /api/payments/member/{id}    | ADMIN/MEMBER | Get member payments |
| POST   | /api/payments                | ADMIN        | Record payment      |

### Training Sessions
| Method | Endpoint                       | Role            | Description          |
|--------|--------------------------------|-----------------|----------------------|
| GET    | /api/sessions                  | ADMIN           | Get all sessions     |
| GET    | /api/sessions/trainer/{id}     | ADMIN/TRAINER   | Trainer's sessions   |
| GET    | /api/sessions/member/{id}      | ADMIN/MEMBER    | Member's sessions    |
| POST   | /api/sessions                  | ADMIN/TRAINER   | Create session       |
| PUT    | /api/sessions/{id}             | ADMIN/TRAINER   | Update session       |
| DELETE | /api/sessions/{id}             | ADMIN/TRAINER   | Delete session       |

### Workout Plans
| Method | Endpoint                          | Role            | Description       |
|--------|-----------------------------------|-----------------|-------------------|
| GET    | /api/workout-plans/trainer/{id}   | ADMIN/TRAINER   | Trainer's plans   |
| GET    | /api/workout-plans/member/{id}    | ADMIN/MEMBER    | Member's plans    |
| POST   | /api/workout-plans                | ADMIN/TRAINER   | Create plan       |
| PUT    | /api/workout-plans/{id}           | ADMIN/TRAINER   | Update plan       |
| DELETE | /api/workout-plans/{id}           | ADMIN/TRAINER   | Delete plan       |

### Dashboard
| Method | Endpoint              | Role  | Description          |
|--------|-----------------------|-------|----------------------|
| GET    | /api/dashboard/stats  | ADMIN | Get statistics       |

---

## 📝 Example Requests

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gym.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@gym.com",
  "role": "ADMIN"
}
```

### Create Membership Plan
```http
POST /api/plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Gold",
  "description": "Full access plan",
  "price": 79.99,
  "durationMonths": 1,
  "features": "Gym Access, Pool, Classes, Sauna",
  "active": true
}
```

### Create Training Session
```http
POST /api/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "trainerId": 2,
  "memberId": 4,
  "title": "Morning Cardio",
  "description": "45-minute cardio session",
  "sessionDate": "2026-06-01T09:00:00",
  "durationMinutes": 45
}
```

---

## 🛠️ Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Backend     | Spring Boot 3.2, Java 17      |
| Security    | Spring Security + JWT (JJWT)  |
| Database    | MySQL 8 + JPA/Hibernate       |
| Frontend    | React 18                      |
| HTTP Client | Axios                         |
| Routing     | React Router v6               |
| Build Tool  | Maven                         |

---

## 🐛 Troubleshooting

**"Access denied" on API calls**
→ Make sure you're sending `Authorization: Bearer <token>` header.

**CORS errors in browser**
→ Ensure the backend is running on port 8080 and the `proxy` in `frontend/package.json` is set to `http://localhost:8080`.

**MySQL connection refused**
→ Check that MySQL is running and the credentials in `application.properties` are correct.

**"Table doesn't exist" errors**
→ Set `spring.jpa.hibernate.ddl-auto=create` on first run, then change back to `update`.

---

## 🔧 Environment Variables & Local Setup (Updated)

### Demo Credentials (seeded on every startup by DataInitializer)

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@gmail.com        | 123456       |
| Trainer | trainer@fitpro.com     | trainer123   |
| Member  | member@fitpro.com      | member123    |

---

### Setting Secrets Locally (never commit these)

**PowerShell:**
```powershell
$env:DB_USERNAME            = "root"
$env:DB_PASSWORD            = "your_mysql_password"
$env:JWT_SECRET             = "your_base64_jwt_secret_at_least_256_bits"
$env:SPRING_MAIL_USERNAME   = "harshadgund29@gmail.com"
$env:SPRING_MAIL_PASSWORD   = "your_16_char_google_app_password"
$env:CASHFREE_APP_ID        = "your_cashfree_sandbox_app_id"
$env:CASHFREE_SECRET_KEY    = "your_cashfree_sandbox_secret"
$env:PAYPAL_SANDBOX_CLIENT_ID = "your_paypal_sandbox_client_id"
```

**Bash:**
```bash
export DB_USERNAME="root"
export DB_PASSWORD="your_mysql_password"
export JWT_SECRET="your_base64_jwt_secret_at_least_256_bits"
export SPRING_MAIL_USERNAME="harshadgund29@gmail.com"
export SPRING_MAIL_PASSWORD="your_16_char_google_app_password"
export CASHFREE_APP_ID="your_cashfree_sandbox_app_id"
export CASHFREE_SECRET_KEY="your_cashfree_sandbox_secret"
export PAYPAL_SANDBOX_CLIENT_ID="your_paypal_sandbox_client_id"
```

> Gmail App Password: generate at https://myaccount.google.com/apppasswords (requires 2FA enabled)

---

### Build & Run (exact commands)

**Backend:**
```powershell
# PowerShell
cd "gym management system\backend"
& ".\apache-maven-3.9.8\bin\mvn.cmd" clean package -DskipTests=false 2>&1 | Tee-Object build-output.txt
& ".\apache-maven-3.9.8\bin\mvn.cmd" spring-boot:run
```

```bash
# Bash
cd "gym management system/backend"
./apache-maven-3.9.8/bin/mvn clean package -DskipTests=false 2>&1 | tee build-output.txt
./apache-maven-3.9.8/bin/mvn spring-boot:run
```

**Frontend:**
```powershell
cd "gym management system\frontend"
npm install
npm run dev
```

Open **http://localhost:5173**

---

### Running Acceptance Tests

**PowerShell** (start backend first):
```powershell
cd "gym management system"
.\scripts\acceptance-tests.ps1
```

**Bash** (start backend first):
```bash
cd "gym management system"
chmod +x scripts/acceptance-tests.sh
./scripts/acceptance-tests.sh
```

---

### Vite Proxy Configuration

`frontend/vite.config.js` already proxies all `/api` calls to the backend:
```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true, secure: false }
  }
}
```
The frontend never needs to know the backend port — all API calls use `/api/...`.

---

### Password Reset Flow (OTP)

```
1. POST /api/users/forgot-password  { "email": "..." }
   → Generates 6-digit OTP, stores in DB, sends via Gmail SMTP
   → Always returns 200 (prevents email enumeration)
   → OTP expires after 5 minutes (single-use)

2. POST /api/users/verify-otp  { "email": "...", "otp": 123456 }
   → Validates OTP (5-minute expiry)
   → Returns 400 if OTP is wrong or expired

3. POST /api/users/reset-password  { "email": "...", "newPassword": "..." }
   → Resets password with BCrypt hash, clears OTP session
   → NOTE: no "token" field — this is OTP-based, not link-based
```

---

### Payment Integration

#### Cashfree (INR payments)

| Method | Endpoint                    | Auth   | Description                              |
|--------|-----------------------------|--------|------------------------------------------|
| POST   | /cashfree/create-order      | MEMBER | Create Cashfree order, get session ID    |
| POST   | /cashfree/verify-order      | MEMBER | Verify payment after checkout redirect   |
| POST   | /cashfree/callback          | Public | Webhook called by Cashfree on completion |
| GET    | /cashfree/status            | ADMIN  | Show Cashfree config + environment       |

**Sandbox vs Production switch:**
```properties
# Sandbox (testing) — default
cashfree.environment=SANDBOX
cashfree.apiBaseUrl=https://sandbox.cashfree.com

# Production (live) — change both values
cashfree.environment=PRODUCTION
cashfree.apiBaseUrl=https://api.cashfree.com
```
Set via env vars: `CASHFREE_ENV=PRODUCTION` and `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` from the production API keys page.

**Webhook security:** Set `CASHFREE_WEBHOOK_SECRET` to the secret from your Cashfree dashboard. The backend verifies `x-webhook-signature` (HMAC-SHA256) on every webhook call. Without this, a malicious actor could fake a payment-success event.

#### PayPal (USD payments)

| Method | Endpoint                              | Auth   | Description                        |
|--------|---------------------------------------|--------|------------------------------------|
| POST   | /api/payments/paypal/create-order     | MEMBER | Create PayPal order                |
| POST   | /api/payments/paypal/capture-order    | MEMBER | Capture after PayPal approval      |

**Required env vars (both needed for server-side PayPal API calls):**
```
PAYPAL_SANDBOX_CLIENT_ID=...      # from developer.paypal.com → My Apps → Sandbox
PAYPAL_SANDBOX_CLIENT_SECRET=...  # required for access token exchange
```
> PayPal's Orders API v2 requires both client ID and client secret to obtain an access token. Without the secret, all server-side PayPal calls return 401.

---

### DB Migration

To convert all ID columns to BIGINT (run on staging first):
```sql
-- See backend-migrations/convert-ids-to-bigint.sql
-- Always backup before running!
```

---

### Key Endpoints

| Method | Endpoint                        | Auth          | Description                    |
|--------|---------------------------------|---------------|--------------------------------|
| POST   | /api/auth/login                 | Public        | Login, get JWT                 |
| POST   | /api/auth/register              | Public        | Register new user              |
| POST   | /api/users/forgot-password      | Public        | Send OTP to email              |
| POST   | /api/users/verify-otp           | Public        | Verify 6-digit OTP             |
| POST   | /api/users/reset-password       | Public        | Reset password (OTP-based)     |
| PUT    | /api/users/change-password      | JWT           | Change password                |
| GET    | /api/users/profile              | JWT           | Get own profile                |
| PUT    | /api/users/profile              | JWT           | Update own profile             |
| GET    | /api/users/members              | ADMIN         | All members from DB            |
| GET    | /api/users/trainers             | ADMIN         | All trainers from DB           |
| POST   | /api/attendance/mark            | JWT           | Check-in / check-out toggle    |
| GET    | /api/attendance/my              | JWT           | Own attendance history         |
| GET    | /api/attendance/my/count        | JWT           | Own total check-in count       |
| GET    | /api/attendance/today           | ADMIN/TRAINER | Today's check-ins              |
| GET    | /api/plans/active               | Public        | Active membership plans        |
| POST   | /cashfree/create-order          | MEMBER        | Create Cashfree payment order  |
| POST   | /cashfree/verify-order          | MEMBER        | Verify Cashfree payment        |
| POST   | /cashfree/callback              | Public        | Cashfree webhook (signed)      |
| POST   | /api/payments/paypal/create-order  | MEMBER     | Create PayPal order            |
| POST   | /api/payments/paypal/capture-order | MEMBER     | Capture PayPal payment         |
| GET    | /actuator/health                | Public        | Health check                   |
| GET    | /internal/smtp-status           | Dev only      | SMTP config + connection test  |
| GET    | /internal/test-email            | Dev only      | Send test OTP email            |
