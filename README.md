#  SmartSeason Field Monitoring System

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/bkorir-git/smartseason.git
cd smartseason
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MYSQLHOST=localhost
MYSQLUSER=root
MYSQLPASSWORD=your_mysql_password
MYSQLDATABASE=smartseason
MYSQLPORT=3306
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Create Database

```sql
CREATE DATABASE smartseason;
```

### 4. Seed Database

```bash
npm run seed
```

### 5. Start Backend

```bash
npm start
```

Backend: [http://localhost:5000](http://localhost:5000)

### 6. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start Frontend

```bash
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)

---

## Design Decisions

* **Backend-driven business logic**: field status computed on server for consistency
* **Role-based access control**: Admin vs Field Agent separation
* **Relational database (MySQL)**: supports field–user–update relationships
* **JWT authentication**: stateless and scalable auth system
* **Modular backend structure**: routes, controllers, services, middleware separation
* **React + Vite frontend**: fast development and clean UI structure

---

## Assumptions Made

* Each field is assigned to one agent only
* Agents can only update assigned fields
* A field is marked **At Risk** after 7 days without updates
* Latest update determines field stage
* Admin has full system visibility
* Seed data is for testing/demo purposes only

---

## Deployment

* Frontend: https://smartseason-7wms.onrender.com 
* Backend API: https://smartseason-production-1749.up.railway.app/ 
* Database: Railway MySQL

### Notes
* Frontend is deployed on Render  
* Backend is deployed on Railway  
* Database is hosted on Railway MySQL with environment variables
