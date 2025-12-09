Medi-Alert Buddy 🚑💊

Medi-Alert Buddy is a full-stack health assistant web application that helps users manage medications, track weight progress, and trigger emergency alerts.  
It is built using React, TypeScript, Vite, Tailwind CSS, shadcn-ui, and Supabase. The focus is on clean UI, secure authentication, fast performance, and real-time data handling.

------------------------------------------------------------
✨ KEY FEATURES
------------------------------------------------------------

Medication Management 💉
• Add, edit, and delete medication schedules  
• Reminder workflow for upcoming doses  
• Daily dashboard showing all required medications  
• Duplicate and invalid entries are automatically prevented  

Built-In Medicine Database 💊
• Preloaded medicine list stored in Supabase  
• Fast search and autocomplete for quick selection  
• Ensures accurate and consistent medication names  

Weight Tracker & Analytics ⚖️📈
• Set a personal goal weight  
• Log daily or weekly weight entries  
• Interactive charts to visualize progress  
• Weekly summaries showing improvement or regressions  
• Export weight data as PDF or CSV  
• All weight data stored securely per user in Supabase  

Emergency SOS System 🚨
• One-tap emergency alert trigger  
• Built to support SMS / WhatsApp API integrations  
• Architecture prepared for geolocation-based alerts  

User Authentication 🔐
• Secure signup and login using Supabase Auth  
• Proper session handling and route protection  
• Data isolated per individual user  

Modern UI & UX 🎨
• Built using shadcn-ui for clean component styling  
• Responsive and mobile-first layouts using Tailwind CSS  
• Designed to be simple, fast, and accessible  

------------------------------------------------------------
🛠️ TECH STACK
------------------------------------------------------------

Frontend:
React, TypeScript, Vite, Tailwind CSS, shadcn-ui  

Backend / Database:
Supabase (PostgreSQL, Auth, Realtime APIs)

Developer Tools:
Node.js, npm, Git, GitHub, VS Code  

------------------------------------------------------------
📁 PROJECT STRUCTURE (HIGH LEVEL)
------------------------------------------------------------

src/
  components/       Reusable UI components  
  pages/            Dashboard, Auth, Medications, Weight Tracker  
  hooks/            useAuth, useMedicines, useWeightTracker  
  lib/              Supabase client and helpers  
  data/             Preloaded medicine dataset  
  utils/            Helper utilities including PDF/CSV export  
  App.tsx           Application entry  

------------------------------------------------------------
🚀 GETTING STARTED
------------------------------------------------------------

1. Clone the repository:
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>

2. Install dependencies:
   npm install

3. Add environment variables by creating a file named .env:
   VITE_SUPABASE_URL=your_supabase_url  
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  

4. Run the application:
   npm run dev

App will run at:
http://localhost:5173

------------------------------------------------------------
🌱 FUTURE ENHANCEMENTS
------------------------------------------------------------

• Push notification reminders  
• Location-based emergency alerts  
• Enhanced analytics (BMI, moving averages, insights)  
• Caregiver dashboard with multi-user support  
• Offline mode with caching and local sync  

------------------------------------------------------------
