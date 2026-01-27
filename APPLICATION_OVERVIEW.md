# DuGod Application - Complete Overview

## 📋 Project Structure

This is a **monorepo** containing three main applications:

1. **Backend** - Node.js/Express API Server
2. **adminApp** - Next.js Admin Dashboard
3. **customerApp** - Next.js Customer-Facing Web Application

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT tokens + Session management
- **Payment**: Paystack integration
- **Email**: ZeptoMail
- **Storage**: AWS S3 (for media files)
- **Shipping**: DHL integration
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston with daily rotation
- **Process Manager**: PM2 (for production)

### Admin App (Next.js 15)
- **Framework**: Next.js 15.3.6 with App Router
- **UI Library**: Material-UI (MUI) v7
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Emotion (CSS-in-JS)
- **Charts**: Recharts
- **HTTP Client**: Axios

### Customer App (Next.js 15)
- **Framework**: Next.js 15.3.6 with App Router
- **UI Library**: Material-UI (MUI) v7
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Payment**: Paystack Inline JS
- **OAuth**: Google Sign-In
- **Image Upload**: Cloudinary
- **Deployment**: Cloudflare Workers support (@opennextjs/cloudflare)
- **Carousel**: Swiper.js

---

## 🏗️ Architecture

### Backend Architecture
- **Pattern**: MVC (Model-View-Controller) with Service Layer
- **Structure**: Modular architecture with separate modules for each feature
- **Middleware**: Authentication, validation, error handling, rate limiting, security
- **Database**: MongoDB with Mongoose schemas
- **API**: RESTful API with Swagger documentation

### Frontend Architecture
- **Pattern**: Component-based with hooks for data fetching
- **Routing**: Next.js App Router (file-based routing)
- **API Communication**: Axios with interceptors
- **Authentication**: Cookie-based + JWT tokens

---

## 📦 Backend Modules

### Core Modules:
1. **Auth** - Authentication & authorization
   - Email verification
   - Password reset
   - Google OAuth
   - Session management
   - JWT token generation

2. **Users** - User management
   - User CRUD operations
   - User profiles
   - Role assignment

3. **Products** - Product catalog
   - Product management
   - Inventory tracking

4. **Orders** - Order processing
   - Order creation & management
   - Order status tracking
   - Email notifications

5. **Payments** - Payment processing
   - Paystack integration
   - Payment verification
   - Refunds
   - Webhooks

6. **Cart** - Shopping cart
   - Cart management
   - Add/remove items

7. **Coupons** - Discount management
   - Coupon creation
   - Validation
   - Usage tracking

8. **Shipping** - Shipping management
   - DHL integration
   - Shipping zones
   - Rate calculation

9. **Countries** - Country data
   - Country list
   - Country-specific settings

10. **Roles** - Role-based access control
    - Role management
    - Permission assignment

11. **Album Covers** - Music album artwork
    - Cover image management

12. **Email** - Email service
    - Email templates
    - Email sending via ZeptoMail

13. **Blackbox** - Interactive game/quiz system
    - Question management
    - Answer validation
    - Secret rewards
    - User progress tracking

14. **Countdown** - Countdown timers
    - Launch countdowns
    - Time remaining calculations
    - Status management

---

## 🎯 Admin App Features

### Dashboard Pages:
1. **Dashboard** (`/dashboard`)
   - Statistics overview
   - Recent orders
   - Key metrics

2. **Music Manager** (`/music-manager`)
   - Manage albums and singles
   - Add/edit music releases
   - Album covers management

3. **Shop Manager** (`/shop`)
   - Product management
   - Inventory control

4. **Coupons** (`/coupons`)
   - Create/edit coupons
   - Track usage

5. **Orders** (`/orders`)
   - View all orders
   - Order details
   - Status management

6. **Shipping Zones** (`/shipping-zones`)
   - Configure shipping zones
   - Set rates

7. **Blackbox** (`/blackbox`)
   - Manage game questions
   - View user progress
   - Configure secrets

8. **Countdown** (`/countdown`)
   - Create countdown timers
   - Manage launch dates

9. **Users** (`/users`)
   - User management
   - View user profiles
   - Role assignment

10. **Content Manager** (`/content-manager`)
    - Hero banners
    - Game metadata
    - Event highlights
    - Footer & legal content

11. **Game Editor** (`/game-editor`)
    - Edit game content

12. **Settings** (`/settings`)
    - Admin profile
    - Platform configurations
    - Email & notifications
    - Security controls

---

## 🛒 Customer App Features

### Public Pages:
1. **Home** (`/`)
   - Landing page with countdown
   - Hero section

2. **Music** (`/music`)
   - Browse albums
   - View album details
   - Track listings

3. **Shop** (`/shop`)
   - Product catalog
   - Product details
   - Add to cart

4. **Game** (`/game`)
   - Blackbox game
   - Rules & clues
   - Open box feature

### Authenticated Pages:
1. **User Home** (`/home`)
   - Personalized dashboard

2. **Profile** (`/user/profile`)
   - User profile
   - Order history
   - Settings

3. **Cart** (`/cart`)
   - Shopping cart
   - Checkout

4. **Checkout** (`/checkout`)
   - Payment processing
   - Order confirmation

### Auth Pages:
1. **Sign In** (`/auth/sign-in`)
   - Email/password login
   - Google OAuth

2. **Sign Up** (`/auth/sign-up`)
   - User registration

3. **Forgot Password** (`/auth/forgot-password`)
   - Password reset request

4. **Reset Password** (`/auth/reset-password`)
   - Password reset

5. **Verify Email** (`/auth/verify-email`)
   - Email verification

6. **Change Password** (`/auth/change-password`)
   - Update password

### Legal Pages:
- **Terms** (`/terms`)
- **Privacy** (`/privacy`)

---

## 🔐 Authentication & Security

### Authentication Flow:
1. **Sign Up**: User registers → Email verification sent
2. **Email Verification**: Required before login
3. **Login**: JWT token generated + Session created
4. **Session Management**: Tracks active sessions with IP/User-Agent
5. **Token Expiry**: 180 days (configurable)
6. **Logout**: Session revoked

### Security Features:
- **Helmet.js**: Security headers
- **CORS**: Configurable origins
- **Rate Limiting**: Express rate limiter
- **HPP**: HTTP Parameter Pollution protection
- **Password Hashing**: bcrypt (10 rounds)
- **JWT**: Signed tokens with secret key
- **Session Tracking**: IP address and user agent logging

### Authentication Methods:
1. **Email/Password**: Traditional authentication
2. **Google OAuth**: Social login with Google

---

## 💳 Payment Integration

### Paystack Integration:
- **Payment Methods**: Card, Bank, USSD, QR, Mobile Money, Bank Transfer
- **Features**:
  - Payment initialization
  - Payment verification
  - Refunds (full/partial)
  - Webhook handling
  - Transaction tracking

### Payment Flow:
1. User adds items to cart
2. Proceeds to checkout
3. Payment initialized via Paystack
4. User completes payment
5. Webhook verifies payment
6. Order confirmed

---

## 📧 Email Service

### ZeptoMail Integration:
- **Email Types**:
  - Verification emails
  - Password reset emails
  - Order confirmations
  - General notifications

### Email Features:
- Template management
- HTML email support
- Email verification tokens
- Password reset tokens

---

## 🗄️ Database Schema

### Key Models:
- **User**: User accounts, profiles, roles
- **Product**: Products, inventory, pricing
- **Order**: Orders, order items, status
- **Cart**: Shopping cart items
- **Coupon**: Discount codes
- **Payment**: Payment transactions
- **Session**: User sessions
- **BlackboxQuestion**: Game questions
- **BlackboxAnswer**: User answers
- **Countdown**: Countdown timers
- **Role**: User roles and permissions
- **Country**: Country data
- **ShippingZone**: Shipping configuration
- **AlbumCover**: Music album artwork
- **EmailTemplate**: Email templates

---

## 🌐 API Configuration

### Backend API:
- **Base URL**: `http://localhost:3001` (development)
- **Port**: 3001 (dev), 3000 (production)
- **API Prefix**: `/api` (via Next.js rewrites)
- **Documentation**: `/api-docs` (Swagger UI)

### Frontend API Configuration:
- **Environment Variable**: `NEXT_PUBLIC_API_URL`
- **Default**: `http://localhost:3000/api`
- **Axios Base URL**: Configured per app

---

## 🔧 Environment Variables

### Backend Required Variables:
```env
NODE_ENV=development
PORT=3001
SECRET_KEY=your-secret-key
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public
GOOGLE_CLIENT_ID=your-google-client-id
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PUBLIC_BUCKET=your-public-bucket
ZEPTO_API_TOKEN=your-zepto-token
ZEPTO_DOMAIN=your-zepto-domain
MONGODB_URI=mongodb://localhost:27017/dugod
MONGODB_URL=mongodb://localhost:27017/dugod
MONGODB_DATABASE=dugod
APP_URL=http://localhost:3001
ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend Environment Variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Running the Application

### Development Mode:

1. **Backend**:
   ```bash
   cd Backend
   npm run dev
   ```
   - Runs on port 3001
   - Uses nodemon for hot reload
   - Requires MongoDB connection

2. **Admin App**:
   ```bash
   cd adminApp
   npm run dev
   ```
   - Runs on port 3000
   - Uses Next.js Turbopack

3. **Customer App**:
   ```bash
   cd customerApp
   npm run dev
   ```
   - Runs on next available port (3001, 3002, etc.)
   - Uses Next.js Turbopack

### Production Build:

**Backend**:
```bash
cd Backend
npm run build
npm start
```

**Frontend Apps**:
```bash
cd adminApp  # or customerApp
npm run build
npm start
```

---

## 📝 Key Features

### 1. E-Commerce Platform
- Product catalog
- Shopping cart
- Order management
- Payment processing
- Shipping integration

### 2. Music Platform
- Album management
- Track listings
- Album artwork

### 3. Interactive Game (Blackbox)
- Question-based game
- Answer validation
- Secret rewards
- Progress tracking

### 4. Countdown System
- Launch countdowns
- Time remaining display
- Multiple countdown support

### 5. User Management
- Role-based access control
- Email verification
- Password reset
- Profile management

### 6. Admin Dashboard
- Comprehensive admin panel
- Statistics and analytics
- Content management
- Order processing

---

## 🔍 API Endpoints (Key Routes)

### Authentication:
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/login-admin` - Admin login
- `POST /auth/logout` - Logout
- `POST /auth/verify-email` - Verify email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/google` - Google OAuth

### Products:
- `GET /products` - List products
- `POST /products` - Create product
- `GET /products/:id` - Get product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders:
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order
- `PUT /orders/:id` - Update order

### Payments:
- `POST /payments/initialize` - Initialize payment
- `GET /payments/verify/:reference` - Verify payment
- `POST /payments/webhook` - Paystack webhook

### Cart:
- `GET /cart` - Get user cart
- `POST /cart` - Add to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove from cart

### Blackbox:
- `GET /blackbox/questions` - Get questions
- `POST /blackbox/questions` - Create question
- `POST /blackbox/answer` - Submit answer
- `GET /blackbox/progress` - Get user progress

### Countdown:
- `GET /countdown` - Get active countdown
- `POST /countdown` - Create countdown
- `PUT /countdown/:id` - Update countdown

---

## 🎨 UI/UX Features

### Design System:
- **Material-UI v7**: Modern component library
- **Custom Fonts**: ClashDisplay, Satoshi
- **Color Scheme**: Green accent color (#2FD65D)
- **Responsive Design**: Mobile-first approach

### Key UI Components:
- Navigation bars
- Sidebars (admin)
- Forms with validation
- Data tables
- Charts and graphs
- Image uploads
- Modals and dialogs
- Notifications (notistack)

---

## 📊 Monitoring & Logging

### Backend Logging:
- **Winston**: Structured logging
- **Daily Rotation**: Log file rotation
- **Log Levels**: Error, warn, info, debug
- **Log Directory**: `logs/` folder

### Error Handling:
- Centralized error middleware
- HTTP exception handling
- Validation errors
- API error responses

---

## 🔄 Deployment

### Backend Deployment:
- **PM2**: Process management
- **Ecosystem Config**: `ecosystem.config.js`
- **Environments**: dev, staging, production
- **Build**: TypeScript compilation

### Frontend Deployment:
- **Customer App**: Cloudflare Workers support
- **Admin App**: Standard Next.js deployment
- **Build**: Next.js production build

---

## 📚 Additional Resources

### Documentation:
- **Swagger API Docs**: Available at `/api-docs` when backend is running
- **TypeScript**: Full type safety
- **Code Comments**: Inline documentation

### Testing:
- **Backend**: Jest test suite
- **Test Files**: Located in `Backend/src/tests/`

### Scripts:
- **Backend**:
  - `npm run dev` - Development server
  - `npm run build` - Build for production
  - `npm test` - Run tests
  - `npm run lint` - Lint code

- **Frontend**:
  - `npm run dev` - Development server
  - `npm run build` - Production build
  - `npm start` - Production server
  - `npm run lint` - Lint code

---

## ⚠️ Important Notes

1. **MongoDB Required**: Backend needs MongoDB connection
2. **Environment Variables**: All apps require proper environment configuration
3. **Email Service**: ZeptoMail credentials needed for email functionality
4. **Payment**: Paystack keys required for payment processing
5. **AWS S3**: Required for file uploads and media storage
6. **Google OAuth**: Client ID needed for Google sign-in
7. **CORS**: Configure allowed origins in backend
8. **Session Management**: Sessions stored in MongoDB
9. **Rate Limiting**: Enabled on backend API
10. **Security**: Helmet.js and other security middleware active

---

## 🎯 Next Steps

1. **Configure Environment Variables**: Set up all required API keys and credentials
2. **Set Up MongoDB**: Install and configure MongoDB database
3. **Configure AWS S3**: Set up S3 buckets for media storage
4. **Set Up Paystack**: Configure payment gateway
5. **Configure ZeptoMail**: Set up email service
6. **Set Up Google OAuth**: Configure Google sign-in
7. **Run Migrations**: Set up initial data if needed
8. **Test Authentication**: Verify login/signup flow
9. **Test Payments**: Verify payment integration
10. **Deploy**: Deploy to production environment

---

## 📞 Support & Resources

- **Repository**: https://github.com/emasys/dugod-service
- **API Documentation**: Available at `/api-docs` endpoint
- **Swagger YAML**: `Backend/swagger.yaml`

---

*Last Updated: Based on current codebase scan*




