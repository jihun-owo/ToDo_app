import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext, AppContext } from '../App';
import { Menu, Home as HomeIcon, Moon, Sun, User, LogIn, LogOut, Calendar, ArrowDown, X } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { userName, recentCalendars } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleMyPageClick = () => {
    if (isLoggedIn) {
      navigate('/mypage');
    } else {
      navigate('/login');
    }
  };

  const handleCalendarCreate = () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true);
      return;
    }
    const date = new Date();
    navigate(`/calendar/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  // Pad the recentCalendars array to always have 6 elements for the UI
  const paddedCalendars = [...recentCalendars];
  while (paddedCalendars.length < 6) {
    paddedCalendars.push({ type: 'empty' });
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="nav-right">
          <button className="icon-btn" onClick={() => window.location.reload()}>
            <HomeIcon size={24} />
          </button>
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          <button className="icon-btn" onClick={handleMyPageClick}>
            <User size={24} />
          </button>
          {isLoggedIn ? (
            <button className="login-btn" onClick={handleMyPageClick} style={{ backgroundColor: 'var(--empty-card-bg)', color: 'var(--text-color)' }}>
              <span>{userName}</span>
            </button>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              <LogIn size={20} />
              <span>로그인</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <section className="hero-section">
          <p className="hero-text">눌러서 하루 일과 정리하기</p>
          <ArrowDown size={32} style={{ color: 'var(--text-color)', opacity: 0.7 }} />
          <button className="create-btn" onClick={handleCalendarCreate}>
            <Calendar size={48} strokeWidth={1.5} />
          </button>
        </section>

        <section className="recent-section">
          <h2 className="recent-title">최근에 사용한 달력</h2>
          <div className="cards-container">
            {paddedCalendars.map((card, idx) => (
              card.type === 'filled' ? (
                <div
                  key={idx}
                  className="card filled"
                  onClick={() => navigate(`/calendar/${card.year}/${String(card.month).padStart(2, '0')}`)}
                >
                  <span className="card-year">{card.year}년</span>
                  <span className="card-month">{card.month}월</span>
                </div>
              ) : (
                <div
                  key={idx}
                  className="card empty"
                  onClick={handleCalendarCreate}
                >
                  <span className="empty-text">아직 만들지<br />않았습니다.</span>
                  <span className="create-text">만들러 가기</span>
                  <Calendar size={28} style={{ marginTop: '0.5rem', opacity: 0.8 }} />
                </div>
              )
            ))}
          </div>
        </section>
      </main>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn close-sidebar" onClick={() => setIsSidebarOpen(false)}>
              <X size={28} />
            </button>
            <div style={{ padding: '1rem' }}>
              <h2>메뉴</h2>
              <ul style={{ marginTop: '2rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={() => { setIsSidebarOpen(false); navigate('/'); }}>홈</li>
                <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={() => { setIsSidebarOpen(false); handleCalendarCreate(); }}>캘린더</li>
              </ul>
              <h2 style={{ marginTop: '2rem' }}>사용자 설정</h2>
              <ul style={{ marginTop: '1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={toggleTheme}>
                  <span>다크모드</span>
                  <span>{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</span>
                </li>
                {isLoggedIn && (
                  <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', color: '#ef4444' }} onClick={() => { setIsLoggedIn(false); setIsSidebarOpen(false); }}>
                    로그아웃
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Popup */}
      {showLoginPopup && (
        <div className="modal-overlay animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#1E1E24', width: '90%', maxWidth: '400px',
            padding: '2rem', borderRadius: '1rem', display: 'flex',
            flexDirection: 'column', alignItems: 'center', color: '#fff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', textAlign: 'center', gap: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '500' }}>로그인이 필요합니다</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.5' }}>서비스를 이용하려면<br />먼저 로그인을 해주세요.</p>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button onClick={() => setShowLoginPopup(false)} style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#363644',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '500'
              }}>취소</button>
              <button onClick={() => { setShowLoginPopup(false); navigate('/login'); }} style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#A855F7',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '500'
              }}>로그인 하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
