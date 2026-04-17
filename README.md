# 🏠 House Price Predictor — React + Flask

Full-stack web app to predict house prices in the Kharar / Mohali area.
Gradient Boosting model with **R² = 0.83**.

---

## Project Structure

```
house_price_app/
│
├── flask_backend/
│   ├── app.py               ← Flask API server
│   ├── model.pkl            ← Trained ML model (ready to use)
│   └── requirements.txt     ← Python dependencies
│
└── react_frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css         ← global CSS variables & dark theme
        ├── App.js
        ├── constants/
        │   └── options.js    ← dropdown options (locations, societies…)
        ├── services/
        │   └── api.js        ← fetch calls to Flask API
        ├── hooks/
        │   └── usePredictor.js  ← form state + submit + validation
        ├── components/
        │   ├── Counter/         ← +/− widget for BHK, bath, balcony
        │   ├── SelectField/     ← reusable dropdown
        │   ├── InputField/      ← reusable text/number input
        │   └── ResultCard/      ← displays predicted price
        └── pages/
            └── PredictorPage/   ← main page, ties everything together
```

---

## Setup & Run

### Step 1 — Start the Flask backend

```bash
cd flask_backend
pip install -r requirements.txt
python app.py
```

Flask will run at **http://127.0.0.1:5000**

### Step 2 — Start the React frontend

Open a **second terminal**:

```bash
cd react_frontend
npm install
npm start
```

React will run at **http://localhost:3000**

> The `"proxy": "http://127.0.0.1:5000"` in `package.json` forwards all
> `/api/*` calls from React to Flask automatically — no CORS setup needed.

---

## API Endpoints (Flask)

| Method | Endpoint       | Description                        |
|--------|----------------|------------------------------------|
| GET    | /api/health    | Health check — returns model info  |
| GET    | /api/options   | Returns all dropdown options       |
| POST   | /api/predict   | Accepts JSON, returns price        |

### Example POST /api/predict

**Request body (JSON):**
```json
{
  "location":     "Sunny Enclave",
  "society":      "Royal Villas",
  "area_type":    "Super built-up Area",
  "availability": "Ready To Move",
  "total_sqft":   1500,
  "bhk":          3,
  "bath":         2,
  "balcony":      1
}
```

**Response:**
```json
{
  "success": true,
  "price": 94.72
}
```

---

## Model Info

| Property       | Value                      |
|----------------|----------------------------|
| Algorithm      | Gradient Boosting Regressor |
| R² (test set)  | 0.94                       |
| Training rows  | ~78,000                    |
| Key features   | location, sqft, bhk, bath, society, area_type |

---

## Build for Production

```bash
cd react_frontend
npm run build
```

Copy the `build/` folder to your server or deploy to Netlify / Vercel.
Deploy Flask to Render.com or Railway.app.
