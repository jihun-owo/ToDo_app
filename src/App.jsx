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

function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedInState] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const setIsLoggedIn = (value) => {
    setIsLoggedInState(value);
    localStorage.setItem('isLoggedIn', value);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
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
  );
}

export default App;
