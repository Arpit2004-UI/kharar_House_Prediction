import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PredictorPage from './pages/PredictorPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PredictorPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
