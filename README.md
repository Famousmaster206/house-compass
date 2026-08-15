# house-compass

A comprehensive housing affordability calculator and comparison tool that helps users understand their financial situation across different cities. House Compass combines personalized financial calculations with AI-powered insights to guide housing decisions.

## Features

### 🏠 Core Calculator
- **Personalized Affordability Analysis**: Calculate monthly expenses and leftover income based on your personal situation
- **Multi-City Comparison**: Compare affordability across different cities with interactive charts
- **Flexible Input Options**:
  - Monthly net income
  - Household size and roommates
  - Housing preferences (bedrooms, custom rent)
  - Transportation (car ownership, monthly payments)
  - Dining and lifestyle budgets

### 📊 Results & Insights
- **Affordability Ratings**: Visual badges showing comfort level (Comfortable, Moderate, Tight, Difficult)
- **Expense Breakdown**: Interactive pie charts showing where your money goes
- **What-If Scenarios**: Adjust variables and see real-time impact on affordability
- **AI-Powered Overview** ✨: Get personalized financial insights powered by Google Gemini
  - Financial assessment and recommendations
  - Expense analysis and optimization tips
  - Actionable budget suggestions

### 🌍 City Exploration
- **City Cards**: Browse cities with affordability ratings and key metrics
- **Detailed City Pages**: Deep dive into specific cities with cost-of-living data
- **Comparison Tools**: Multi-select cities to compare side-by-side

### 🛠️ Additional Tools
- **Net Spending Calculator**: Calculate `Net Spending = Total Spending - (Housing Cost + External Costs)`
  - Choose between rent or house purchase costs
  - Support for monthly or yearly calculations
  - Detailed expense ratio breakdowns

## Tech Stack

### Frontend
- **Framework**: Next.js 15+ with TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts for visualizations
- **Animations**: Custom Framer Motion effects
- **Auth**: Firebase Authentication (ready to use)
- **Database**: Firestore (configured)
- **Icons**: Lucide React

### Backend
- **Framework**: Flask with CORS enabled
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Environment**: Python 3.x with python-dotenv

## Project Structure

```
house-compass/
├── backend/
│   ├── app.py                 # Flask app with all API endpoints
│   ├── engine.py              # (Ready for algorithm implementation)
│   ├── mock_data.json         # Sample property data
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages (routing)
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── calculate/     # Calculator page
│   │   │   ├── results/       # Results display
│   │   │   ├── cities/        # City explorer
│   │   │   ├── compare/       # City comparison
│   │   │   ├── what-if/       # What-if scenarios
│   │   │   ├── about/         # About page
│   │   │   ├── auth/          # Auth pages (login/signup)
│   │   │   └── account/       # Account settings
│   │   ├── components/        # Reusable React components
│   │   │   ├── results/       # Results components (ResultsView, AiOverview)
│   │   │   ├── charts/        # Chart components
│   │   │   ├── cities/        # City-related components
│   │   │   ├── effects/       # Visual effects (parallax, scroll reveal, etc.)
│   │   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   │   └── ui/            # Base UI components (Button, Card, Input, etc.)
│   │   ├── lib/
│   │   │   ├── api/           # API client and server communication
│   │   │   ├── services/      # Business logic (calculator, taxes, housing, etc.)
│   │   │   ├── config/        # Configuration (affordability ratings)
│   │   │   ├── data/          # Static data (cities, costs)
│   │   │   ├── firebase/      # Firebase setup (auth, firestore)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── utils/         # Utility functions (formatting, etc.)
│   │   └── app/styles/        # Global styles
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── README.md
├── LICENSE
└── vercel.json                # Vercel deployment config
```

## API Endpoints

### Backend Endpoints (Flask)

#### `GET /api/ping`
Health check endpoint.

**Response:**
```json
{ "status": "Backend is running!" }
```

---

#### `POST /api/recommendations`
Get property recommendations based on user preferences.

**Request:**
```json
{
  "userPreferences": { /* preference object */ }
}
```

**Response:**
```json
[ /* array of properties */ ]
```

---

#### `POST /api/ai-overview`
Generate an AI-powered overview of housing affordability using Google Gemini.

**Request:**
```json
{
  "cityName": "string",
  "monthlyIncome": number,
  "expenses": {
    "housing": number,
    "utilities": number,
    "transportation": number,
    "groceries": number,
    "dining": number,
    "lifestyle": number,
    "total": number
  },
  "leftover": number,
  "affordabilityRating": "string",
  "householdSize": number,
  "roommates": number,
  "hasCar": boolean,
  "bedrooms": number
}
```

**Response:**
```json
{
  "success": true,
  "overview": "string (AI-generated insights)"
}
```

---

#### `POST /api/calculate-net-spending`
Calculate net spending using the formula: `Net Spending = Total Spending - (Housing Cost + External Costs)`

**Request:**
```json
{
  "totalSpending": number,
  "housingType": "rent" | "purchase",
  "housingCost": number,
  "externalCosts": number,
  "timePeriod": "monthly" | "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "calculation": {
    "timePeriod": "monthly",
    "housingType": "rent",
    "totalSpending": number,
    "housingCost": number,
    "externalCosts": number,
    "totalDeductions": number,
    "netSpending": number,
    "spendingRatio": {
      "housingPercentage": number,
      "externalPercentage": number,
      "netPercentage": number
    }
  }
}
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- Google Gemini API key (for AI features)
- Firebase project (for auth, optional)

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
# ... other Firebase config
```

Run development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
```

Run Flask app:
```bash
python app.py
```

Backend will run at `http://localhost:5000`

## Frontend Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Explained

### Housing Affordability Calculator
Users input their financial situation and the calculator determines:
- Monthly expenses across all categories
- Estimated leftover after expenses
- Affordability rating (Comfortable → Moderate → Tight → Difficult)

### AI Overview
After seeing results, users can generate an AI-powered overview that provides:
- Overall financial assessment
- Expense distribution insights
- Actionable budget recommendations
- Personalized encouragement and context

### What-If Scenarios
Experiment with different variables to see how changes affect affordability:
- Adjust number of roommates
- Change car ownership
- Modify dining budget
- Update household size

### Net Spending Calculator
A specialized calculation tool that helps determine actual disposable income:
- Supports both rent and house purchase scenarios
- Monthly or yearly time periods
- Provides expense ratio breakdowns

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=your_backend_url
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Backend (`.env`)
```
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

Frontend is configured for Vercel with `vercel.json`

### Backend (Railway, Heroku, or own server)
```bash
pip install -r requirements.txt
python app.py
```

Update `NEXT_PUBLIC_API_BASE_URL` to point to your backend URL.

## Future Enhancements

- [ ] User accounts and saved calculations
- [ ] Advanced filtering and sorting in city explorer
- [ ] Historical price trends
- [ ] Integration with real estate APIs
- [ ] Custom cost-of-living data updates
- [ ] Mobile app version
- [ ] Email report generation
- [ ] Roommate finder integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue in the repository.

