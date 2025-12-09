Medi-Alert Buddy

Medi-Alert Buddy is a full-stack health assistant web application that helps users manage medications, track weight progress, and trigger emergency alerts. The application is built with React, TypeScript, Vite, Tailwind CSS, shadcn-ui, and Supabase.

------------------------------------------------------------
KEY FEATURES
------------------------------------------------------------

Medication Management:
- Add, edit, and delete medication schedules
- Reminder workflow for upcoming doses
- Dashboard showing daily medications
- Prevents duplicate or invalid entries

Built-In Medicine Database:
- Preloaded medicine list stored in Supabase
- Fast search and autocomplete functionality
- Ensures accurate medication naming and consistency

Weight Tracker and Analytics:
- Set a personal goal weight
- Log daily or weekly weight entries
- Interactive charts for progress analysis
- Weekly summaries showing progress, stability, or regressions
- Export weight history and analytics as PDF or CSV
- User-specific weight data stored securely in Supabase

Emergency SOS System:
- One-click emergency alert trigger
- Ready for integration with SMS or WhatsApp API services
- Architecture supports geolocation-based alerts in the future

User Authentication:
- Secure login and signup using Supabase Auth
- Protected routes and session handling
- Data isolated per individual user

Modern UI and User Experience:
- Clean and responsive UI built using shadcn-ui components
- Tailwind CSS for mobile-first layout
- Designed for accessibility and ease of use

------------------------------------------------------------
TECH STACK
------------------------------------------------------------

Frontend:
React, TypeScript, Vite, Tailwind CSS, shadcn-ui

Backend and Database:
Supabase (PostgreSQL, Auth, Realtime)

Tools Used:
Node.js, npm, Git, GitHub, VS Code

------------------------------------------------------------
PROJECT STRUCTURE (SIMPLIFIED)
------------------------------------------------------------

src/
  components/       Reusable UI components
  pages/            Dashboard, Auth, Medications, Weight Tracker
  hooks/            Custom logic such as useAuth, useMedicines, useWeightTracker
  lib/              Supabase client and helpers
  data/             Preloaded medicine dataset
  utils/            Helper functions including export utilities
  App.tsx           Application entry point

------------------------------------------------------------
GETTING STARTED
------------------------------------------------------------

1. Clone the repository:
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>

2. Install dependencies:
   npm install

3. Add environment variables:
   Create a file named .env

   Inside .env:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Run the application:
   npm run dev

The app will be available at:
http://localhost:5173

------------------------------------------------------------
FUTURE ENHANCEMENTS
------------------------------------------------------------

- Push notification reminders
- Location-based emergency alerts
- More detailed analytics for health patterns
- Caregiver dashboard
- Offline mode with caching

------------------------------------------------------------
DEVELOPER
------------------------------------------------------------

Meera Sherin S
Cloud and Full-Stack Developer

------------------------------------------------------------
RESUME SUMMARY
------------------------------------------------------------

Medi-Alert Buddy is a full-stack health monitoring and emergency alert web application built with React, TypeScript, Tailwind, shadcn-ui, and Supabase. The project includes medication scheduling, a searchable medicine database, a weight tracking module with charts and downloadable analytics, secure authentication, and a responsive UI.
