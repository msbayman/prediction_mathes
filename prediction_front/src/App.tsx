import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Leaderboard from '../pages/Leaderboard';
import Matches from '../pages/Matches';
import Predictions from '../pages/Predictions';
import SubmitPrediction from '../pages/SubmitPrediction';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/submit-prediction" element={<SubmitPrediction />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;