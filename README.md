# 🚪 DOORSTEP

**DOORSTEP** is a modern, multi-role oncampus delivery platform built with **TypeScript**, **Vite**, **Firebase**, and **Tailwind CSS**. Designed for campus ecosystems or localized communities, it enables seamless interactions between **Students**, **Shopkeepers**, **Admins**, and **Delivery Personnel** — all within a responsive and scalable web app.

---

## 🚀 Tech Stack

- ⚡ **Vite** – Fast build tool for lightning-fast development
- 🛠 **TypeScript** – Strongly-typed JavaScript for robust coding
- 🔥 **Firebase** – Authentication and real-time backend
- 🎨 **Tailwind CSS** – Utility-first CSS framework for beautiful UIs
- 💳 **Razorpay** – Integrated payment gateway for secure transactions

---

## 🧱 Architecture Overview

### 🔐 User Roles & Authentication

- Roles: **Student**, **Shopkeeper**, **Admin**, **Delivery Personnel**
- Protected routes per user type: `StudentRoute.tsx`, `ShopkeeperRoute.tsx`, `AdminRoute.tsx`
- Auth powered by Firebase (`AuthContext.tsx`)

---

## 🛒 Core Features

### 🛍️ E-commerce System

- **Product Management**: Add, view, and edit products (`ProductCard.tsx`, `products.ts`)
- **Shopping Cart**: Add to cart and manage orders (`CartContext.tsx`, `Cart.tsx`)
- **Checkout Process**: Complete with payment integration (`Checkout.tsx`, `RazorpayPayment.tsx`)
- **Order Tracking**: Real-time delivery updates (`Tracking.tsx`)

---

## 🏪 Multi-Vendor Marketplace

Shopkeepers can:
- Create and manage their shops (`/pages/shop/`)
- Add/edit products & categories
- Track orders from a personalized dashboard
- Manage shop inventory

---

## 🛠️ Admin Dashboard

Admins can manage:
- ✅ Vendors
- 🗂️ Product categories
- 🧑‍🎓 Student accounts
- 🛵 Delivery personnel
- 📊 Platform-wide analytics and settings (`/pages/admin/`)

---

## 🔧 Services Layer

Encapsulated business logic and API calls located in the `/services/` directory:

- 🛒 Cart Service
- 🚚 Delivery Service
- 📦 Order Service
- 💰 Payment Service
- 🛍️ Product Service
- 🏬 Shop Service

---

## 💡 UI/UX Design

- Responsive layouts (`Layout.tsx`)
- Modern components built in React + TypeScript
- Navigation (`Navbar.tsx`) and search (`SearchBar.tsx`)
- Error boundaries and loading states (`Spinner.tsx`, `ErrorBoundary.tsx`)

---

## 👥 Features by User Type

### 👨‍🎓 Students

- Browse and search products
- Add to and manage cart
- Complete checkout
- Track orders in real-time
- Update and manage personal profile

### 🧑‍💼 Shopkeepers

- Manage own store dashboard
- Add, update, and categorize products
- View order history
- Customize profile

### 🧑‍💻 Admins

- Full platform control
- Manage all vendors and categories
- Oversee student accounts
- Assign and manage delivery personnel

### 🚴 Delivery Personnel

- View assigned deliveries
- Update delivery status
- Manage personal profile

---

## 🛠️ Getting Started

### ✅ Prerequisites

- Node.js (v18 or higher)
- Firebase project with authentication & Firestore enabled
- Razorpay account for test/live payments

### 🔧 Installation

```bash
git clone https://github.com/your-username/doorstep.git
cd doorstep
npm install
