# 🎓 Learnify – Online Learning Platform

**Learnify** is a comprehensive, full-stack **online learning management system (LMS)** built with modern web technologies.
It enables **instructors** to create and manage courses, **students** to explore and enroll in expert-led content, and **administrators** to oversee platform operations.

---

## 🚀 Features

### 👩‍🎓 For Students

* **Browse & Explore** – Discover courses across multiple categories
* **Secure Enrollment** – Seamless checkout with Stripe integration
* **Video Learning** – High-quality video streaming with adaptive playback
* **Reviews & Ratings** – Read and submit course reviews
* **Cart Management** – Add courses to cart and checkout securely
* **Personal Dashboard** – View enrolled courses and personal details
---

### 👨‍🏫 For Instructors

* **Course Management** – Create, edit, and publish courses
* **Lecture Management** – Upload and organize video lectures
* **Analytics Dashboard** – Track enrollments, revenue, and ratings

---

### 🛠️ For Administrators

* **User Management** – Manage users, roles, and permissions
* **Platform Analytics** – View system-wide usage and revenue metrics
* **Course Moderation** – Oversee all published courses
* **System Controls** – Manage platform configurations

---

## 🏗️ Tech Stack

### Frontend

* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Data Fetching:** TanStack React Query
* **Routing:** React Router v6
* **Animations:** Framer Motion
* **Video Player:** Video.js
* **UI Icons:** Lucide React
* **Notifications:** React Hot Toast

---

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT + HTTP-only Cookies
* **File Storage:** ImageKit
* **Payments:** Stripe
* **Email Service:** Nodemailer / SendGrid
* **Security:** Rate limiting, role-based access control (RBAC)

---

### DevOps & Deployment

* **Containerization:** Docker
* **Container Orchestration:** Docker Compose
* **Cloud Hosting:** AWS EC2
* **Database:** MongoDB Atlas
* **Environment Management:** `.env` configuration
---

## 📋 Prerequisites

* Node.js 14+
* MongoDB Atlas (or local MongoDB)
* Stripe account
* ImageKit account
* Email service credentials (SendGrid / SMTP)

---

## 🚀 Getting Started

### Installation

1. Clone the repository
2. Setup Backend
3. Setup Frontend

Frontend runs at:

```
http://localhost:5173
```

---

## 📚 API Documentation

### 🔐 Authentication

* `POST /api/auth/register` – Register user
* `POST /api/auth/login` – Login
* `POST /api/auth/logout` – Logout
* `POST /api/auth/refresh` – Refresh token
* `POST /api/auth/forgot-password` – Send reset email
* `POST /api/auth/reset-password` – Reset password

---

### 📘 Courses

* `GET /api/courses` – Get all courses (pagination)
* `GET /api/courses/:id` – Course details
* `POST /api/courses` – Create course (Instructor/Admin)
* `PUT /api/courses/:id` – Update course
* `DELETE /api/courses/:id` – Delete course
* `GET /api/courses/:id/lectures` – Course lectures

---

### 🎥 Lectures

* `POST /api/lectures` – Create lecture
* `PUT /api/lectures/:id` – Update lecture
* `DELETE /api/lectures/:id` – Delete lecture

---

### 🛒 Cart & Payments

* `GET /api/cart` – Get cart
* `POST /api/cart/add` – Add course to cart
* `DELETE /api/cart/remove/:courseId` – Remove from cart
* `POST /api/payment/checkout` – Create Stripe checkout session
* `POST /api/payment/webhook` – Handle Stripe webhooks

---

### 👤 Users

* `GET /api/users/profile` – Get profile
* `PUT /api/users/profile` – Update profile
* `GET /api/users/enrollments` – Get enrolled courses

---

### ⭐ Reviews

* `POST /api/reviews` – Add review
* `GET /api/reviews/course/:courseId` – Get reviews
* `DELETE /api/reviews/:reviewId` – Delete review

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Role-based access control (RBAC)

### User Roles

* **Student** – Enroll, learn, review
* **Instructor** – Create courses, view analytics
* **Admin** – Full platform access

Route protection is enforced via **Express middleware** and **React route guards**.

---

## 💳 Payment Integration

* Stripe Checkout
* Secure payment flow
* Webhook-based payment confirmation
* Automatic enrollment after successful payment
* Refund-ready design

---

## 📧 Email System

Automated emails for:

* User registration (welcome emails)
* Password reset
* Enrollment confirmation

### ⚠️ Known Issue

> **Nodemailer SMTP requests are blocked on Render free instances**, causing **connection timeout errors**.
> This is a hosting-level restriction.
> **Solution:** Use a third-party email service (SendGrid, Mailgun, Resend) or a paid Render plan with outbound SMTP enabled.

---

## 🎥 Video Management

* ImageKit-powered video hosting
* Adaptive bitrate streaming
* CDN distribution
* Automatic thumbnail generation

---

## 📊 Analytics & Reporting

### Student

* Courses enrolled
* Learning activity

### Instructor

* Enrollments per course
* Revenue tracking
* Engagement metrics

### Admin

* Platform-wide analytics
* Revenue reports
* System health insights

---

## 🧪 Testing

* API testing with Postman
* Manual integration testing for payments & auth

---

## 🌐 Deployment

### Frontend

* Netlify / Render (SPA routing enabled)

### Backend

* Render / Railway / AWS

---

## 🐛 Troubleshooting

Common issues:

* MongoDB connection errors
* ImageKit upload failures
* SMTP timeout on Render (see Email System section)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and open a PR

---

## 📄 License

MIT License

---

## 👥 Authors

* **Abhishek Bhatia** – Founder
* **Akshit Mittal** – Founder
* **Amjad Mishal** – Founder
* **Aditya** – Founder

---

## ❤️ Acknowledgments

Inspired by modern e-learning platforms
Built with ❤️ for the learning community
