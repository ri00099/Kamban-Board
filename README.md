Kanban Board (MERN Stack)

A full-stack Kanban Board application built using the MERN stack. This app allows users to manage workspaces, boards, columns, and tasks efficiently with authentication and real-time updates.

⸻

Features
	•	JWT-based Authentication (Login/Register)
	•	Workspace Management
	•	Board & Column Creation
	•	Task/Card Management
	•	Activity Logging
	•	Real-time Updates (Socket.io)
	•	Protected Routes

⸻

Tech Stack
	•	Frontend: React.js
	•	Backend: Node.js, Express.js
	•	Database: MongoDB
	•	Authentication: JWT
	•	Realtime: Socket.io

⸻

Project Structure
```
frontend/
 └── src/
     ├── api/
     ├── components/
     ├── context/
     ├── hooks/
     └── pages/

backend/
 └── src/
     ├── config/
     ├── controllers/
     ├── middlewares/
     ├── models/
     ├── routes/
     ├── sockets/
     └── utils/
```



Environment Variables

Create a .env file inside the backend folder:
PORT=4000
MONGO_URI=mongodb://localhost:27017/assignment
JWT_SECRET=f63c70f41823a30581d525ef336a8dc0


Installation & Setup

1. Clone Repository
   git clone https://github.com/ri00099/Kamban-Board/
   cd kanban-board

2. Setup Backend
    cd backend
    npm install
    npm run dev
3. Setup Frontend
   cd frontend
   npm install
   npm start
Important Note

This project implements most of the required features at a basic level as per the assignment scope. With additional time, it can be enhanced into a production-grade application with improved UI, performance, and scalability.

⸻

Future Improvements
	•	Drag & Drop (DND)
	•	Role-based Access Control
	•	Better UI/UX
	•	Optimized API handling
	•	Deployment (AWS/Vercel)

⸻

Author

Ritesh Sharma
Frontend / MERN Developer
