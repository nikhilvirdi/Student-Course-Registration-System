# SCRS

A student course registration system. Browse courses, manage enrollments, and track academic information.

## About SCRS

**SCRS (Student Course Registration System)** is a mini project built for **CSE 4th semester Database Management Systems (DBMS) coursework**. It provides a centralized platform for students to explore courses, register for classes, and view academic information, while administrators can manage courses, students, and enrollments.

Built with **React**, **Vite**, **Express.js**, **PostgreSQL**, and **Prisma**, the project focuses on practical DBMS concepts such as CRUD operations, relational data modeling, constraints, and transactions.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally with database `scrs_db`

### 1. Start the Backend
```bash
cd backend
npm install
npx prisma generate
node src/server.js
```
The backend server runs on `http://localhost:5000`.

### 2. Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The Vite development server runs on `http://localhost:3000`.

### 3. Build for Production (Frontend)
```bash
cd frontend
npm run build
npm run preview
```

---

## Project Structure

```
├── backend/                  # Express REST API & Prisma ORM
│   ├── prisma/               # Schema and database seed scripts
│   └── src/                  # Express controllers, routes, and middleware
├── frontend/                 # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # Layout & UI components (Navbar, Sidebar, Modals)
│   │   ├── context/          # AppContext (demo mode state) & ThemeContext
│   │   ├── pages/            # Student, Admin, and Auth routes
│   │   │   ├── student/      # Dashboard, Courses, Grades, Tasks, Profile, etc.
│   │   │   ├── admin/        # Console, Students, Courses, Enrollments, Grades, etc.
│   │   │   └── auth/         # Login & Register views
│   │   ├── lib/              # Utility functions and API client
│   │   ├── App.jsx           # React Router route configuration
│   │   ├── main.jsx          # Vite React root mount
│   │   └── index.css         # Tailwind & theme variables
│   ├── index.html            # Vite HTML entry point
│   ├── vite.config.js        # Vite config with API proxy
│   └── package.json          # Vite + React dependencies
└── README.md
```
