# SpendWise Finance Ecosystem 💸

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**SpendWise** is a comprehensive, AI-powered personal finance management ecosystem. It seamlessly integrates a modern web interface with robust backend services and intelligent analytics to provide users with unparalleled insights into their spending habits, budgeting, and financial forecasting.

---

## 🌟 Key Features

### 🖥️ Frontend Architecture (React + Vite)
- **Modern User Interface:** Crafted with [Shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive, and highly polished user experience.
- **Secure Authentication:** Implements JWT-based user authentication covering login, registration, and profile management.
- **Interactive Dashboards:** Dynamic and comprehensive data visualization for income streams, expense tracking, budget monitoring, and savings goals.
- **Media Management:** Seamless integration with Cloudinary for robust handling of user avatars and receipt image uploads.
- **Cross-Platform Compatibility:** Fully responsive design optimized for both desktop and mobile platforms.

### ⚙️ Core Backend Service (Node.js & Express)
- **RESTful API Engine:** Scalable Express.js architecture managing CRUD operations across Income, Expenses, Categories, Budgets, and Savings Goals.
- **Database Management:** High-performance data modeling utilizing MongoDB and Mongoose with modern ES Modules.
- **Robust Security:** Comprehensive security measures including bcrypt password hashing and middleware-protected API endpoints.
- **Administrative Control:** Role-Based Access Control (RBAC) ensuring secure management of users and platform-wide statistics.

### 🧠 Analytics & Machine Learning Engine (Python & Django)
- **Advanced Data Processing:** Utilizes **Pandas** for rigorous cleaning, structuring, and analysis of raw financial data.
- **Data Portability:** Direct-from-database CSV export capabilities for customized user reporting.
- **Predictive Modeling:** Leverages **Scikit-Learn** (Linear Regression) to analyze historical data and accurately forecast future spending patterns.
- **Visual Analytics:** Generates actionable trends and insights that power the frontend data visualization layers.

---

## 📁 System Architecture

```text
spendwise-finance-tracker/
├── client/           # React Frontend Application (Vite)
├── server/           # Core Node.js + Express REST API
└── analytics/        # Python Django Analytics & Machine Learning Service
```

---

## 🛠️ Technology Stack

### Application Core (FSD-2 Layer)
- **Database:** MongoDB & Mongoose
- **Backend Framework:** Node.js (ES Modules) & Express.js
- **Frontend Framework:** React.js (Vite)
- **Styling:** Tailwind CSS & Shadcn UI

### Intelligence Core (Python-II Layer)
- **Language:** Python 3
- **Web Framework:** Django & Django REST Framework
- **Data Science:** Pandas & NumPy
- **Machine Learning:** Scikit-Learn
- **Database Driver:** PyMongo

---

## 🚀 Getting Started

To experience the complete SpendWise ecosystem, ensure all three services are running concurrently.

### 1. Core Backend (Node.js)
```bash
cd server
npm install
# Ensure .env is configured based on .env.example before starting
npm start
```

### 2. Frontend Application (React)
```bash
cd client
npm install
npm run dev
```

### 3. Analytics Engine (Python/Django)
```bash
cd analytics
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 8000
```

---

## 📈 Machine Learning Prediction Module

The dedicated Python analytics API aggregates historical monthly expenses to drive our predictive features.
Currently, it powers the **Linear Regression Model**, which critically analyzes past expenditure trajectories to forecast the next month's spending behavior. 

These sophisticated predictions are exposed via RESTful endpoints and surfaced directly within the React application's **AI Predictions Dashboard**, empowering users with forward-looking financial insights.
