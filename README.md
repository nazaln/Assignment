# Personal Expense Tracker (MERN)

A responsive CRUD expense tracker built with React + Vite, Express, Node.js, MongoDB Atlas, and Mongoose.

## Project structure
```text
personal-expense-tracker/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── models/Expense.js
│   ├── routes/expenses.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Requirements
- Node.js 18 or newer
- A MongoDB Atlas cluster and database user

## 1. Configure MongoDB
In MongoDB Atlas, create a database user and allow your development IP address under Network Access. Copy the application's connection string.

Edit `backend/.env` (create it by copying `backend/.env.example`) and replace the placeholder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/expense_tracker?retryWrites=true&w=majority
```
Do not commit real database credentials to a public repository. The included `.env` files are templates/placeholders only.

## 2. Start the backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 3. Start the frontend
Open another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/expenses` | List expenses |
| GET | `/api/expenses/:id` | Get one expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/health` | API health check |

## Notes
- The total is calculated from the records returned by the API and updates after CRUD actions.
- Form validation runs in the browser and the API validates requests again.
- Delete requires confirmation.
- The project is written specifically for this assignment, but plagiarism/similarity tools use different datasets and settings. No one can guarantee a score below 20%; run your institution's checker and cite/adapt any required material.
