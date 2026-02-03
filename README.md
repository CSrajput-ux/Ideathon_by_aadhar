# 🇮🇳 Aadhaar Enrolment Trend & Demand Prediction Dashboard

![Status](https://img.shields.io/badge/Status-Prototype-green)
![Tech](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI-blue)
![AI](https://img.shields.io/badge/AI-Prophet%20%26%20IsolationForest-orange)

> **"Don't just count heads, measure the time."** > An AI-powered analytics dashboard helping the Government optimize Aadhaar Seva Kendra operations by predicting demand, calculating actual workload, and suggesting locations for new centers.

---

## 🧐 The Problem Statement
Currently, resources at Aadhaar Seva Kendras (ASKs) are allocated based on **"Headcount"** (Total Enrolments). This is fundamentally flawed because:
* A **Demographic Update** takes only **8 minutes**.
* A **New Adult Enrolment** takes **25 minutes**.

Counting both as "1 person" leads to poor resource planning. Some centers are overcrowded while others sit idle. The government lacks a data-driven tool to decide **where to open new centers** based on actual time-demand.

---

## 💡 Our Solution
We have built a **Smart Location Planning & Resource Management System** that:
1.  **Calculates "Workload Hours":** Converts raw counts into time-based metrics.
2.  **Predicts Future Demand:** Uses AI (Time-Series Forecasting) to predict workload for the next 7-30 days.
3.  **Detects Anomalies:** Identifies sudden surges in demand (e.g., harvest season or school admissions).
4.  **Recommends New Centers:** Identifies Pincodes where demand consistently exceeds capacity, suggesting the opening of permanent or mobile centers.

---

## ⚙️ How It Works (The Logic)

We process raw UIDAI dataset using our **Weighted Workload Algorithm**:

$$
\text{Total Workload (Mins)} = (N_{child} \times 10) + (N_{adult} \times 25) + (U_{bio} \times 15) + (U_{demo} \times 8)
$$

| Task Type | Standard Time |
| :--- | :--- |
| **New Enrolment (0-5 Yrs)** | 10 Mins |
| **New Enrolment (18+ Yrs)** | 25 Mins |
| **Biometric Update** | 15 Mins |
| **Demographic Update** | 8 Mins |

---

## 🛠️ Tech Stack

### **Frontend**
* ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React.js (Vite)**
* ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS**
* **Recharts** (Data Visualization)
* **Axios** (API Integration)

### **Backend & AI**
* ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) **FastAPI (Python)**
* ![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=flat&logo=pandas&logoColor=white) **Pandas & NumPy**
* **Facebook Prophet** (Forecasting Model)
* **Scikit-Learn** (Isolation Forest for Anomaly Detection)
* **SQLAlchemy** (Database ORM)

---

## 📸 Screenshots

| Dashboard Overview | AI Recommendations |
| :---: | :---: |
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard+UI) | ![AI Insights](https://via.placeholder.com/400x200?text=AI+Insights) |
*(Replace these links with actual screenshots of your project)*

---

## 🚀 Installation & Setup Guide

Follow these steps to run the project locally.

### Prerequisites
* Node.js & npm
* Python 3.9+

### 1️⃣ Backend Setup
```bash
# Navigate to backend folder
cd Aadhar_backend

# Create virtual environment
python -m venv .venv

# Activate environment
# Windows:
.\.venv\Scripts\Activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pandas scikit-learn prophet python-multipart

# Run Server
uvicorn app.main:app --reload
