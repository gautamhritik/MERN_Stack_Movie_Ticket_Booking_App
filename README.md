# 🎬 MERN Stack Movie Ticket Booking App

A full-stack movie ticket booking web application built using the MERN stack. This platform allows users to browse movies, view show timings, and book tickets seamlessly, while admins can manage shows and bookings.

---

## 🚀 Live Demo

🔗 **Frontend:** https://quickshow-client-jade.vercel.app
🔗 **Backend API:** https://quickshow-server-neon-omega.vercel.app

---

## 📌 Features

### 👤 User Side

* Browse the latest movies
* View show timings
* Book movie tickets
* Authentication using Clerk
* Email notifications for bookings

### 🛠️ Admin Panel

* Add / Remove shows
* View all bookings
* Dashboard analytics

---

## 🧱 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other Integrations

* Clerk Authentication
* Inngest (Background Jobs & Scheduling)
* TMDB API (Movie Data)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2️⃣ Setup Backend

```
cd server
npm install
```

Create a `.env` file inside `server/` and add:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret
TMDB_API_KEY=your_tmdb_api_key
INNGEST_EVENT_KEY=your_inngest_key
```

Run backend:

```
npm run server
```

---

### 3️⃣ Setup Frontend

```
cd client
npm install
```

Create a `.env` file inside `client/`:

```
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Run frontend:

```
npm run dev
```

---

## 🔄 API Endpoints (Sample)

| Method | Endpoint                | Description    |
| ------ | ----------------------- | -------------- |
| GET    | /api/shows              | Get all shows  |
| POST   | /api/bookings           | Create booking |
| GET    | /api/admin/all-bookings | Admin bookings |
| POST   | /api/shows/add          | Add new show   |

---

## ⏱️ Background Jobs

* Automated show reminders using Inngest
* Cron jobs for periodic notifications

---

## 🧪 Environment Variables Summary

### Backend

* `MONGODB_URI`
* `CLERK_SECRET_KEY`
* `TMDB_API_KEY`
* `INNGEST_EVENT_KEY`

### Frontend

* `VITE_BACKEND_URL`
* `VITE_CLERK_PUBLISHABLE_KEY`

---

## 📦 Deployment

* **Frontend:** Vercel / Netlify
* **Backend:** Render / Railway / VPS
* **Database:** MongoDB Atlas

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you want to change.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Hritik Gautam**

---

## ⭐ Acknowledgements

* TMDB for movie data
* Clerk for authentication
* Inngest for background jobs

---

## ⚠️ Notes

* Ensure proper API keys are configured before running
* Use production-ready environment variables for deployment
* Backend must be running before frontend

---
