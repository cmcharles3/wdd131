import smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = "workshop_pc@gmail.com"  # Replace with sender address
SENDER_PASSWORD = "abcdefghijklmnop"     # Replace with your 16-letter App Password (no spaces)
MANAGER_EMAIL = "your_email@gmail.com"   # Replace with recipient address

msg = MIMEText("If you are reading this, your Gmail App Password works perfectly!")
msg["Subject"] = "Gmail App Password Test Success"
msg["From"], msg["To"] = SENDER_EMAIL, MANAGER_EMAIL

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.sendmail(SENDER_EMAIL, MANAGER_EMAIL, msg.as_string())

print("Test email sent successfully!")