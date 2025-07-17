# Resume Analysis Backend

A Node.js/TypeScript backend for the Resume Analysis application using Express, PostgreSQL, MongoDB, and OpenAI.

## Tech Stack

- Node.js & TypeScript
- Express.js for API
- PostgreSQL (via TypeORM) for user data
- MongoDB (via Mongoose) for resume data
- OpenAI API for resume analysis
- JWT for authentication
- Zod for validation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-key-change-in-production
POSTGRES_URL=postgresql://username:password@localhost:5432/resume_analysis
MONGODB_URI=mongodb://localhost:27017/resume_analysis
OPENAI_API_KEY=your-openai-api-key
```

3. Start PostgreSQL and MongoDB databases

4. Run the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user

  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`

- `POST /api/auth/login` - Login user

  - Body: `{ "email": "user@example.com", "password": "password123" }`

- `GET /api/auth/me` - Get current user info
  - Header: `Authorization: Bearer <token>`

### Resume Analysis (To be implemented)

- `POST /api/resumes` - Upload and analyze a resume
- `GET /api/resumes` - Get all resumes for current user
- `GET /api/resumes/:id` - Get specific resume analysis
- `DELETE /api/resumes/:id` - Delete a resume

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter
- `npm test` - Run tests

## Database Schema

### PostgreSQL (Users)

- Users table with email, password, and profile information
- Handles authentication and user management

### MongoDB (Resumes)

- Stores resume data and analysis results
- Flexible schema for different resume formats
- Stores AI analysis results

## Security Notes

- JWT used for authentication
- Passwords hashed using bcrypt
- Environment variables for sensitive data
- CORS enabled for frontend integration
- Input validation using Zod

Remember to:

- Change all secret keys in production
- Set up proper database credentials
- Secure your OpenAI API key
- Set up proper CORS configuration for production
