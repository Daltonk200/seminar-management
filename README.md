Seminar Management System

A seminar/course management app with trainer assignment and email notifications. Built with Next.js, MongoDB (Atlas), and Docker.


---

🚀 Live Demo

App: d209gfcj-3000.uks1.devtunnels.ms

Mailhog (view emails): d209gfcj-8025.uks1.devtunnels.ms


> Note: These links are only available while the developer’s PC is online. If unavailable, follow the local setup instructions below.




---

🛠️ Running Locally

1. Clone or Download the Project

Click the Code button and choose Download ZIP, or clone via Git:

git clone https://github.com/Daltonk200/seminar-management.git


2. Install Docker Desktop

Download and install Docker from https://www.docker.com/products/docker-desktop/

Start Docker.


3. Start the App

Open a terminal and navigate to the project directory.

Run:

docker-compose up

Setup may take a few minutes on the first run.


4. Access the App

App: http://localhost:3000

Mailhog (email viewer): http://localhost:8025


Login Credentials

Username: admin

Password: password123



---

📦 Features

Manage seminars and trainers.

Assign/remove trainers to/from courses.

Automatic email notifications on assignment changes (via Mailhog).



---

🧰 Tech Stack

Frontend: Next.js (React)

Backend: API Routes (Next.js)

Database: MongoDB Atlas (cloud-hosted)

Email Testing: Mailhog

Containerization: Docker & Docker Compose



---

📝 Notes

Emails are for testing only and do not send externally.

Data persistence depends on MongoDB Atlas; Docker is used for container orchestration only.

---

❓ Need Help?

For issues or questions, reach out via email mbengbright3@gmail.com.






