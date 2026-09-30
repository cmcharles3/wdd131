import datetime
import os
import smtplib
import sqlite3
import tkinter as tk
from email.mime.text import MIMEText
from tkinter import messagebox, ttk

# --- CONFIGURATION ---
EMPLOYEES = {
    "Talent": {"monthly": 6000, "hourly": 6000 / 221},
    "Simba": {"monthly": 4500, "hourly": 4500 / 221},
}

MANAGER_EMAIL = "cmcharles3@gmail.com"
SENDER_EMAIL = "cedar3tech@gmail.com"
SENDER_PASSWORD = "Cybrary@3"  # Gmail App Password


# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect("workshop_tracker.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS active_sessions (
            employee TEXT PRIMARY KEY,
            clock_in_time TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS time_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee TEXT,
            clock_in TEXT,
            clock_out TEXT,
            hours_worked REAL,
            tasks_completed TEXT,
            earned_amount REAL
        )
    """)
    conn.commit()
    conn.close()


# --- EMAIL ENGINE ---
def send_email_report(employee, clock_in, clock_out, hours, tasks, earned):
    subject = f"Work Log: {employee} - {datetime.date.today()}"
    body = (
        f"Technician: {employee}\n"
        f"Clock In: {clock_in}\n"
        f"Clock Out: {clock_out}\n"
        f"Hours Worked: {hours:.2f} hrs\n"
        f"Earnings for Session: R{earned:.2f}\n\n"
        f"Tasks Completed / Progress:\n{tasks}"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = MANAGER_EMAIL

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, MANAGER_EMAIL, msg.as_string())
    except Exception as e:
        print(f"Email failed to send: {e}")


# --- GUI APPLICATION ---
class WorkshopTrackerApp:

    def __init__(self, root):
        self.root = root
        self.root.title("Cedar3 Technology - Workshop Time & Progress Tracker")
        self.root.geometry("500x550")
        self.root.resizable(False, False)

        init_db()

        # Header
        title_label = ttk.Label(
            root,
            text="Workshop Progress & Hours Tracker",
            font=("Helvetica", 14, "bold"),
        )
        title_label.pack(pady=15)

        # Employee Selection
        ttk.Label(root, text="Select Technician:", font=("Helvetica", 10)).pack(
            pady=5
        )
        self.emp_var = tk.StringVar()
        self.emp_dropdown = ttk.Combobox(
            root,
            textvariable=self.emp_var,
            values=list(EMPLOYEES.keys()),
            state="readonly",
        )
        self.emp_dropdown.pack(pady=5)
        self.emp_dropdown.current(0)

        # Status Label
        self.status_label = ttk.Label(
            root,
            text="Status: Ready",
            font=("Helvetica", 10, "italic"),
            foreground="gray",
        )
        self.status_label.pack(pady=10)

        # Buttons Frame
        btn_frame = ttk.Frame(root)
        btn_frame.pack(pady=10)

        self.clock_in_btn = ttk.Button(
            btn_frame, text="Clock In", command=self.clock_in
        )
        self.clock_in_btn.grid(row=0, column=0, padx=10)

        self.clock_out_btn = ttk.Button(
            btn_frame, text="Clock Out", command=self.clock_out
        )
        self.clock_out_btn.grid(row=0, column=1, padx=10)

        # Task Entry Section
        ttk.Label(
            root,
            text="Log Current Jobs / Tasks Completed:",
            font=("Helvetica", 10, "bold"),
        ).pack(pady=(15, 5))
        self.task_text = tk.Text(root, height=10, width=50)
        self.task_text.pack(pady=5)

    def clock_in(self):
        emp = self.emp_var.get()
        conn = sqlite3.connect("workshop_tracker.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT clock_in_time FROM active_sessions WHERE employee = ?",
            (emp,),
        )
        session = cursor.fetchone()

        if session:
            messagebox.showwarning(
                "Already Clocked In", f"{emp} is already clocked in!"
            )
        else:
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute(
                "INSERT INTO active_sessions VALUES (?, ?)", (emp, now)
            )
            conn.commit()
            messagebox.showinfo(
                "Clocked In", f"{emp} clocked in successfully at {now}"
            )
            self.status_label.config(
                text=f"Status: {emp} Active since {now}", foreground="green"
            )

        conn.close()

    def clock_out(self):
        emp = self.emp_var.get()
        tasks = self.task_text.get("1.0", tk.END).strip()

        if not tasks:
            messagebox.showerror(
                "Missing Progress Report",
                "You must record the jobs/tasks completed before clocking out!",
            )
            return

        conn = sqlite3.connect("workshop_tracker.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT clock_in_time FROM active_sessions WHERE employee = ?",
            (emp,),
        )
        session = cursor.fetchone()

        if not session:
            messagebox.showwarning(
                "Not Clocked In", f"{emp} is not currently clocked in!"
            )
        else:
            clock_in_dt = datetime.datetime.strptime(
                session[0], "%Y-%m-%d %H:%M:%S"
            )
            clock_out_dt = datetime.datetime.now()

            # Calculate total time
            duration = clock_out_dt - clock_in_dt
            hours_worked = duration.total_seconds() / 3600.0
            earned = hours_worked * EMPLOYEES[emp]["hourly"]

            clock_in_str = clock_in_dt.strftime("%Y-%m-%d %H:%M:%S")
            clock_out_str = clock_out_dt.strftime("%Y-%m-%d %H:%M:%S")

            # Save to permanent logs
            cursor.execute(
                """
                INSERT INTO time_logs (employee, clock_in, clock_out, hours_worked, tasks_completed, earned_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    emp,
                    clock_in_str,
                    clock_out_str,
                    hours_worked,
                    tasks,
                    earned,
                ),
            )

            # Remove active session
            cursor.execute(
                "DELETE FROM active_sessions WHERE employee = ?", (emp,)
            )
            conn.commit()

            # Send remote report
            send_email_report(
                emp,
                clock_in_str,
                clock_out_str,
                hours_worked,
                tasks,
                earned,
            )

            messagebox.showinfo(
                "Clocked Out",
                f"{emp} clocked out.\nLogged: {hours_worked:.2f} hrs\nEarned: R{earned:.2f}",
            )
            self.task_text.delete("1.0", tk.END)
            self.status_label.config(
                text="Status: Ready", foreground="gray"
            )

        conn.close()


if __name__ == "__main__":
    root = tk.Tk()
    app = WorkshopTrackerApp(root)
    root.mainloop()