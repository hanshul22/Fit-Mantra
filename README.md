# AI Workout Plan Generator

A Node.js application that generates personalized 12-session workout plans based on user profiles. This application was created as part of an AI Intern Assessment.

## Features

- Generates a 12-session progressive workout plan (3 sessions/week, 4 weeks)
- Each workout contains Warm-Up, Main Exercises, and Cool-Down sections
- Optional Circuit or Superset sections
- Progressive overload implementation
- Push/Pull/Legs or Full Body workout splits
- Export to JSON or PDF
- Simple web interface

## Tech Stack

- Node.js
- Express.js
- PDFKit (for PDF generation)
- HTML/CSS/JavaScript (for the frontend)

## Installation

1. Clone this repository:
```
git clone https://github.com/yourusername/workout-generator.git
cd workout-generator
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm start
```

The application will be available at `http://localhost:3000`.

## API Documentation

### Generate Workout Plan

**Endpoint**: `POST /api/generate-workout`

**Request Body**:
```json
{
  "name": "Aarav",
  "age": 35,
  "gender": "male",
  "goal": "muscle_gain",
  "experience": "intermediate",
  "equipment": ["dumbbells", "bench", "resistance_band"],
  "days_per_week": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "Workout plan generated successfully",
  "data": {
    "id": "workout-plan-id",
    "user": {
      "name": "Aarav",
      "age": 35,
      "gender": "male",
      "goal": "muscle_gain",
      "experience": "intermediate",
      "equipment": ["dumbbells", "bench", "resistance_band"]
    },
    "workoutSplit": "upper_lower",
    "sessions": [
      {
        "session": 1,
        "date": "2025-05-13",
        "focus": {
          "primary": "push",
          "secondary": "pull"
        },
        "sections": {
          "warmup": [...],
          "main": [...],
          "cooldown": [...]
        }
      },
      ...
    ]
  }
}
```

### Export Workout Plan

**Endpoint**: `GET /api/export-workout/:id`

**Query Parameters**:
- `format`: "json" (default) or "pdf"

**Response**:
- JSON: Returns the workout plan as JSON
- PDF: Returns the workout plan as a downloadable PDF file

## Web Interface

The application includes a simple web interface that allows users to:
1. Fill out a form with their details
2. Generate a workout plan
3. View the workout plan
4. Export the workout plan as JSON or PDF

## Project Structure

```
workout-generator/
├── package.json
├── server.js
├── src/
│   ├── controllers/
│   │   └── workoutController.js
│   ├── models/
│   │   └── exerciseData.js
│   ├── services/
│   │   └── workoutService.js
│   └── utils/
│       ├── dateUtils.js
│       └── progressionUtils.js
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── tests/
    └── workoutService.test.js
```

## Deployment

Deployment link : [https://fit-mantraa.onrender.com/](https://fit-mantraa.onrender.com/)

