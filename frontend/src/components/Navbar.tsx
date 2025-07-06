import { useState } from "react";
import { Menu, X, User, Sun, Moon } from "lucide-react";

function Navbar({ toggleTheme }: { toggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 dark:text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Vettly</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-gray-700 dark:text-white">
            <Sun className="hidden dark:inline-block" size={20} />
            <Moon className="inline-block dark:hidden" size={20} />
          </button>
          <User className="text-gray-800 dark:text-white" size={22} />
        </div>
      </header>

      {/* Slide Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg p-6 z-50 transform transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="space-y-4 text-gray-700 dark:text-gray-200 font-medium">
          <li>Home</li>
          <li>How It Works</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;