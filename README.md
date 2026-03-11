# Learnix - AI Learning Assistant

A Full-Stack AI Learning Assistant App using MERN stack (MongoDB, Express, React, Node.js), styled with Tailwind CSS, and powered by local Transformers AI.

## Features

- **User Authentication** – Secure login & signup with JWT
- **PDF Upload & Management** – Upload, store, and manage study documents
- **Embedded PDF Viewer** – Read documents directly within the app
- **AI-Powered Chat** – Ask questions about your documents
- **AI Document Summary** – Generate concise summaries
- **AI Concept Explainer** – Get detailed explanations
- **Auto-Generated Flashcards** – Create flashcard sets automatically
- **AI Quiz Generator** – Generate custom multiple-choice quizzes
- **Quiz Results & Analytics** – View detailed score breakdowns
- **Progress Tracking Dashboard** – Monitor your learning progress
- **Favorites System** – Mark important flashcards
- **Responsive UI** – Modern, mobile-friendly design with glassmorphism

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd learnix
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learnix
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```


## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system.

### Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on http://localhost:5000

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Building for Production

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Backend
```bash
cd backend
npm start
```

## Project Structure

```
learnix/
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── uploads/          # PDF file storage
│   ├── server.js         # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── utils/        # Utilities (API client)
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Entry point
│   ├── public/
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Local LLMs via Transformers.js
- Multer for file uploads
- PDF-Parse for PDF text extraction

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload PDF
- `GET /api/documents/:id` - Get single document
- `DELETE /api/documents/:id` - Delete document

### AI Features
- `POST /api/ai/chat` - Chat with document
- `POST /api/ai/summary` - Generate summary
- `POST /api/ai/explain` - Explain concept

### Flashcards
- `POST /api/flashcards/generate` - Generate flashcards
- `GET /api/flashcards/document/:documentId` - Get flashcards
- `PATCH /api/flashcards/:id/favorite` - Toggle favorite

### Quizzes
- `POST /api/quizzes/generate` - Generate quiz
- `GET /api/quizzes/:id` - Get quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Progress
- `GET /api/progress` - Get user progress stats

## License
MIT
