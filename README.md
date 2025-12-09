

```md
# 🚨 Medi-Alert Buddy

A full-stack health-assistant web application that helps users manage medications, track weight progress, and trigger emergency alerts when needed. Built with **React, TypeScript, VVite, Tailwind CSS, shadcn-ui, and Supabase**, the app delivers a seamless, responsive, and secure user experience.

---

## ✨ Key Features

### 🧠 Medication Management
- Add, edit, and delete medication schedules  
- Automatic reminders workflow  
- Minimal dashboard showing daily doses  
- Prevents duplicate or invalid entries  

### 💊 Built-In Medicine Database
- Preloaded medicine list stored in Supabase  
- Fast search and autocomplete  
- Ensures accurate & consistent medication naming  

### ⚖️ Weight Tracker & Analytics
- Set a personal **goal weight**  
- Log daily/weekly weight entries  
- **Interactive weight charts** for trend analysis  
- Weekly status summaries (progress, stability, or regressions)  
- **Export data as PDF or CSV** for doctors, caregivers, or personal tracking  
- Persistent, user-specific data in Supabase  

### 🚨 Emergency SOS System
- One-tap emergency alert trigger  
- API-ready for SMS / WhatsApp / caregiver notifications  
- Architecture supports future geolocation-based alerts  

### 👤 User Authentication
- Secure signup & login via **Supabase Auth**  
- Session management & protected routes  
- Per-user data isolation  

### 🖥️ Modern UI/UX
- Premium UI with **shadcn-ui components**  
- Tailwind CSS for responsive, mobile-first design  
- Clean, accessible layouts optimized for elderly users  

---

## 🛠️ Tech Stack

**Frontend:**  
React • TypeScript • Vite • Tailwind CSS • shadcn-ui  

**Backend / Database:**  
Supabase (PostgreSQL, Auth, Realtime APIs)

**Developer Tools:**  
VS Code • Git/GitHub • Node.js • npm  

---

## 📂 Project Structure (High-Level)

```

/src
├── components/      # Reusable components (charts, forms, cards)
├── pages/           # Dashboard, Auth, Medications, Weight Tracker
├── hooks/           # useAuth, useMedicines, useWeightTracker
├── lib/             # Supabase client + API helpers
├── data/            # Preloaded medicine dataset
├── utils/           # Helpers & export utilities (CSV/PDF)
└── App.tsx          # Entry point

````

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url  
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server

```bash
npm run dev
```

Your app will be available at:
👉 [http://localhost:5173](http://localhost:5173)

---

## 📤 Data Export (Weight Tracker)

* Download weight history as **CSV**
* Generate printable **PDF reports** containing charts & weekly analysis
* Ideal for clinical sharing or personal journals

---

## 🌱 Future Enhancements

* Push notification & SMS medication reminders
* Location-based emergency alerts
* Advanced analytics: BMI, moving averages, projections
* Caregiver/Family portal
* Offline-ready mode with caching

---



---

---

```

---


Just tell me, baby — I’ll make this repo look ✨premium✨.
```
