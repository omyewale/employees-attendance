# Employees Attendance System

A full-stack web application for managing employee records and tracking daily attendance.

## Live Demo
- **Frontend:** https://employees-attendance-app.vercel.app
- **Backend API:** https://employees-attendance.onrender.com
- **API Docs:** https://employees-attendance.onrender.com/docs

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Deployment | Vercel (Frontend), Render (Backend) |

## Features
- Add, edit, delete employees
- Mark daily attendance (Present / Absent / Late / Half Day / Sick Leave)
- Attendance calendar view per employee
- Search and filter employees
- Export to CSV
- Toast notifications
- Active/Inactive employee status

## Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```
Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hrms
```

## Assumptions & Limitations
- Render free tier sleeps after 15 min — first load may take 30 seconds
- Active/Inactive status is frontend-only (not persisted to DB)