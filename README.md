# 🏠 Rental Bond Tracker

A web app for managing rental bonds, properties, inspections, and documents — built with React, Node.js, and PostgreSQL.

---

## 🔗 Live App

| | Link |
|--|------|
| 🌐 **Frontend** | https://rental-bond-tracker.vercel.app/login |
| ⚙️ **Backend** | https://backend-production-2a03.up.railway.app |
| 📦 **GitHub** | https://github.com/Mel-22-Green/rental-bond-tracker-final |

> ✅ The live app is fully deployed. Just click the frontend link above to use it.

---

## 👤 Demo Accounts (Live App)

| Role  | Email                   | Password      |
|-------|-------------------------|---------------|
| Admin | aayush@test.com    | 12345678     |
| User  | aayushgg@test.com   |  12345678  |



> ⚠️ MFA is disabled on these accounts for easy access. To enable MFA go to **Profile → Enable MFA Now** after logging in.

---Backup codes (if 2FA asks): 870107C2, 1COFAE53, 862E2246, CC09EB82, 5543BFB9, 08048C33, 19787335, 6D6DBE9C



## ✨ Features

- 🔐 Two-Factor Authentication (Google Authenticator / Authy)
- 🏘️ Property management with landlord and agent details
- 💰 Bond tracking with Paid / Pending / Refunded status
- 📋 Inspections with photo upload, rating, and notes
- 📄 Document upload and management
- 💬 Built-in chatbot assistant
- 👑 Full admin dashboard with audit logs and CSV export

---

## 💻 Run Locally

### Requirements

- [Node.js v18+](https://nodejs.org)
- [PostgreSQL v14+](https://www.postgresql.org/download/windows)
- [pgAdmin 4](https://www.pgadmin.org) (comes with PostgreSQL)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Mel-22-Green/rental-bond-tracker-final.git
cd rental-bond-tracker-final
```

---

### Step 2 — Set up the database

1. Open **pgAdmin 4**
2. Right-click **Databases → Create → Database**
3. Name it `rental_bond_tracker` → click **Save**
4. Click on the database → open **Query Tool**
5. Open `database_setup.sql` → press **F5**
6. You should see: `✅ Database setup complete!`

---

### Step 3 — Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_bond_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=any_long_random_string_here
PORT=5000
```

Create upload folders:

```bash
mkdir uploads
mkdir uploads\documents
mkdir uploads\inspections
```

Start the backend:

```bash
node server.js
```

You should see:
```
✅ Database connected successfully
Server running on http://localhost:5000
```

---

### Step 4 — Set up the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

App opens at **http://localhost:3000** ✅

---

### Step 5 — Log in locally

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | aayush@test.com      | 12345678  |
| User  | aayushgg@test.com  | 12345678  |

---

## 🛠 Tech Stack

| Layer    | Technology                     |
|----------|-------------------------------|
| Frontend | React 18, React Router, Axios  |
| Backend  | Node.js, Express.js            |
| Database | PostgreSQL                     |
| Auth     | JWT, Speakeasy (TOTP MFA)      |
| Uploads  | Multer                         |
| Hosting  | Vercel + Railway               |

---

## 👨‍💻 Built By

- Aayush Bhandari
- Sujan Lamichhane
- Linh Nguyen
- Dadhi ram poudel
- Asim Bhattarai
- Subham shrestha
