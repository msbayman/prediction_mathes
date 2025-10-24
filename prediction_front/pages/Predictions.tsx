import React, { useState } from 'react';
import type { Prediction, ApiError } from '../types/api';


const Predictions: React.FC = () => {
   const [username, setUsername] = useState<string>('');
   const [predictions, setPredictions] = useState<Prediction[]>([]);
   const [loading, setLoading] = useState<boolean>(false);
   const [error, setError] = useState<string>('');

   const fetchPredictions = async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!username.trim()) return;

      try {
         setLoading(true);
         setError('');
         const response = await fetch(`http://localhost:8000/predictions/${username}/`);

         if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(errorData.error || errorData.message || 'Failed to fetch predictions');
         }

         const data: Prediction[] = await response.json();
         setPredictions(data);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred');
         setPredictions([]);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="page">
         <h1>My Predictions</h1>

         <form onSubmit={fetchPredictions} className="search-form">
            <input
               type="text"
               value={username}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
               placeholder="Enter your username"
               required
            />
            <button className='cursor-pointer bg-amber-700 m-10 text-2xl p-5' type="submit" disabled={loading}>
               {loading ? 'Loading...' : 'Get Predictions'}
            </button>
         </form>

         {error && <div className="error">{error}</div>}

         {predictions.length > 0 && (
            <div className="predictions">
               <h2>Your Predictions</h2>
               {predictions.map(prediction => (
                  <div key={`${prediction.user}-${prediction.match_id}`} className="prediction-card">
                     <p><strong>Match ID:</strong> {prediction.match_id}</p>
                     <p><strong>Prediction:</strong> {prediction.predicted_home_score} - {prediction.predicted_away_score}</p>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default Predictions;