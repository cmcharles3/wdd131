import datetime
import os
import smtplib
import sqlite3
from email.mime.text import MIMEText

# --- CONFIGURATION & SALARY SETUP ---
EMPLOYEES = {
    "Talent": {"monthly": 6000, "hourly": 6000 / 221},
    "Simba": {"monthly": 4500, "hourly": 4500 / 221},
}

MANAGER_EMAIL = "charles_cmcharles3@gmail.com"
SENDER_EMAIL = "talent_talent@cedar3tech"
SENDER_PASSWORD = "your_app_password"  # Gmail App Password


# --- DATABASE INITIALIZATION ---
def init_db():
    conn = sqlite3.connect("workshop_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS time_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee TEXT,
            clock_in TEXT,
            clock_out TEXT,
            hours_worked REAL,
            tasks_completed TEXT
        )
    """)
    conn.commit()
    conn.close()


# --- EMAIL REPORTING ENGINE ---
def send_remote_report(employee, clock_in, clock_out, hours, tasks):
    subject = f"Work Log Alert: {employee} - {datetime.date.today()}"
    body = (
        f"Technician: {employee}\n"
        f"Clock In: {clock_in}\n"
        f"Clock Out: {clock_out}\n"
        f"Hours Worked: {hours:.2f} hrs\n"
        f"Tasks Completed:\n{tasks}\n\n"
        f"Estimated Daily Earnings: R{hours * EMPLOYEES[employee]['hourly']:.2f}"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = MANAGER_EMAIL

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, MANAGER_EMAIL, msg.as_string())
        print("Report emailed successfully.")
    except Exception as e:
        print(f"Failed to send email report: {e}")


# --- SALARY CALCULATION FUNCTION ---
def calculate_payroll(employee, year, month):
    conn = sqlite3.connect("workshop_tracker.db")
    cursor = conn.cursor()

    # Sum up all completed hours for the target month
    cursor.execute(
        """
        SELECT SUM(hours_worked) FROM time_logs 
        WHERE employee = ? AND strftime('%Y', clock_in) = ? AND strftime('%m', clock_in) = ?
    """,
        (employee, str(year), f"{month:02d}"),
    )

    result = cursor.fetchone()[0]
    conn.close()

    total_hours = result if result else 0.0
    gross_pay = total_hours * EMPLOYEES[employee]["hourly"]
    return total_hours, gross_pay


init_db()