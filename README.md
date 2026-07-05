# SpendWise Finance Ecosystem

An integrated web application built to master financial tracking, analytics, and AI predictions.

This project strictly aligns with the FSD-2 (MERN Stack) and Python-II (Data Science, Django, Machine Learning) syllabus requirements.

## 🚀 Key Features

### Frontend (React + Vite)
- **Modern UI**: Designed with Shadcn UI and Tailwind CSS for a premium, anti-slop aesthetic.
- **Authentication**: JWT-based login, registration, and profile management.
- **Dashboards**: Dynamic visualization of income, expenses, budgets, and savings goals.
- **Cloudinary Integration**: Avatar and receipt uploads.
- **Fully Responsive**: Optimized for desktop and mobile use.

### Backend 1: Node.js (FSD-2 Core)
- **Express.js API**: Handles CRUD operations for Income, Expense, Category, Budget, and Savings Goals.
- **MongoDB**: Robust data modeling using Mongoose (ES modules enabled).
- **Security**: Password hashing with bcrypt, protected routes via middleware.
- **Admin Panel**: Role-based access control for managing users and platform statistics.

### Backend 2: Python / Django (Python-II Analytics)
- **Data Analytics**: Clean and analyze financial data using **Pandas**.
- **Data Export**: Export expenses to CSV directly from MongoDB.
- **Machine Learning**: Predict future expenses using **Scikit-Learn** (Linear Regression & Decision Tree Regressor).
- **Data Visualization**: Integrated charts and trends built on aggregated Python analysis.

## 📁 Project Structure

```
spendwise-finance-tracker/
├── client/           # React Frontend (Vite)
├── server/           # Node.js + Express Backend
└── analytics/        # Python Django Analytics & ML API
```

## 🛠️ Tech Stack

**FSD-2 Layer:**
- MongoDB & Mongoose
- Express.js
- React.js (Vite)
- Node.js (ES Modules)
- Tailwind CSS & Shadcn UI

**Python-II Layer:**
- Python 3
- Django & Django REST Framework
- Pandas & NumPy
- Scikit-Learn
- PyMongo

## 🚦 Getting Started

### 1. Node Server Setup

```bash
cd server
npm install
# Configure .env based on .env.example
npm start
```

### 2. React Client Setup

```bash
cd client
npm install
npm run dev
```

### 3. Python Analytics Setup

```bash
cd analytics
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 8000
```

*Note: Ensure all services (Node, React, and Django) are running concurrently for the full ecosystem experience.*

## 📈 ML Prediction Module

The Python API uses historical monthly aggregated expenses. It runs two models:
1. **Linear Regression**: For trend line estimations.
2. **Decision Tree Regressor**: For pattern-based monthly predictions.

These results are served to the frontend React application under the AI Predictions dashboard.
