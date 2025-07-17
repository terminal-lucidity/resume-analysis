import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import LandingHero from './components/LandingHero';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingHero />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/features" element={<div>Features Page (Coming Soon)</div>} />
            <Route path="/pricing" element={<div>Pricing Page (Coming Soon)</div>} />
            <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
            <Route path="/contact" element={<div>Contact Page (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;