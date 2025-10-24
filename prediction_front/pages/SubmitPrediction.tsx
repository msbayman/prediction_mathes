import React, { useState } from 'react';

interface PredictionFormData {
   user: string;
   match_id: string;
   predicted_home_score: string;
   predicted_away_score: string;
}

interface SubmitResponse {
   message: string;
   error?: string;
}

const SubmitPrediction: React.FC = () => {
   const [formData, setFormData] = useState<PredictionFormData>({
      user: '',
      match_id: '',
      predicted_home_score: '',
      predicted_away_score: ''
   });
   const [message, setMessage] = useState<string>('');
   const [error, setError] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value
      });
   };

   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setLoading(true);
      setMessage('');
      setError('');

      try {
         const response = await fetch('http://localhost:8000/predictions/', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               ...formData,
               user: formData.user.trim(),
               match_id: parseInt(formData.match_id),
               predicted_home_score: parseInt(formData.predicted_home_score),
               predicted_away_score: parseInt(formData.predicted_away_score)
            }),
         });

         const result: SubmitResponse = await response.json();

         if (!response.ok) {
            throw new Error(result.error || 'Failed to submit prediction');
         }

         setMessage(result.message || 'Prediction submitted successfully!');
         setFormData({
            user: '',
            match_id: '',
            predicted_home_score: '',
            predicted_away_score: ''
         });
      } catch (err) {
         setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="page">
         <h1>Submit Prediction</h1>

         <form onSubmit={handleSubmit} className="prediction-form">
            <input
               type="text"
               name="user"
               value={formData.user}
               onChange={handleChange}
               placeholder="Username"
               required
            />
            <input
               type="number"
               name="match_id"
               value={formData.match_id}
               onChange={handleChange}
               placeholder="Match ID"
               required
            />
            <div className="score-inputs">
               <input
                  type="number"
                  name="predicted_home_score"
                  value={formData.predicted_home_score}
                  onChange={handleChange}
                  placeholder="Home Score"
                  required
               />
               <span> - </span>
               <input
                  type="number"
                  name="predicted_away_score"
                  value={formData.predicted_away_score}
                  onChange={handleChange}
                  placeholder="Away Score"
                  required
               />
            </div>
            <button className='cursor-pointer  bg-amber-700 m-10 text-2xl p-5' type="submit" disabled={loading}>
               {loading ? 'Submitting...' : 'Submit Prediction'}
            </button>
         </form>

         {message && <div className="success">{message}</div>}
         {error && <div className="error">{error}</div>}
      </div>
   );
};

export default SubmitPrediction;