from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from . import schemas, crud
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/employees")
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db, employee)


@app.get("/employees")
def read_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)


@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    crud.delete_employee(db, emp_id)
    return {"message": "Deleted successfully"}


@app.post("/attendance")
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    return crud.mark_attendance(db, attendance)


@app.get("/attendance/{emp_id}")
def read_attendance(emp_id: str, db: Session = Depends(get_db)):
    return crud.get_attendance(db, emp_id)