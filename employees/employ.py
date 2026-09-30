from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json

class DayType(Enum):
    WEEKDAY = "weekday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"

@dataclass
class TradingHours:
    """Trading hours configuration"""
    weekday_open: str = "08:00"
    weekday_close: str = "17:00"
    saturday_open: str = "08:00"
    saturday_close: str = "14:00"
    
    def get_trading_hours(self, date: datetime) -> Tuple[str, str]:
        """Get trading hours for a specific date"""
        if date.weekday() == 5:  # Saturday
            return self.saturday_open, self.saturday_close
        elif date.weekday() == 6:  # Sunday
            return None, None  # Closed on Sunday
        else:
            return self.weekday_open, self.weekday_close

@dataclass
class Employee:
    """Employee data structure"""
    name: str
    role: str
    base_salary: float  # Monthly salary
    commission_rate: float = 0.05  # 5% commission
    commission_threshold: float = 3000  # Extra amount needed beyond salary
    
    def __post_init__(self):
        self.attendance_records: List[AttendanceRecord] = []
        self.printer_sales: List[PrinterSale] = []
    
    @property
    def hourly_rate(self) -> float:
        """Calculate hourly rate based on 160 working hours per month"""
        return round(self.base_salary / 160, 2)
    
    @property
    def daily_rate(self) -> float:
        """Calculate daily rate based on 20 working days per month"""
        return round(self.base_salary / 20, 2)
    
    def get_commission_threshold(self) -> float:
        """Get the total amount needed before commission kicks in"""
        return self.base_salary + self.commission_threshold

@dataclass
class AttendanceRecord:
    """Attendance record for a single day"""
    date: datetime
    clock_in: Optional[datetime]
    clock_out: Optional[datetime]
    is_holiday: bool = False
    
    @property
    def hours_worked(self) -> float:
        """Calculate hours worked"""
        if self.clock_in and self.clock_out:
            duration = self.clock_out - self.clock_in
            # Subtract 1 hour for lunch if working more than 6 hours
            hours = duration.total_seconds() / 3600
            if hours > 6:
                hours -= 1  # Lunch break
            return round(hours, 2)
        return 0.0
    
    @property
    def overtime_hours(self) -> float:
        """Calculate overtime hours"""
        hours = self.hours_worked
        if self.date.weekday() == 5:  # Saturday
            return max(0, hours - 6)  # Saturday trading: 8am-2pm (6 hours)
        elif self.date.weekday() == 6:  # Sunday
            return hours if hours > 0 else 0
        else:  # Weekday
            return max(0, hours - 8)  # Weekday trading: 8am-5pm (8 hours)

@dataclass
class PrinterSale:
    """Printer sale record"""
    date: datetime
    printer_type: str
    sale_amount: float
    quantity: int = 1
    
    @property
    def total_amount(self) -> float:
        return self.sale_amount * self.quantity

class CommissionSystem:
    """Main system for managing employees, attendance, and commissions"""
    
    def __init__(self):
        self.employees: Dict[str, Employee] = {}
        self.trading_hours = TradingHours()
        
    def add_employee(self, name: str, role: str, base_salary: float) -> None:
        """Add a new employee to the system"""
        employee = Employee(name, role, base_salary)
        self.employees[name] = employee
        print(f"✅ Added {name} ({role}) with base salary R{base_salary:.2f}")
        
    def clock_in(self, employee_name: str) -> None:
        """Clock in an employee"""
        if employee_name not in self.employees:
            print(f"❌ Employee {employee_name} not found")
            return
            
        now = datetime.now()
        employee = self.employees[employee_name]
        
        # Check if already clocked in today
        today_records = [r for r in employee.attendance_records 
                        if r.date.date() == now.date()]
        if today_records and today_records[-1].clock_in and not today_records[-1].clock_out:
            print(f"⚠️ {employee_name} is already clocked in")
            return
            
        # Check trading hours
        open_time, close_time = self.trading_hours.get_trading_hours(now)
        if not open_time and not close_time:
            print(f"❌ Today is Sunday - no trading allowed")
            return
            
        # Create attendance record
        record = AttendanceRecord(
            date=now,
            clock_in=now,
            clock_out=None,
            is_holiday=False
        )
        employee.attendance_records.append(record)
        print(f"✅ {employee_name} clocked in at {now.strftime('%H:%M')}")
        
    def clock_out(self, employee_name: str) -> None:
        """Clock out an employee"""
        if employee_name not in self.employees:
            print(f"❌ Employee {employee_name} not found")
            return
            
        now = datetime.now()
        employee = self.employees[employee_name]
        
        # Find today's attendance record without clock-out
        today_records = [r for r in employee.attendance_records 
                        if r.date.date() == now.date()]
        
        if not today_records:
            print(f"❌ No clock-in record found for {employee_name} today")
            return
            
        latest_record = today_records[-1]
        if latest_record.clock_out:
            print(f"⚠️ {employee_name} already clocked out today")
            return
            
        # Check if before trading hours end
        open_time, close_time = self.trading_hours.get_trading_hours(now)
        if close_time:
            close_hour, close_min = map(int, close_time.split(':'))
            close_dt = now.replace(hour=close_hour, minute=close_min, second=0)
            if now > close_dt:
                print(f"⚠️ Warning: Clocking out after trading hours")
        
        latest_record.clock_out = now
        hours_worked = latest_record.hours_worked
        print(f"✅ {employee_name} clocked out at {now.strftime('%H:%M')}")
        print(f"   Hours worked today: {hours_worked:.2f}")
        
    def record_printer_sale(self, employee_name: str, printer_type: str, 
                           sale_amount: float, quantity: int = 1) -> None:
        """Record a printer sale for an employee"""
        if employee_name not in self.employees:
            print(f"❌ Employee {employee_name} not found")
            return
            
        sale = PrinterSale(
            date=datetime.now(),
            printer_type=printer_type,
            sale_amount=sale_amount,
            quantity=quantity
        )
        self.employees[employee_name].printer_sales.append(sale)
        print(f"✅ Recorded sale: {employee_name} sold {quantity} x {printer_type} (R{sale_amount:.2f} each)")
        
    def calculate_monthly_salary(self, employee_name: str) -> Dict:
        """Calculate full monthly salary including commissions and overtime"""
        if employee_name not in self.employees:
            return {"error": "Employee not found"}
            
        employee = self.employees[employee_name]
        
        # Calculate attendance hours
        total_hours = 0
        total_overtime = 0
        for record in employee.attendance_records:
            total_hours += record.hours_worked
            total_overtime += record.overtime_hours
            
        # Calculate total printer sales
        total_sales = sum(sale.total_amount for sale in employee.printer_sales)
        
        # Calculate commission
        threshold = employee.get_commission_threshold()
        commission = 0
        if total_sales > threshold:
            commissionable_amount = total_sales - threshold
            commission = commissionable_amount * employee.commission_rate
        
        # Calculate overtime pay (1.5x hourly rate)
        overtime_pay = total_overtime * employee.hourly_rate * 1.5
        
        # Calculate final salary
        final_salary = employee.base_salary + commission + overtime_pay
        
        return {
            "employee": employee_name,
            "role": employee.role,
            "base_salary": employee.base_salary,
            "hourly_rate": employee.hourly_rate,
            "daily_rate": employee.daily_rate,
            "total_hours_worked": total_hours,
            "total_overtime_hours": total_overtime,
            "overtime_pay": overtime_pay,
            "total_printer_sales": total_sales,
            "commission_threshold": threshold,
            "commissionable_amount": max(0, total_sales - threshold),
            "commission_earned": commission,
            "final_salary": final_salary,
            "attendance_days": len(employee.attendance_records)
        }
        
    def generate_payslip(self, employee_name: str) -> None:
        """Generate a detailed payslip for an employee"""
        result = self.calculate_monthly_salary(employee_name)
        if "error" in result:
            print(f"❌ {result['error']}")
            return
            
        print("\n" + "="*60)
        print(f"📄 PAYSLIP - {result['employee']} ({result['role']})")
        print("="*60)
        print(f"📍 Base Salary:                R{result['base_salary']:>10,.2f}")
        print(f"📍 Hourly Rate:                R{result['hourly_rate']:>10,.2f}")
        print(f"📍 Daily Rate:                 R{result['daily_rate']:>10,.2f}")
        print("-"*60)
        print(f"⏰ Attendance:")
        print(f"   Days worked:                {result['attendance_days']:>10}")
        print(f"   Total hours:                {result['total_hours_worked']:>10,.2f}")
        print(f"   Overtime hours:             {result['total_overtime_hours']:>10,.2f}")
        print(f"   Overtime pay (1.5x):        R{result['overtime_pay']:>10,.2f}")
        print("-"*60)
        print(f"🖨️  Printer Sales:")
        print(f"   Total sales value:          R{result['total_printer_sales']:>10,.2f}")
        print(f"   Commission threshold:        R{result['commission_threshold']:>10,.2f}")
        print(f"   Commissionable amount:       R{result['commissionable_amount']:>10,.2f}")
        print(f"   Commission (5%):            R{result['commission_earned']:>10,.2f}")
        print("-"*60)
        print(f"💰 FINAL SALARY:               R{result['final_salary']:>10,.2f}")
        print("="*60 + "\n")

def demo_system():
    """Demonstrate the system functionality"""
    system = CommissionSystem()
    
    # Add employees
    system.add_employee("Talent", "Talent", 6000)
    system.add_employee("Simba", "Talent", 4500)
    system.add_employee("Lean", "Admin", 3000)
    
    print("\n" + "="*60)
    print("DEMONSTRATION: Employee Commission & Attendance System")
    print("="*60)
    
    # Simulate attendance for a month (simplified)
    print("\n📋 SIMULATING ATTENDANCE...")
    
    # Manual clock in/out (in real system, this would happen throughout the day)
    # For demo, we'll simulate a few days
    
    # Simulate first day of month
    print("\n📅 Day 1 - Regular workday")
    system.clock_in("Talent")
    system.clock_out("Talent")
    
    system.clock_in("Simba")
    system.clock_out("Simba")
    
    system.clock_in("Lean")
    system.clock_out("Lean")
    
    # Simulate sales
    print("\n🖨️  RECORDING PRINTER SALES...")
    
    # Talent sells R20,000 worth of printers
    system.record_printer_sale("Talent", "LaserJet Pro", 15000, 1)
    system.record_printer_sale("Talent", "DeskJet Plus", 5000, 1)
    
    # Simba sells R10,000 worth of printers
    system.record_printer_sale("Simba", "LaserJet Pro", 10000, 1)
    
    # Lean sells R3,000 worth of printers
    system.record_printer_sale("Lean", "DeskJet", 3000, 1)
    
    # Simulate more attendance days (for demo)
    print("\n📅 Simulating more attendance days...")
    for _ in range(19):  # Simulate a full month
        # Simulate clock in/out with random times
        # In real system, this would be entered manually
        pass
    
    # Generate payslips
    print("\n" + "="*60)
    system.generate_payslip("Talent")
    system.generate_payslip("Simba")
    system.generate_payslip("Lean")
    
    # Show summary
    print("\n📊 MONTHLY SUMMARY")
    print("="*60)
    for name in system.employees:
        result = system.calculate_monthly_salary(name)
        print(f"{name:>10}: Base R{result['base_salary']:>7,.2f} + Commission R{result['commission_earned']:>7,.2f} + Overtime R{result['overtime_pay']:>7,.2f} = R{result['final_salary']:>8,.2f}")

if __name__ == "__main__":
    # Create system instance
    print("🏢 EMPLOYEE COMMISSION & ATTENDANCE SYSTEM")
    print("="*60)
    
    # Run demo
    demo_system()
    
    # Interactive mode
    print("\n" + "="*60)
    print("INTERACTIVE MODE")
    print("="*60)
    
    system = CommissionSystem()
    system.add_employee("Talent", "Talent", 6000)
    system.add_employee("Simba", "Talent", 4500)
    system.add_employee("Lean", "Admin", 3000)
    
    while True:
        print("\n📋 MENU:")
        print("1. Clock In")
        print("2. Clock Out")
        print("3. Record Printer Sale")
        print("4. Generate Payslip")
        print("5. Show Employee Summary")
        print("6. Exit")
        
        choice = input("\nSelect option: ")
        
        if choice == "1":
            name = input("Employee name: ")
            system.clock_in(name)
        elif choice == "2":
            name = input("Employee name: ")
            system.clock_out(name)
        elif choice == "3":
            name = input("Employee name: ")
            printer = input("Printer type: ")
            amount = float(input("Sale amount: "))
            qty = int(input("Quantity: ") or "1")
            system.record_printer_sale(name, printer, amount, qty)
        elif choice == "4":
            name = input("Employee name: ")
            system.generate_payslip(name)
        elif choice == "5":
            for name in system.employees:
                result = system.calculate_monthly_salary(name)
                print(f"{name}: Base R{result['base_salary']:.2f}, "
                     f"Commission R{result['commission_earned']:.2f}, "
                     f"Final R{result['final_salary']:.2f}")
        elif choice == "6":
            print("Goodbye!")
            break
        else:
            print("Invalid option")