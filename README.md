# **Momentum: Gamified Habit Tracker & Accountability Platform**

## **1. Project Title**

**Momentum – A Gamified Habit Tracker and Accountability Platform**

---

## **2. Problem Statement**

Maintaining daily motivation and tracking long-term personal habits often leads to user fatigue and inconsistency. Traditional habit trackers fail to engage users over time.

**Momentum solves this problem** by transforming habit tracking into a **gamified, visually engaging experience**.
It provides:

* Simple, fast logging
* Visual progress graphs
* Streaks and milestone rewards
* Optional social accountability

All designed to increase long-term consistency.

---

## **3. System Architecture**

Momentum uses a modern and scalable architecture focused on secure data handling and real-time updates.

### **Architecture Flow**

**Frontend (React.js)** → **REST API (Node.js/Express)** → **Database (MySQL)**

### **Component Descriptions**

| Component       | Description                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**    | React.js SPA with TailwindCSS for UI. Includes interactive charts and a motivational dashboard.        |
| **Backend API** | Stateless Node.js/Express API handling authentication, CRUD operations, and streak/score calculations. |
| **Database**    | MySQL stores relational data: users, habits, and daily logs.                                           |

---

## **4. Key Features**

### **Authentication & Authorization**

* JWT-based login, signup, and logout
* Users can access only their own habits and logs

### **CRUD Operations**

* Create, read, update, delete habits
* Log daily completion (create/delete logs)

### **Filtering, Searching, Sorting**

* Filter by Active/Archived
* Sort by creation date or streak length
* Search past habits

### **Pagination**

* Efficient loading for long history lists

### **Frontend Routing**

Pages include:
`/`, `/login`, `/dashboard`, `/habits/create`, `/habit/:id`, `/history`

### **Core Feature 1 — Streaks & Scores**

* Calculate current and longest streaks
* Award points & virtual badges (e.g., 30-day streak)

### **Core Feature 2 — Visual Progress**

* Interactive charts showing monthly completion stats
* Visual streak timelines

---

## **5. Tech Stack**

| Layer              | Technologies                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Frontend**       | React.js, React Router, Axios, TailwindCSS                                                 |
| **Backend**        | Node.js, Express.js                                                                        |
| **Database**       | MySQL                                                                                      |
| **Authentication** | JSON Web Tokens (JWT)                                                                      |
| **Hosting**        | Frontend → Netlify/Vercel<br>Backend → Render/Railway<br>Database → MySQL Hosting Provider |

---

## **6. API Overview (Sample Endpoints)**

| Endpoint              | Method | Description                              | Access        |
| --------------------- | ------ | ---------------------------------------- | ------------- |
| `/api/auth/login`     | POST   | Authenticate user and return JWT         | Public        |
| `/api/habits`         | GET    | Get user's habits (supports sort/filter) | Authenticated |
| `/api/habits`         | POST   | Create new habit                         | Authenticated |
| `/api/habits/:id/log` | POST   | Mark completion for today                | Authenticated |
| `/api/user/score`     | GET    | Retrieve score, streaks, and badges      | Authenticated |

---

