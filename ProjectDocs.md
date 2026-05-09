# 1. Objectives

The main objective of this project is to develop a full-stack Student Course Registration System that allows students to register for courses through a centralized web application.

The system aims to:

- Provide secure student and admin authentication using JWT
- Allow students to browse and register for available courses
- Enable admins to manage students, courses, and enrollments
- Implement real database CRUD operations using PostgreSQL
- Demonstrate important DBMS concepts such as relationships, constraints, transactions, and normalization
- Maintain proper integration between frontend, backend, and database
- Provide a cleaner and more polished UI compared to basic academic projects

---

# 2. Features

## Student Features

- Student login authentication
- View available courses
- Search and filter courses
- Register for courses
- Drop registered courses
- View enrolled courses
- View total registered credits
- View prerequisite information
- View course descriptions and faculty information

## Admin Features

- Admin login authentication
- Add new courses
- Edit course details
- Delete courses
- Manage students
- View all enrollments
- Monitor seat availability

## Validation Features

- Duplicate enrollment prevention
- Seat limit validation
- Credit limit checking
- Prerequisite validation
- Protected routes using JWT
- Role-based access control

---

# 3. Tech Stack

## Frontend

- Next.js
- JavaScript
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL

## ORM

- Prisma ORM

## Authentication

- JWT (JSON Web Tokens)
- bcrypt password hashing

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon/Railway PostgreSQL

The project follows a modular monolith architecture with clear separation between frontend, backend, and database layers.

---

# 4. System Architecture

The project follows a Modular Monolith Architecture.

Architecture Flow:

Next.js Frontend

↓ REST API Requests

Express.js Backend

↓ Prisma ORM

PostgreSQL Database

## Frontend Responsibilities

- UI rendering
- Authentication state handling
- Sending API requests
- Dashboard and page navigation
- Form validation

## Backend Responsibilities

- Business logic
- Authentication and authorization
- Validation handling
- Enrollment processing
- Database operations
- API response handling

## Database Responsibilities

- Store students, courses, enrollments, admins, and prerequisites
- Maintain relationships and constraints
- Ensure data consistency and integrity

## Internal Backend Flow

Routes → Controllers → Services → Prisma ORM → PostgreSQL

- Routes handle API endpoints
- Controllers handle request/response logic
- Services contain business logic
- Prisma handles database communication

---

# 5. Database Schema

## Main Tables

### students

Stores student information.

- student_id
- name
- email
- password
- department_id
- semester

### admins

Stores admin credentials.

- admin_id
- name
- email
- password

### departments

Stores department details.

- department_id
- department_name

### faculty

Stores faculty information.

- faculty_id
- faculty_name
- email

### courses

Stores course details.

- course_id
- course_name
- description
- credits
- max_seats
- available_seats
- faculty_id
- department_id

### enrollments

Stores student-course registrations.

- enrollment_id
- student_id
- course_id
- enrollment_date

### prerequisites

Stores prerequisite relationships between courses.

- prerequisite_id
- course_id
- prerequisite_course_id

## Important Relationships

- One Department → Many Students
- One Department → Many Courses
- One Faculty → Many Courses
- Student ↔ Course = Many-to-Many Relationship through enrollments table

## Important Constraints

- Unique student email
- Unique admin email
- Foreign key constraints
- Seat availability validation
- Duplicate enrollment prevention

---

# 6. API Routes

## Authentication Routes

- POST /auth/login
- POST /auth/register
- GET /auth/me

## Student Routes

- GET /students/profile
- GET /students/dashboard
- GET /students/courses

## Course Routes

- GET /courses
- GET /courses/:id
- POST /courses
- PUT /courses/:id
- DELETE /courses/:id

## Enrollment Routes

- POST /enrollments/register
- DELETE /enrollments/drop/:id
- GET /enrollments/student/:id
- GET /enrollments

## Admin Routes

- GET /admin/dashboard
- GET /admin/students
- GET /admin/enrollments

All protected routes require JWT authentication.

---

# 7. Authentication Flow

The system uses JWT-based authentication with role-based access control.

## Login Flow

1. User enters email and password
2. Backend validates credentials
3. Password is verified using bcrypt
4. JWT token is generated
5. Token is sent to frontend
6. Frontend stores token
7. Protected routes use token for authentication

## Role-Based Access

Two user roles are supported:

- STUDENT
- ADMIN

### Student Access

Students can:

- View courses
- Register for courses
- Drop courses
- View enrolled courses
- Access student dashboard

### Admin Access

Admins can:

- Manage courses
- Manage students
- View enrollments
- Access admin dashboard

## Security Features

- JWT authentication
- Password hashing using bcrypt
- Protected API routes
- Role-based authorization
- Input validation

---

# 8. Folder Structure

## Frontend Structure

```bash
frontend/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── lib/
│   ├── types/
│   └── styles/
│
├── public/
└── package.json
```

## Backend Structure

```bash
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   └── admin/
│   │
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── .env
└── package.json
```

## Backend Module Structure

Each module contains:

- routes
- controllers
- services
- validations

Example:

```bash
auth/
├── auth.routes.js
├── auth.controller.js
├── auth.service.js
└── auth.validation.js
```

---

# 9. UI Page Structure

## Public Pages

### Login Page

Features:

- Student/Admin login
- Form validation
- JWT authentication

---

## Student Pages

### Student Dashboard

Features:

- Registered courses summary
- Credit summary
- Quick actions
- Recent enrollments

### Course Catalog Page

Features:

- View all courses
- Search courses
- Filter by department
- Seat availability
- Course descriptions

### Register Course Page

Features:

- Course enrollment
- Validation checks
- Enrollment status

### My Courses Page

Features:

- View registered courses
- Drop course
- Credits overview

### Student Profile Page

Features:

- Student details
- Department
- Semester
- Email information

---

## Admin Pages

### Admin Dashboard

Features:

- Total students
- Total courses
- Enrollment statistics

### Manage Courses Page

Features:

- Add course
- Edit course
- Delete course
- Manage seats

### Manage Students Page

Features:

- View students
- Add students
- Delete students

### Enrollment Management Page

Features:

- View all enrollments
- Filter enrollments
- Manage registrations

---

## Shared Components

- Navbar
- Sidebar
- ProtectedRoute
- CourseCard
- Search Bar
- Table Component
- Modal
- Toast Notifications
- Loader Component

---

# 10. Functional Requirements

## Authentication Requirements

- Users must be able to log in securely
- JWT tokens must protect private routes
- Passwords must be stored in hashed form
- Access control must be role-based

## Student Requirements

- Students should view available courses
- Students should register for courses
- Students should drop enrolled courses
- Students should view registered credits
- Students should view prerequisite information
- Students should access their dashboard and profile

## Admin Requirements

- Admins should manage courses
- Admins should manage students
- Admins should view all enrollments
- Admins should monitor seat availability

## Enrollment Requirements

- System must prevent duplicate enrollments
- System must validate seat availability
- System must validate prerequisite completion
- System must validate credit limits
- Enrollment data must persist in database

## Database Requirements

- Data must maintain referential integrity
- Relationships must use foreign keys
- CRUD operations must be dynamic
- Seed data should initialize demo accounts and courses

---

# 11. DBMS Concepts Used

## CRUD Operations

The project performs complete CRUD operations on:

- Students
- Courses
- Enrollments

## Primary Keys and Foreign Keys

Each table uses primary keys and foreign key relationships for proper data integrity.

Examples:

- student_id
- course_id
- enrollment_id

## Many-to-Many Relationships

The enrollments table creates a many-to-many relationship between students and courses.

Relationship:

Student ↔ Enrollment ↔ Course

## Normalization

The database schema is normalized to reduce redundancy and maintain consistency.

## Constraints

The system uses:

- Unique constraints
- Foreign key constraints
- Seat limit constraints
- Duplicate enrollment prevention

## Transactions

Enrollment operations are handled carefully to maintain consistency during:

- Course registration
- Seat updates
- Course dropping

## Referential Integrity

Foreign key relationships ensure valid connections between:

- Students and enrollments
- Courses and enrollments
- Departments and courses

## Joins

Database joins are used to fetch:

- Student enrolled courses
- Faculty course information
- Department course mappings

---

# 12. Seed Data Strategy

The project uses initial seed data for demonstration and testing purposes.

## Seeded Data Includes

- 1 Admin account
- 2–3 Student accounts
- Sample departments
- Sample faculty members
- Sample courses
- Prerequisite mappings

## Purpose of Seed Data

- Faster project demonstration
- Easier testing
- Immediate relationship setup
- Pre-configured course registrations

## Dynamic Database Operations

Although initial data is seeded, all operations are real database CRUD operations.

Examples:

- Adding students
- Adding courses
- Registering courses
- Dropping courses
- Updating course details

All changes persist permanently in PostgreSQL.

## Prisma Seed Script

Seed data is inserted using Prisma seed scripts during initial setup.

Example:

```bash
npx prisma db seed
```

This helps initialize the project database quickly before development or demonstration.

---

# 13. Folder Structure

## Frontend Folder Structure

```bash
frontend/
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── CourseCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Loader.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── RegisterCourse.jsx
│   │   ├── MyCourses.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ManageCourses.jsx
│   │   ├── ManageStudents.jsx
│   │   └── EnrollmentManagement.jsx
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── courseService.js
│   │   └── enrollmentService.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── types/
│
├── public/
└── package.json
```

---

## Backend Folder Structure

```bash
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── modules/
│   │
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── students/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   └── admin/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   │
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── .env
└── package.json
```

---

# 14. UI Page Structure

## Login Page

Purpose:

- User authentication

Features:

- Student/Admin login
- Form validation
- JWT authentication
- Error handling

---

## Student Dashboard

Purpose:

- Central dashboard for students

Features:

- Registered course summary
- Credit summary
- Quick actions
- Recent enrollments

---

## Course Catalog Page

Purpose:

- View all available courses

Features:

- Search courses
- Filter courses
- View seat availability
- View prerequisites
- View faculty information
- View course descriptions

---

## Register Course Page

Purpose:

- Course enrollment

Features:

- Register for courses
- Seat availability validation
- Credit limit validation
- Duplicate enrollment prevention
- Prerequisite validation

---

## My Courses Page

Purpose:

- Manage enrolled courses

Features:

- View registered courses
- Drop courses
- Credit overview

---

## Student Profile Page

Purpose:

- View student information

Features:

- Student details
- Department information
- Semester details
- Email details

---

## Admin Dashboard

Purpose:

- Central admin control panel

Features:

- Total students
- Total courses
- Total enrollments
- Enrollment statistics

---

## Manage Courses Page

Purpose:

- Course management

Features:

- Add courses
- Edit courses
- Delete courses
- Manage seat limits

---

## Manage Students Page

Purpose:

- Student management

Features:

- Add students
- View students
- Delete students
- Search students

---

## Enrollment Management Page

Purpose:

- Enrollment monitoring

Features:

- View all enrollments
- Filter enrollments
- Manage registrations

---

# 15. Project Workflow

## Student Registration Workflow

1. Student logs into the system
2. Student views available courses
3. Student selects a course
4. Backend validates:
    - Authentication
    - Duplicate enrollment
    - Seat availability
    - Credit limit
    - Prerequisite completion
5. Enrollment record is created
6. Available seats are updated
7. Dashboard data refreshes dynamically

---

## Course Drop Workflow

1. Student selects enrolled course
2. Drop request is sent to backend
3. Enrollment record is deleted
4. Course seat count increases
5. Updated data is reflected in dashboard

---

## Admin Workflow

1. Admin logs into system
2. Admin manages courses and students
3. Admin views enrollment records
4. Database updates persist dynamically

---

# 16. Conclusion

The Student Course Registration System is a full-stack DBMS mini project developed to simplify and manage the course enrollment process for students and administrators through a centralized web application.

The project implements important DBMS concepts such as CRUD operations, many-to-many relationships, foreign keys, normalization, constraints, transactions, and referential integrity using PostgreSQL and Prisma ORM.

The system provides secure JWT-based authentication, role-based access control, dynamic course registration, enrollment management, prerequisite validation, and real database persistence. The frontend, backend, and database are fully integrated to ensure proper data flow and system consistency.

The project demonstrates practical implementation of database management principles along with modern web development technologies including Next.js, Express.js, PostgreSQL, Prisma, and JWT authentication. It also maintains a clean modular architecture that improves maintainability, scalability, and code organization while remaining suitable for an academic mini project.

---