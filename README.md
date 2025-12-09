

```md
# Medi-Alert Buddy

Medi-Alert Buddy is a full-stack health assistant web application that helps users manage medications, track weight progress, and trigger emergency alerts. Built with React, TypeScript, Vite, Tailwind CSS, shadcn-ui, and Supabase, the application focuses on clean UI, secure authentication, and a smooth user experience.

---

## Key Features

### Medication Management
- Add, edit, and delete medication schedules
- Reminder workflow for upcoming doses
- Dashboard showing daily medications
- Prevents duplicate or invalid entries

### Built-In Medicine Database
- Preloaded medicine list stored in Supabase
- Fast search and autocomplete functionality
- Ensures accurate medication naming and consistency

### Weight Tracker & Analytics
- Set a personal goal weight
- Log daily or weekly weight entries
- View interactive charts for progress analysis
- Weekly summaries for progress, stability, or regressions
- Export weight history and analytics as PDF or CSV
- User-specific data stored securely in Supabase

### Emergency SOS System
- One-click emergency alert trigger
- Ready for integration with SMS/WhatsApp alert APIs
- Architecture prepared for future geolocation support

### User Authentication
- Secure login and signup with Supabase Auth
- Protected routes and session handling
- Data isolated per user

### Modern UI/UX
- Built using shadcn-ui component library
- Responsive and mobile-first design
- Clean, readable layouts

---

## Tech Stack

**Frontend:**  
React, TypeScript, Vite, Tailwind CSS, shadcn-ui

**Backend / Database:**  
Supabase (PostgreSQL, Auth, Realtime)

**Tools:**  
Git, GitHub, Node.js, npm, VS Code

---

## Project Structure

```

/src
├── components/
├── pages/
├── hooks/
├── lib/
├── data/
├── utils/
└── App.tsx

````

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
````

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the app

```bash
npm run dev
```

The app will run at:

```
http://localhost:5173
```

---

## Future Enhancements

* Push notification reminders
* Location-based emergency alerts
* Advanced analytics for weight and health patterns
* Caregiver dashboard
* Offline mode with caching

---

## Developer

**Meera Sherin S**
Cloud & Full-Stack Developer

---
```

---


```
