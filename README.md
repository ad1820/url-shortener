# 🔗 URL Shortener

A full-stack URL shortener built with the MERN stack (MongoDB, Express, React, Node.js).

Live Demo: [https://url-shortener-frontend-jvrj.onrender.com/](https://url-shortener-frontend-jvrj.onrender.com/)

---

## 📦 Technologies

- **Frontend**: React + Vite
- **Backend**: Express.js + MongoDB
- **Database**: MongoDB Atlas
- **Libraries**: Axios, NanoID, Dotenv, cors
- **Deployment**: Render (Backend + Frontend)

---

## 🚀 Features

- Shortens long URLs into unique short links
- Redirects short links to the original URL
- Increments and tracks click counts
- Responsive and minimal frontend
- Environment-based configuration

---

## 🛠️ Setup Instructions

### Backend

1. Navigate to the backend folder:

   ```bash
   cd server
   npm install
   ```
2. Create a .env file in the server/ directory:

  ```bash
  PORT=8000
  MONGODB_URI=your_mongodb_connection_string
  NODE_ENV=development
  ```

3. Start the server:

  ```bash
  npm run dev
  ```
### Frontend

1. Navigate to the frontend folder:

  ```bash
  cd client
  npm install
  ```
2. Create a .env file in the client/ directory:
  ```bash
  VITE_BACKEND_URL=http://localhost:8000
  ```

3. Start the frontend:
  ```bash
    npm run dev
  ```

# ☁️ Deployment

## Backend (Render)

- Create a new Web Service

- Use server/ as root directory

- Set the following in Render dashboard:

- Build Command: npm install

- Start Command: npm start

- Environment Variables: PORT, MONGODB_URI, NODE_ENV

- Make sure your MongoDB Atlas has IP whitelisted (e.g. 0.0.0.0/0 for testing)

## Frontend (Render)

- Deploy from client/ directory

- Build Command: npm run build

- Output Directory: dist

- Add VITE_BACKEND_URL in environment variables:

- e.g. https://your-backend-service.onrender.com
