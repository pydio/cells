# Import smtplib for the actual sending function
import smtplib, ssl

# Import the email modules we'll need
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

me = "gregory@pydio.com"
me_pwd = "Alanci3nn5"
you = "charles@pydio.com"
textfile = "email_auto.msg"

# Open the plain text file whose name is in textfile for reading.
with open(textfile) as fp:
    # Create a text/plain message
    msg = MIMEMultipart("alternative")

    # me == the sender's email address
    # you == the recipient's email address
    msg['Subject'] = f'The contents of {textfile}'
    msg['From'] = me
    msg['To'] = you

    html = MIMEText(fp.read(), "html")

    msg.attach(html)

    # Create secure connection with server and send email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(me, me_pwd)
        server.sendmail(
            me, you, msg.as_string()
        )
