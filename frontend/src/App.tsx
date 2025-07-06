import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="font-sans bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <Navbar toggleTheme={() => setDarkMode(!darkMode)} />
      <LandingHero />
    </div>
  );
}

export default App;
