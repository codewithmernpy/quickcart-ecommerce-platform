# QuickCart — E-Commerce Platform

A full-stack e-commerce application built with **React** + **Node.js/Express** + **MongoDB**.

## Features

- **User Authentication** — JWT-based auth with OTP email verification
- **3 User Roles** — Customer, Seller, Admin
- **Product Management** — CRUD with multi-image upload (Cloudinary)
- **Shopping Cart & Wishlist**
- **Order Management** — Full status workflow (pending → processing → shipped → delivered)
- **Return/Replacement System** — With seller approval flow
- **Seller Verification** — Admin-managed with PAN card verification
- **Notifications System**
- **Search & Filtering** — Price range, rating, category, sorting
- **Multi-Currency Support** — USD, EUR, GBP, INR, JPY
- **Dark Mode**
- **Responsive Design**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v7, TailwindCSS v3 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| Images | Cloudinary, Multer |
| Email | Nodemailer (Gmail) |
| Icons | Lucide React, Font Awesome |

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for image uploads)
- **Gmail** account (for OTP emails — requires app password)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quickcart.git
cd quickcart
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials:

```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secure_random_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env` if needed (defaults to `http://localhost:5001`):

```
VITE_API_BASE_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001

## Project Structure

```
quickcart/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route handlers
│   ├── middleware/       # Auth & role middlewares
│   ├── server.js        # Express app entry point
│   ├── .env.example     # Environment template
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API config
│   │   ├── App.jsx      # Main layout
│   │   └── main.jsx     # Router & entry point
│   ├── .env.example     # Environment template
│   └── package.json
├── .gitignore
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (sends OTP) |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/login` | Login |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Add product (seller/admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| DELETE | `/api/products/:id/seller` | Delete own product (seller) |
| POST | `/api/products/:id/reviews` | Add review |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Get user orders |
| GET | `/api/orders/all` | Get all orders (admin) |
| GET | `/api/orders/seller-orders` | Get seller orders |
| PUT | `/api/orders/:id` | Update status (admin) |

### Cart & Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/api/cart` | Cart CRUD |
| GET/POST/DELETE | `/api/wishlist` | Wishlist CRUD |

### Seller
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seller/register` | Seller registration |
| POST | `/api/seller/login` | Seller login |
| GET | `/api/seller/pending` | Get pending sellers (admin) |
| PUT | `/api/seller/verify/:id` | Approve/reject seller (admin) |

## License

ISC
