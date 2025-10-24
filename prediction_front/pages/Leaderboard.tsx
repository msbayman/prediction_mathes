import React, { useState, useEffect } from 'react';


const Leaderboard: React.FC = () => {
   const [leaderboard, setLeaderboard] = useState<[string, number][]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string>('');

   useEffect(() => {
      const fetchLeaderboard = async (): Promise<void> => {
         try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/leaderboard/');

            if (!response.ok) {
               throw new Error('Failed to fetch leaderboard');
            }

            const data: [string, number][] = await response.json();
            setLeaderboard(data);
         } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
         } finally {
            setLoading(false);
         }
      };

      fetchLeaderboard();
   }, []);

   if (loading) return <div className="loading">Loading leaderboard...</div>;
   if (error) return <div className="error">{error}</div>;

   return (
      <div className="flex flex-col items-center page">
         <h1 className='text-3xl mb-10'>Leaderboard</h1>
         <div className="leaderboard">
            <table>
               <thead>
                  <tr>
                     <th>Rank</th>
                     <th>User</th>
                     <th>Points</th>
                  </tr>
               </thead>
               <tbody>
                  {leaderboard.map(([user, points], index) => (
                     <tr key={user}>
                        <td>{index + 1}</td>
                        <td>{user}</td>
                        <td>{points}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default Leaderboard;