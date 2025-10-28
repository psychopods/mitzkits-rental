# Library Kit Management System

A comprehensive system for managing the borrowing of kits by students in a library-style environment. Built with Node.js, React, TypeScript, PostgreSQL, and Redis.

## Features

- Student account management (registration, status updates, flags)
- Kit catalog and condition tracking
- Borrowing/returning workflow
- Account status enforcement
- Configurable business rules
- Comprehensive logging
- Integration with Student Information System
- Email and SMS notifications
- Future payment system integration support

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for running databases)

## Project Structure

```
.
├── backend/               # Node.js Express backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── entities/     # TypeORM entities
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   └── tests/           # Backend tests
├── frontend/             # React Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── tests/          # Frontend tests
└── shared/              # Shared types and utilities
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the databases (using Docker):
   ```bash
   docker-compose up -d
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values as needed

5. Start the development servers:
   ```bash
   # Start backend
   npm run dev:backend

   # Start frontend
   npm run dev:frontend
   ```

## API Documentation

The API provides the following main endpoints:

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `PATCH /api/students/:id/status` - Update student status
- `POST /api/students/:id/flags` - Add flag to student
- `DELETE /api/students/:id/flags/:flag` - Remove flag from student

### Kits
- `GET /api/kits` - List all kits
- `GET /api/kits/:id` - Get kit details
- `POST /api/kits` - Create kit
- `PUT /api/kits/:id` - Update kit
- `PATCH /api/kits/:id/status` - Update kit status
- `POST /api/kits/:id/components` - Add component to kit
- `PUT /api/kits/:id/components/:componentId` - Update component
- `DELETE /api/kits/:id/components/:componentId` - Remove component

### Borrowing
- `GET /api/borrow` - List all transactions
- `GET /api/borrow/:id` - Get transaction details
- `POST /api/borrow` - Create borrow transaction
- `POST /api/borrow/:id/return` - Return kit
- `PATCH /api/borrow/:id/status` - Update transaction status

### Admin
- `GET /api/admin/config` - Get system configuration
- `PUT /api/admin/config` - Update system configuration
- `GET /api/admin/notifications` - Get notification settings
- `PUT /api/admin/notifications` - Update notification settings
- `POST /api/admin/retention` - Run data retention

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the ISC License.#mitzkits-rental
