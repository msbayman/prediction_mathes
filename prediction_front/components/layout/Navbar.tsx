import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import './Navbar.css';

const Navbar: React.FC = () => {
   const location = useLocation();

   return (
      <nav className="navbar w-full ">
         <div className="nav-brand text-4xl">Football Predictions</div>
         <ul className="nav-links m-10 flex flex-row text-3xl justify-between">
            <li>
               <Link
                  to="/"
                  className={location.pathname === '/' ? 'active' : ''}
               >
                  Leaderboard
               </Link>
            </li>
            <li>
               <Link
                  to="/matches"
                  className={location.pathname === '/matches' ? 'active' : ''}
               >
                  Matches
               </Link>
            </li>
            <li>
               <Link
                  to="/predictions"
                  className={location.pathname === '/predictions' ? 'active' : ''}
               >
                  My Predictions
               </Link>
            </li>
            <li>
               <Link
                  to="/submit-prediction"
                  className={location.pathname === '/submit-prediction' ? 'active' : ''}
               >
                  Submit Prediction
               </Link>
            </li>
         </ul>
      </nav>
   );
};

export default Navbar;