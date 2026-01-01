# QuickCart - Full Stack E-Commerce Platform

A modern, full-featured e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring multi-role authentication, product management, order processing, and return/replacement system.

## 🚀 Features

### User Features
- **Authentication**: Secure registration/login with OTP verification
- **Product Browsing**: Search, filter, and view products with reviews
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products
- **Order Management**: Place orders, track status, view history
- **Returns/Replacements**: Request returns or replacements within 7 days
- **Multi-Currency Support**: View prices in different currencies
- **Responsive Design**: Mobile-friendly interface

### Seller Features
- **Seller Dashboard**: Overview of products, orders, and sales
- **Product Management**: Add, edit, delete products with image upload
- **Order Processing**: Manage customer orders, update status
- **Return Handling**: Approve/reject return and replacement requests
- **Sales Analytics**: Track performance and revenue

### Admin Features
- **Admin Dashboard**: Complete system overview and statistics
- **User Management**: Manage users and assign admin roles
- **Product Oversight**: Manage all products across the platform
- **Order Management**: Oversee all orders and their statuses
- **Seller Verification**: Approve/reject seller applications

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Cloudinary** - Image storage and management
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5001
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001
VITE_NGROK_HOST=your-ngrok-host.ngrok-free.app
```

5. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Email Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use the app password in the `EMAIL_PASS` environment variable

### Cloudinary Setup
1. Create a free Cloudinary account
2. Get your cloud name, API key, and API secret from the dashboard
3. Add these credentials to your backend `.env` file

### MongoDB Setup
- **Local**: Install MongoDB locally and use `mongodb://localhost:27017/ecommerce`
- **Cloud**: Use MongoDB Atlas and replace with your connection string

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set all environment variables in your hosting platform
2. Ensure MongoDB connection string is configured
3. Deploy the backend folder

### Frontend Deployment (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to your deployed backend URL
2. Deploy the client folder

## 📱 Usage

### For Customers
1. Register/Login to your account
2. Browse products and add to cart/wishlist
3. Place orders with delivery address
4. Track order status and request returns if needed

### For Sellers
1. Register as a seller (requires admin approval)
2. Add products with images and descriptions
3. Manage orders and update shipping status
4. Handle return/replacement requests

### For Admins
1. Login with admin credentials
2. Manage users, products, and orders
3. Approve seller applications
4. Monitor platform statistics

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Different permissions for users, sellers, and admins
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MongoDB for the database
- Cloudinary for image management
- Tailwind CSS for styling
- React community for excellent libraries

## 📞 Support

For support, email support@quickcart.com or create an issue in this repository.

---

**QuickCart** - Your one-stop e-commerce solution! 🛒✨