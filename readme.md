# 🚀 StudyNook Server

StudyNook Server is the backend API for the StudyNook Study Room Booking Platform. It handles authentication, authorization, room management, booking operations, and secure communication between the client and database.

## 🌐 Server Live URL

🔗 https://your-server-url.com

---

# 📌 Features

## 🔐 Authentication & Authorization

* JWT-based Authentication
* Better Auth Integration
* Protected Routes
* Token Verification Middleware
* Secure User Session Management

## 🏢 Room Management

* Create New Study Rooms
* Retrieve All Rooms
* Retrieve Single Room Details
* Update Existing Rooms
* Delete Rooms
* Ownership Verification

## 📅 Booking Management

* Book Study Rooms
* Booking Conflict Detection
* Cancel Bookings
* Booking Status Tracking
* Booking Count Management

## 🔍 Search & Filtering

* Search Rooms by Name
* Filter by Amenities
* Filter by Price Range
* Retrieve Latest Rooms

## 🛡️ Security

* JWT Verification Middleware
* Protected API Endpoints
* CORS Configuration
* Environment Variable Protection

---

# 🛠️ Technologies Used

## Backend Framework

* Node.js
* Express.js

## Authentication

* Better Auth
* JSON Web Token (JWT)

## Database

* MongoDB Atlas

## Middleware

* CORS
* Express JSON Parser
* JWT Middleware

---

# 📦 NPM Packages

Install the required packages:

```bash
npm install express
npm install mongodb
npm install cors
npm install dotenv
npm install jsonwebtoken
npm install better-auth
```

Or install everything together:

```bash
npm install express mongodb cors dotenv jsonwebtoken better-auth
```

---

# 📂 Project Structure

```txt
studynook-server
│
├── index.js
├── .env
├── package.json
│
├── middleware
│   └── verifyToken.js
│
├── routes
│   ├── rooms.js
│   ├── bookings.js
│   └── auth.js
│
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DB_USER=your_database_user
DB_PASS=your_database_password

JWT_SECRET=your_secret_key

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/studynook-server.git
```

## Move Into Project Folder

```bash
cd studynook-server
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
nodemon index.js
```

or

```bash
node index.js
```

---

# 🔑 API Endpoints

## Authentication

### Generate JWT

```http
POST /jwt
```

### Verify User Session

```http
GET /api/auth/session
```

---

## Rooms

### Get All Rooms

```http
GET /rooms
```

### Get Latest Featured Rooms

```http
GET /featured-rooms
```

### Get Single Room

```http
GET /rooms/:id
```

### Add New Room

```http
POST /rooms
```

### Update Room

```http
PUT /rooms/:id
```

### Delete Room

```http
DELETE /rooms/:id
```

---

## Bookings

### Create Booking

```http
POST /bookings
```

### Get User Bookings

```http
GET /my-bookings/:userId
```

### Cancel Booking

```http
PATCH /bookings/:id/cancel
```

---

# 📊 Database Collections

## Rooms Collection

```js
{
  roomName: String,
  description: String,
  image: String,
  floor: Number,
  capacity: Number,
  hourlyRate: Number,
  amenities: Array,
  ownerId: String,
  ownerName: String,
  ownerEmail: String,
  bookingCount: Number,
  createdAt: Date
}
```

---

## Bookings Collection

```js
{
  roomId: String,
  roomName: String,
  userId: String,
  userName: String,
  userEmail: String,
  date: String,
  startTime: String,
  endTime: String,
  totalCost: Number,
  specialNote: String,
  status: "confirmed" | "cancelled",
  createdAt: Date
}
```

---

# 🛡️ Security Features

* JWT Protected Routes
* Better Auth Authentication
* Ownership Verification
* Booking Conflict Prevention
* Environment Variable Protection
* CORS Protection

---

# 🔮 Future Improvements

* Role-Based Access Control
* Admin Dashboard APIs
* Google Authentication
* Payment Integration
* Email Notifications
* Booking Analytics

---

# 👨‍💻 Developer

**Shohel Rana Shihab**

Department of Computer Science & Engineering

Green University of Bangladesh

---

# ⭐ Support

If you like this project, please consider giving it a ⭐ on GitHub.
