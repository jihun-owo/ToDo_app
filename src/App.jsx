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
  const [currentUserId, setCurrentUserIdState] = useState(() => localStorage.getItem('currentUserId') || null);
  const [isLoggedIn, setIsLoggedInState] = useState(() => !!localStorage.getItem('currentUserId'));

  const setCurrentUserId = (id) => {
    setCurrentUserIdState(id);
    if (id) {
      localStorage.setItem('currentUserId', id);
      setIsLoggedInState(true);
    } else {
      localStorage.removeItem('currentUserId');
      setIsLoggedInState(false);
    }
  };

  const setIsLoggedIn = (value) => {
    if (!value) {
      setCurrentUserId(null);
    }
  };

  const [userName, setUserName] = useState(() => localStorage.getItem('currentUserId') || '사용자');
  const [recentCalendars, setRecentCalendars] = useState([]);
  const [dayData, setDayData] = useState({});
  const [aiUsageData, setAiUsageData] = useState({ count: 0, resetTime: null });

  useEffect(() => {
    if (currentUserId) {
      try {
        const storedData = localStorage.getItem(`userData_${currentUserId}`);
        if (storedData) {
          const json = JSON.parse(storedData);
          setRecentCalendars(json.recentCalendars || []);
          setDayData(json.dayData || {});
          setAiUsageData(json.aiUsageData || { count: 0, resetTime: null });
        } else {
          setRecentCalendars([]);
          setDayData({});
          setAiUsageData({ count: 0, resetTime: null });
        }
        setUserName(currentUserId);
      } catch (e) {
        console.error('Failed to load data', e);
        setRecentCalendars([]);
      }
    } else {
      setRecentCalendars([]);
      setDayData({});
      setAiUsageData({ count: 0, resetTime: null });
      setUserName('사용자');
    }
  }, [currentUserId]);

  const saveDataToServer = (newRecent, newDay, newAi) => {
    if (!currentUserId) return;
    try {
      const dataToSave = {
        recentCalendars: newRecent || recentCalendars,
        dayData: newDay || dayData,
        aiUsageData: newAi || aiUsageData
      };
      localStorage.setItem(`userData_${currentUserId}`, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const addRecentCalendar = (year, month) => {
    if (!currentUserId) return;
    setRecentCalendars(prev => {
      const filtered = prev.filter(c => c.year !== year || c.month !== month);
      const updated = [{ year, month, type: 'filled' }, ...filtered].slice(0, 6);
      saveDataToServer(updated, dayData, aiUsageData);
      return updated;
    });
  };

  const removeRecentCalendar = (year, month) => {
    if (!currentUserId) return;
    setRecentCalendars(prev => {
      const filtered = prev.filter(c => c.year !== year || c.month !== month);
      saveDataToServer(filtered, dayData, aiUsageData);
      return filtered;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider value={{ userName, setUserName, recentCalendars, addRecentCalendar, removeRecentCalendar, currentUserId, setCurrentUserId, dayData, setDayData, aiUsageData, setAiUsageData, saveDataToServer }}>
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
