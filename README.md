# Seminar Management System

A simple seminar/course management app with trainer assignment and email notifications. Built with Next.js, MongoDB, and Docker. 

---

## 🚀 Live Demo (No Setup Needed)

- **App:** [d209gfcj-3000.uks1.devtunnels.ms](https://d209gfcj-3000.uks1.devtunnels.ms)
- **Mailhog (view emails):** [d209gfcj-8025.uks1.devtunnels.ms](https://d209gfcj-8025.uks1.devtunnels.ms)

> **Note:** These links are only available while the developer's PC is online. If you can't access them, follow the steps below to run the app locally.

---

## 🛠️ How to Run Locally (No Coding Skills Needed)

### 1. **Get the Project**
- Click the green **Code** button on this page and choose **Download ZIP** (or use Git if you know how).
- Unzip the folder to your computer.

### 2. **Install Docker Desktop**
- Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- Start Docker Desktop.

### 3. **Start the App**
- Open a terminal (or Command Prompt on Windows).
- Go into the project folder (the one with `docker-compose.yml`).
- Run this command:
  ```bash
  docker-compose up
  ```
- Wait for the setup to finish (it may take a few minutes the first time).

### 4. **Open the App in Your Browser**
- Go to [http://localhost:3000](http://localhost:3000) to use the Seminar Management app.
- Go to [http://localhost:8025](http://localhost:8025) to view emails sent by the app (Mailhog).

---

## 📦 What Does This App Do?
- Manage courses and trainers.
- Assign or remove trainers from courses.
- Trainers get email notifications when assigned or removed (emails are viewable in Mailhog, not sent to real inboxes).

---

## 📝 Notes
- **No coding required** to run or use the app.
- **Data is stored locally** in Docker. If you delete the Docker containers/volumes, your data will be lost.
- **Mailhog** is for testing emails only. No real emails are sent.
- If you want to use the app from another computer, replace `localhost` in the URLs with your computer's IP address.

---

## ❓ Need Help?
- If you get stuck, contact the developer or check the [official Docker documentation](https://docs.docker.com/get-docker/).

---

Enjoy managing your seminars and trainers!
