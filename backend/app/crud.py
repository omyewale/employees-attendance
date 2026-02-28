from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from . import models

def create_employee(db: Session, employee):
    existing = db.query(models.Employee).filter(
        (models.Employee.employee_id == employee.employee_id) |
        (models.Employee.email == employee.email)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Employee already exists")

    new_employee = models.Employee(**employee.dict())
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


def get_employees(db: Session):
    return db.query(models.Employee).all()


def delete_employee(db: Session, emp_id: int):
    employee = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()


def mark_attendance(db: Session, attendance):
    # Check if already exists
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Attendance already marked for this employee on this date"
        )

    new_attendance = models.Attendance(**attendance.dict())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance


def get_attendance(db: Session, emp_id: int):
    return db.query(models.Attendance).filter(models.Attendance.employee_id == emp_id).all()