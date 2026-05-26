import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Pages (to be created)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import Calendar from './pages/Calendar';

// Contexts
export const ThemeContext = createContext();
export const AuthContext = createContext();
export const AppContext = createContext();

function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedInState] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const setIsLoggedIn = (value) => {
    setIsLoggedInState(value);
    localStorage.setItem('isLoggedIn', value);
  };

  const [userName, setUserName] = useState(() => localStorage.getItem('userId') || '사용자');
  const [recentCalendars, setRecentCalendars] = useState(() => {
    try {
      const saved = localStorage.getItem('recentCalendars');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const addRecentCalendar = (year, month) => {
    setRecentCalendars(prev => {
      const filtered = prev.filter(c => c.year !== year || c.month !== month);
      const updated = [{ year, month, type: 'filled' }, ...filtered].slice(0, 5);
      localStorage.setItem('recentCalendars', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider value={{ userName, setUserName, recentCalendars, addRecentCalendar }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/calendar/:year/:month" element={<Calendar />} />
            </Routes>
          </BrowserRouter>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
