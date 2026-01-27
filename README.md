# DuGod - Complete E-Commerce & Music Platform

A comprehensive full-stack application combining e-commerce, music distribution, and interactive gaming features.

## 🏗️ Architecture

This is a **monorepo** containing three main applications:

### 1. Backend (Node.js/TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Session management
- **Payment**: Paystack integration
- **Email**: ZeptoMail service
- **Storage**: AWS S3 for media files
- **Shipping**: DHL integration
- **Documentation**: Swagger/OpenAPI

### 2. Admin Dashboard (Next.js 15)
- **Framework**: Next.js 15.3.6 with App Router
- **UI**: Material-UI v7
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### 3. Customer App (Next.js 15)
- **Framework**: Next.js 15.3.6 with App Router
- **UI**: Material-UI v7
- **Payment**: Paystack Inline JS
- **OAuth**: Google Sign-In
- **Image Upload**: Cloudinary
- **Deployment**: Cloudflare Workers support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- AWS S3 account
- Paystack account
- ZeptoMail account
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dugod
```

2. **Install dependencies**
```bash
# Backend
cd Backend
npm install

# Admin App
cd ../adminApp
npm install

# Customer App
cd ../customerApp
npm install
```

3. **Environment Setup**
```bash
# Copy and configure environment variables
cp Backend/.env.development Backend/.env
# Configure all required variables as shown in APPLICATION_OVERVIEW.md
```

4. **Run the applications**
```bash
# Backend (Terminal 1)
cd Backend
npm run dev

# Admin App (Terminal 2)
cd adminApp
npm run dev

# Customer App (Terminal 3)
cd customerApp
npm run dev
```

## 📋 Features

### E-Commerce
- Product catalog with inventory management
- Shopping cart and checkout system
- Order processing and tracking
- Payment integration with Paystack
- Shipping management with DHL
- Coupon and discount system

### Music Platform
- Album and single management
- Track listings and metadata
- Album artwork management
- Music distribution features

### Interactive Gaming
- Blackbox question-based game
- Answer validation system
- Secret rewards and progress tracking
- Countdown timers for launches

### User Management
- Role-based access control
- Email verification
- Password reset
- Google OAuth integration
- Session management

### Admin Dashboard
- Comprehensive admin panel
- Statistics and analytics
- Content management
- Order processing
- User management

## 📚 Documentation

- **Application Overview**: See [APPLICATION_OVERVIEW.md](./APPLICATION_OVERVIEW.md) for detailed documentation
- **API Documentation**: Available at `/api-docs` when backend is running
- **Database Schema**: Defined in Backend/src/modules/

## 🔧 Development

### Scripts
```bash
# Backend
npm run dev          # Development server
npm run build        # Build for production
npm test            # Run tests
npm run lint        # Lint code

# Frontend Apps
npm run dev         # Development server
npm run build       # Production build
npm start          # Production server
npm run lint       # Lint code
```

### Environment Variables
See APPLICATION_OVERVIEW.md for complete list of required environment variables.

## 🌐 Deployment

### Backend
- Built with PM2 process management
- TypeScript compilation
- Environment-specific configurations

### Frontend
- Customer App: Cloudflare Workers support
- Admin App: Standard Next.js deployment
- Production builds optimized for performance

## 📊 Technology Stack

### Backend
- Node.js, TypeScript, Express.js
- MongoDB, Mongoose
- JWT, bcrypt
- Paystack, AWS S3, ZeptoMail
- Winston, Swagger

### Frontend
- Next.js 15, React 19
- Material-UI v7, Emotion
- TanStack Query, React Hook Form
- Google OAuth, Cloudinary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the comprehensive APPLICATION_OVERVIEW.md

---

**Built with ❤️ for the DuGod platform**
