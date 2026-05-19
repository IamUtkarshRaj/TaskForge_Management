# 🚀 TaskForge - Team Task Manager

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

**TaskForge** is a production-ready, full-stack project management application designed for teams. It features role-based access control, secure robust authentication, a real-time Kanban-style task lifecycle, and interactive dashboards.

## 🌟 Key Features

- **🔐 Robust Authentication:** JWT-based authentication utilizing HttpOnly cookies. Includes a highly resilient **LocalStorage fallback** designed to perfectly bypass modern browser third-party cookie restrictions when hosted on cross-domain platforms like Railway.
- **👥 Role-Based Access Control (RBAC):** Three distinct tiers: System Admin, Project Admin, and Member.
- **📁 Project & Team Management:** Create isolated projects, invite team members, and assign specific project-level roles.
- **✅ Task Lifecycle:** Track tasks through a strict lifecycle: `TODO` → `IN_PROGRESS` → `IN_REVIEW` → `DONE`.
- **📊 Interactive Dashboard:** Visual metrics utilizing Recharts for task distributions, overdue alerts, and completion tracking.
- **🛡️ Secure API:** Complete input validation via Zod, rate limiting, and strict CORS configuration.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/team-task-manager/frontend`)
- **Framework:** React 18 (Vite)
- **Data Fetching & State:** React Query (TanStack Query) + Axios interceptors for automated token rotation.
- **Styling & UI:** Custom CSS variables for a dark-mode first design, Lucide React for iconography, Recharts for data visualization.
- **Form Handling:** React Hook Form

### Backend (`/team-task-manager/backend`)
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (hosted on Neon Serverless)
- **ORM:** Prisma Client
- **Security:** bcryptjs (password hashing), jsonwebtoken (JWTs), express-rate-limit, cookie-parser.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL database (or a free Neon.tech account)
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Task-Manager/team-task-manager
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment.
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (you can copy `.env.example`):
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run database migrations and seed it with test data:
```bash
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```
*The backend will start on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd ../frontend
npm install
npm run dev
```
*The frontend will start on `http://localhost:5173`. The Vite proxy is automatically configured to forward `/api` requests to the local backend.*

---

## 🚢 Production Deployment (Railway)

This application is fully optimized for deployment on [Railway](https://railway.app/). Due to browser cross-domain cookie restrictions on `*.up.railway.app` domains, our hybrid AuthContext seamlessly handles token rotation.

### Backend Deployment
1. Create a new service on Railway connected to your repository, targeting the `team-task-manager/backend` root directory.
2. Add the following **Variables**:
   - `DATABASE_URL`: Your production Postgres connection string.
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`: Secure, random 64-character strings.
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: The public URL of your deployed frontend (e.g., `https://my-frontend.up.railway.app`).

### Frontend Deployment
1. Create a new service targeting the `team-task-manager/frontend` root directory.
2. Add the following **Variable**:
   - `VITE_API_URL`: The public URL of your deployed backend **with the `/api/v1` suffix** (e.g., `https://my-backend.up.railway.app/api/v1`).
3. **Important:** Trigger a redeploy of the frontend service *after* adding the variable so Vite can bake it into the static production bundle.

---

## 📖 API Documentation

**Base URL:** `/api/v1`

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| **POST** | `/auth/signup` | No | Create a new user account. |
| **POST** | `/auth/login` | No | Authenticate user & receive tokens. |
| **POST** | `/auth/refresh` | Yes | Rotate access and refresh tokens. |
| **GET**  | `/projects` | Yes | List all projects the user has access to. |
| **POST** | `/projects` | Yes | Create a new project. |
| **GET**  | `/projects/:id` | Member | Get project details & associated tasks. |
| **POST** | `/projects/:id/members`| Project Admin | Invite a user to a project by email. |
| **GET**  | `/projects/:id/tasks` | Member | List and filter project tasks. |
| **POST** | `/projects/:id/tasks` | Member | Create a new task in a project. |
| **PATCH**| `/tasks/:id/status` | Assignee/Admin| Update the status of a specific task. |
| **GET**  | `/tasks/dashboard` | Yes | Get aggregated statistics for the dashboard. |
| **GET**  | `/admin/users` | System Admin | Fetch a list of all system users. |

---

## 🧪 Test Credentials

Once you have run the database seed script (`node prisma/seed.js`), the following accounts will be available for testing:

- **System Administrator:**
  - Email: `admin@test.com`
  - Password: `password123`

- **Standard Member:**
  - Email: `member@test.com`
  - Password: `password123`

---

*Built with ❤️ for seamless project management.*
