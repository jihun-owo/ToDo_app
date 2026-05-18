import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext } from '../App';
import { Menu, Home as HomeIcon, Moon, Sun, User, LogIn, LogOut, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const currentMonth = parseInt(month, 10) || new Date().getMonth() + 1;
  const [selectedDate, setSelectedDate] = useState(null);

  const handleMyPageClick = () => {
    if (isLoggedIn) navigate('/mypage');
    else navigate('/login');
  };

  const handlePrevMonth = () => {
    let prevM = currentMonth - 1;
    let prevY = currentYear;
    if (prevM < 1) { prevM = 12; prevY--; }
    navigate(`/calendar/${prevY}/${String(prevM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let nextM = currentMonth + 1;
    let nextY = currentYear;
    if (nextM > 12) { nextM = 1; nextY++; }
    navigate(`/calendar/${nextY}/${String(nextM).padStart(2, '0')}`);
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

  const days = [];
  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  // Next month padding
  const remainingSlots = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <button className="icon-btn" onClick={() => {}}>
            <Menu size={24} />
          </button>
        </div>
        <div className="nav-right">
          <button className="icon-btn" onClick={() => navigate('/')}>
            <HomeIcon size={24} />
          </button>
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          <button className="icon-btn" onClick={handleMyPageClick}>
            <User size={24} />
          </button>
          {isLoggedIn ? (
            <button className="login-btn" style={{ backgroundColor: 'var(--empty-card-bg)', color: 'var(--text-color)' }}>
              <span>사용자 이름</span>
            </button>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              <LogIn size={20} />
              <span>로그인</span>
            </button>
          )}
        </div>
      </nav>

      {/* Calendar Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
        
        {/* Month Selector Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', 
          backgroundColor: '#272635', padding: '0.75rem 1.5rem', 
          borderRadius: '0.5rem', marginBottom: '2rem', color: '#fff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <CalendarIcon size={22} style={{ opacity: 0.6 }} />
          <span style={{ fontSize: '1.25rem', fontWeight: '400', margin: '0 0.5rem' }}>
            {currentYear}년 {currentMonth}월
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}><ChevronLeft size={24} /></button>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}><ChevronRight size={24} /></button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div style={{
          backgroundColor: '#2b2a38', borderRadius: '0.75rem', 
          padding: '3rem 4rem', width: '100%', maxWidth: '800px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ textAlign: 'center', color: '#fff', fontWeight: '400', marginBottom: '4rem', fontSize: '1.2rem', opacity: 0.8, letterSpacing: '0.05em' }}>
            날짜를 선택해주세요
          </h3>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', 
            rowGap: '2rem', columnGap: '1rem', textAlign: 'center', color: '#fff'
          }}>
            {/* Days Header */}
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} style={{ opacity: 0.6, fontSize: '1.1rem', fontWeight: '300' }}>{d}</div>
            ))}

            {/* Days Grid */}
            {days.map((d, i) => {
              const current = d.isCurrentMonth && selectedDate === d.day;
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  height: '40px',
                  width: '40px',
                  margin: '0 auto',
                  fontSize: '1.1rem',
                  opacity: d.isCurrentMonth ? 0.9 : 0.2,
                  color: current ? '#882BCF' : '#fff',
                  border: current ? '1px solid #882BCF' : '1px solid transparent',
                  borderRadius: '0.3rem',
                  cursor: d.isCurrentMonth ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
                onClick={() => {
                  if (d.isCurrentMonth) {
                    setSelectedDate(prev => prev === d.day ? null : d.day);
                  }
                }}
                onMouseOver={(e) => {
                  if(d.isCurrentMonth && !current) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if(d.isCurrentMonth && !current) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                >
                  {d.day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Temporary UI for Date Selection */}
        {selectedDate && (
          <div className="animate-fade-in" style={{
            marginTop: '2rem', padding: '1.5rem', backgroundColor: '#2b2a38',
            borderRadius: '0.75rem', width: '100%', maxWidth: '800px',
            textAlign: 'center', color: '#fff', border: '1px solid #882BCF',
            boxShadow: '0 4px 20px rgba(136, 43, 207, 0.15)'
          }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              선택하신 <strong>{currentYear}년 {currentMonth}월 {selectedDate}일</strong>의 일과 추가 기능은<br/> 
              추후 업데이트를 통해 제공될 예정입니다! 🚀
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Calendar;
