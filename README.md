# Emergency-Loc
Emergency-Loc is a web-based system designed for emergency responders to efficiently receive calls, obtain locations from bystanders, and track ambulances in real-time. The system categorizes users into different roles, including responder, supervisor, and admin, allowing them to store and access data at any time.

# Features
- Real-time Location Tracking: Uses Leaflet for mapping and tracking ambulances and incidents.
- Role-Based Access Control: Different user roles (responder, supervisor, admin) with specific permissions.
- Data Storage and Retrieval: Persistent storage of call logs and incident reports using Supabase.
- User-Friendly Interface: Developed with React for an intuitive and responsive UI.
- Hosting: Deployed on Vercel for easy access and scalability.

# Technology Stack
- Frontend: React.js
- Backend: Supabase (Database and Authentication)
- Mapping: Leaflet.js
- Hosting: Vercel

# Setup Instructions
- Prerequisites
- Node.js (v14 or higher)
- NPM or Yarn
- Supabase account for backend setup
- Vercel account for deployment
- Installation
- Clone the repository:

git clone https://github.com/SanatKulkarni/Emergency-Loc.git
cd Emergency-Loc

### Installation

1. Clone the repository:
   bash
   git clone https://github.com/SanatKulkarni/Emergency-Loc.git
   cd Emergency-Loc
   npm install
   
   
# Set up environment variables:
Create a .env file in the root directory and add your Supabase and other necessary API keys.

# Run the development server:

bash
npm run dev
# or
yarn dev

Open your browser and navigate to http://localhost:3000 to see the app in action.

# Deployment
- Connect your repository to Vercel.
- Set up the environment variables in Vercel settings.
- Deploy the application directly from Vercel.

# Contributing
Contributions are welcome! Please follow these steps to contribute:

# Fork the repository.
- Create a new branch (git checkout -b feature-branch).
- Commit your changes (git commit -m 'Add some feature').
- Push to the branch (git push origin feature-branch).
- Open a pull request.

# Contact
For any questions or issues, please open an issue on GitHub or reach out via email at sanatkulkarni100@gmail.com.
