Kanban Board (MERN Stack)

A full-stack Kanban Board application built using the MERN stack. It allows users to manage workspaces, boards, columns, and cards with authentication and real-time updates.

Features
	•	User Authentication (JWT-based)
	•	Create & manage Workspaces
	•	Create Boards inside Workspaces
	•	Add Columns & Cards
	•	Activity Logs
	•	Real-time updates using sockets
	•	Protected Routes

Tech Stack
	•	Frontend: React.js
	•	Backend: Node.js, Express.js
	•	Database: MongoDB
	•	Auth: JWT
	•	Realtime: Socket.io

Project Structure

frontend/
  src/
    api/
    components/
    context/
    hooks/
    pages/

backend/
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
    sockets/
    utils/


Environment Variables

Create a .env file in backend:
PORT=4000
MONGO_URI=mongodb://localhost:27017/assignment
JWT_SECRET=f63c70f41823a30581d525ef336a8dc0

Installation & Setup

1. Backend Setup
    cd backend
    npm install
    npm run dev

2. Frontend Setup
     cd frontend
     npm install
     npm start


Notes
	•	This project covers most required features at a basic level.
	•	It can be further improved into a production-grade application with more time.

Author

Ritesh Sharma