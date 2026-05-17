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

All passwords are: **password123**

| Role    | Email              |
|---------|--------------------|
| Admin   | admin@gym.com      |
| Trainer | john@gym.com       |
| Trainer | sarah@gym.com      |
| Member  | alice@gym.com      |
| Member  | bob@gym.com        |
| Member  | charlie@gym.com    |

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
