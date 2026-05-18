# Eco-Sentinel 🌍🛡️

An AI Environmental Forensics Agent that detects pollution spikes in real-time, traces sources using wind vectors & satellite data, and generates actionable advisories.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)

### 1. Backend Setup (FastAPI)

The backend provides the AI analysis and live pollution data.

```bash
# Navigate to the project root
cd eco-sentinel

# Install Python dependencies
pip install -r backend/requirements.txt

# Start the API Server
# Note: Ensure no other uvicorn instances are running
uvicorn backend.api_server:app --reload --port 8000
```
*Backend runs on: `http://localhost:8000`*

### 2. Frontend Setup (Next.js)

The frontend is the interactive dashboard.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*Frontend runs on: `http://localhost:7475`*

## 🏗️ Architecture

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts, React-Globe.gl.
- **Backend**: FastAPI (Python), Uvicorn.
- **AI Engine**: Groq (Llama 3.1) for instant environmental analysis.
- **Data**: OpenStreetMap (Geocoding), OpenAQ (Air Quality - simulated).

## 🔑 Environment Variables

Create a `.env` file in `backend/` if needed (e.g., for API keys), though the current version may handle keys directly or via system env.

## 🛠️ API Endpoints

- `GET /api/live?zone={city}`: Get real-time pollution data & AI advisory for a specific city.
- `POST /api/analyze`: (Internal) Trigger AI analysis manually.

## ⚠️ Troubleshooting

- **Port in Use**: If `npm run dev` fails with `EADDRINUSE`, ensure port `7475` is free.
- **Backend Conflict**: If `uvicorn` fails, check if another instance is running on port `8000`. Kill the process and try again.
