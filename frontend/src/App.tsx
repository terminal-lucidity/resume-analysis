import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import OAuthSuccess from './components/auth/OAuthSuccess';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import CompanyTracker from './components/CompanyTracker';
import JobSearch from './components/JobSearch';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingHero />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/tracker" element={<CompanyTracker />} />
          <Route path="/jobs" element={<JobSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;