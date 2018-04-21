# Mailer Service

Generic service to send email. Encapsulates various implementations, currently :

- **SMTP** server connection
- **SendMail** call to sendmail on the command line
- **SendGrid** Call to Sendgrid API

## Queue

TODO: a queue mechanism to avoid spamming mail server should be implemented to batch emails.

## GRPC and REST Services

A grpc service is used internally by other services to send email, e.g. by the Activity Service when sending user alerts or user digests, or the Scheduler service to send jobs results to Administrator, etc.

A REST service is exposed to the frontend to allow direct communication between users.