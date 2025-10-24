import React, { useState, useEffect } from 'react';
import type { Match } from '../types/api';

const Matches: React.FC = () => {
   const [matches, setMatches] = useState<Match[]>([]);
   const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string>('');
   const [selectedDate, setSelectedDate] = useState<string>('');

   useEffect(() => {
      const fetchMatches = async (): Promise<void> => {
         try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/matches/');

            if (!response.ok) {
               throw new Error('Failed to fetch matches');
            }

            const data: Match[] = await response.json();
            setMatches(data);
            setFilteredMatches(data);
         } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
         } finally {
            setLoading(false);
         }
      };

      fetchMatches();
   }, []);

   useEffect(() => {
      if (!selectedDate) {
         setFilteredMatches(matches);
      } else {
         const filtered = matches.filter(match => match.date === selectedDate);
         setFilteredMatches(filtered);
      }
   }, [selectedDate, matches]);

   const uniqueDates = Array.from(new Set(matches.map(match => match.date).filter(Boolean))).sort();

   if (loading) return (
      <div className="flex justify-center items-center min-h-64">
         <div className="text-lg text-blue-600">Loading matches...</div>
      </div>
   );

   if (error) return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
         {error}
      </div>
   );

   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold text-gray-800 mb-8">Matches & Results</h1>

         <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
               <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by Date:
               </label>
               <select
                  id="date-filter"
                  value={selectedDate}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDate(e.target.value)}
                  className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                  <option value="">All Dates</option>
                  {uniqueDates.map(date => (
                     <option key={date} value={date}>
                        {date}
                     </option>
                  ))}
               </select>
               <span className="text-sm text-gray-600 whitespace-nowrap">
                  Showing {filteredMatches.length} of {matches.length} matches
               </span>
            </div>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.length > 0 ? (
               filteredMatches.map(match => (
                  <div key={match.id} className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
                     <div className="p-6">
                        {match.date && (
                           <div className="text-sm font-semibold text-gray-600 mb-3">
                              {match.date}
                           </div>
                        )}

                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">{match.home_team}</span>
                              <span className="text-lg font-bold text-gray-700">{match.home_score}</span>
                           </div>

                           <div className="text-center text-sm text-gray-500">vs</div>

                           <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">{match.away_team}</span>
                              <span className="text-lg font-bold text-gray-700">{match.away_score}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No matches found</div>
                  {selectedDate && (
                     <p className="text-gray-400">for {selectedDate}</p>
                  )}
               </div>
            )}
         </div>
      </div>
   );
};

export default Matches;