# 🎓 Learnify – Online Learning Platform

Learnify is a full-stack Learning Management System (LMS) that allows students to explore and enroll in courses, instructors to create and manage educational content, and administrators to control the platform efficiently.

Built using modern full-stack technologies with Docker-based deployment support.

---

## 🚀 Features

### 👩‍🎓 Student Features

- Browse and search courses
- Filter courses by category
- Add courses to cart
- Secure checkout with Stripe
- Enroll in courses
- Watch video lectures
- Submit ratings and reviews
- View enrolled courses
- Manage profile

---

### 👨‍🏫 Instructor Features

- Create and publish courses
- Upload thumbnails and videos
- Add and manage lectures
- Edit course details
- View enrollments
- Access analytics dashboard

---

### 🛠️ Admin Features

- Manage users
- Manage courses
- Role-based access control
- Platform moderation
- View analytics

---

## 🏗️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- TanStack React Query
- Framer Motion
- Video.js
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express.js
- MySQL
- Sequelize
- JWT Authentication
- HTTP-only Cookies
- Nodemailer
- Stripe
- ImageKit

### DevOps / Deployment

- Docker
- Docker Compose
- Nginx
- AWS EC2
- MySQL Server / Managed MySQL

---

## 📂 Project Structure

```bash
Learnify/
│
├── client/
│   ├── src/
│   ├── Dockerfile
│   └── .env
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
└── README.md
```

---

## 📋 Prerequisites

Make sure you have installed:

- Node.js
- Docker
- Docker Compose
- MySQL server or managed MySQL instance
- Stripe account
- ImageKit account
- SMTP credentials

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=learnify
DB_PORT=3306
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
CLIENT_URL=http://localhost:3000
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
```

---

## 🐳 Docker Setup

### docker-compose.yml

```yaml
services:
  backend:
    build: ./server
    container_name: server
    ports:
      - "5000:5000"
    env_file:
      - ./server/.env
    restart: always

  frontend:
    build: ./client
    container_name: client
    ports:
      - "3000:3000"
    env_file:
      - ./client/.env
    depends_on:
      - backend
    restart: always
```

---

## 🚀 Run with Docker

### Build and Start Containers

```bash
docker compose up --build
```

### Stop Containers

```bash
docker compose down
```

---

## 🌐 Application URLs

Frontend:

```bash
http://localhost:3000
```

Backend:

```bash
http://localhost:5000
```

---

## 🚀 Run Without Docker

### Clone Repository

```bash
git clone https://github.com/abhishekbhatia01/Learning-Management-System.git
cd learnify
```

### Start Backend

```bash
cd server
npm install
npm run dev
```

### Start Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📚 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Courses

```http
GET /api/course
GET /api/course/:id
POST /api/course
PUT /api/course/:id
DELETE /api/course/:id
```

### Lectures

```http
POST /api/lecture
PUT /api/lecture/:id
DELETE /api/lecture/:id
```

### Cart

```http
GET /api/cart
POST /api/cart/add
DELETE /api/cart/remove/:id
```

### Payments

```http
POST /api/payment/checkout
POST /api/payment/webhook
```

### Users

```http
GET /api/user/profile
PUT /api/user/profile
```

### Reviews

```http
POST /api/review
GET /api/review/:courseId
DELETE /api/review/:id
```

---

## 🔐 Authentication & Authorization

Security implementation includes:

- JWT Authentication
- Refresh Tokens
- HTTP-only Cookies
- Role-based access control

### Roles

- Student
- Instructor
- Admin

---

## 💳 Payment Integration

Stripe payment features:

- Secure checkout
- Payment verification
- Webhook support
- Automatic course enrollment

---

## 🎥 Media Management

ImageKit integration for:

- Course thumbnails
- Video hosting
- CDN delivery
- Media optimization

---

## 📧 Email Features

Automated emails for:

- Welcome messages
- Password reset
- Enrollment confirmation

Using:

- Nodemailer
- SMTP provider

---

## 🌐 Deployment Architecture

Production deployment setup:

```text
User
   ↓
Nginx Reverse Proxy
   ├── Frontend Container (React App)
   └── Backend Container (Node API)
            ↓
  MySQL Database
```

Deployable on:

- AWS EC2
- Render
- Railway
- Netlify (frontend only)

---

## 🐛 Common Issues

### CORS Error

Backend CORS config:

```js
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
```

---

### Docker Port Conflict

Stop existing containers:

```bash
docker compose down
```

Restart:

```bash
docker compose up --build
```

---

### ImageKit 400 Error

Store valid uploaded image URL:

```js
thumbnail: uploadResponse.url;
```

---

## 🧪 Testing

Testing methods:

- Postman API testing
- Manual UI testing
- Payment flow testing
- Authentication testing

---

## 🤝 Contributing

1. Fork repository
2. Create new branch
3. Commit changes
4. Push changes
5. Open Pull Request

---

## 👥 Authors

- Abhishek Bhatia
- Satyam Singhal

---

## 📄 License

MIT License

---

## ❤️ Acknowledgements

Built with ❤️ using modern full-stack and DevOps technologies.
Inspired by modern online learning platforms.
