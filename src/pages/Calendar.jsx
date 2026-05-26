import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext, AppContext } from '../App';
import { Menu, Home as HomeIcon, Moon, Sun, User, LogIn, LogOut, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2, ChevronDown, ChevronUp, RefreshCw, Plus, Trash2, X } from 'lucide-react';

const Calendar = () => {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { userName, addRecentCalendar } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const currentMonth = parseInt(month, 10) || new Date().getMonth() + 1;
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [isEditingAiSummary, setIsEditingAiSummary] = useState(false);
  const [routineForm, setRoutineForm] = useState({ time: '', content: '' });
  const [dayData, setDayData] = useState(() => {
    try {
      const saved = localStorage.getItem('dayData');
      return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
  });

  const dateKey = selectedDate ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null;
  const currentDayData = dateKey ? (dayData[dateKey] || { title: '', color: '#ffffff', routines: [], aiSummary: '' }) : null;

  const updateCurrentDayData = (updates) => {
    setDayData(prev => {
      const updated = {
        ...prev,
        [dateKey]: { ...(prev[dateKey] || { title: '', color: '#ffffff', routines: [], aiSummary: '' }), ...updates }
      };
      localStorage.setItem('dayData', JSON.stringify(updated));
      return updated;
    });
  };

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

  const handleCloseModal = () => {
    setSelectedDate(null);
    setIsAddingRoutine(false);
    setIsAiSummaryOpen(false);
    setIsEditingAiSummary(false);
    setRoutineForm({ time: '', content: '' });
  };

  const handleAddRoutineSubmit = () => {
    if (routineForm.time && routineForm.content) {
      const newRoutines = [...(currentDayData.routines), { id: Date.now(), time: routineForm.time, content: routineForm.content }];
      updateCurrentDayData({ routines: newRoutines });
      setRoutineForm({ ...routineForm, content: '' });
      addRecentCalendar(currentYear, currentMonth);
    }
  };

  const handleGenerateAiSummary = () => {
    const routineTexts = currentDayData?.routines.map(r => r.content).join(", ");
    const fakeSummary = routineTexts 
      ? `AI가 일상에 핵심 요약을 해줍니다 (3줄 이상)\n\n오늘의 핵심 일정: ${routineTexts}\n잘 마무리하시길 바랍니다!`
      : "일과를 먼저 추가해 주시면 요약해 드립니다.";
    updateCurrentDayData({ aiSummary: fakeSummary });
    setIsAiSummaryOpen(true);
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
          <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
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
              const dKey = d.isCurrentMonth ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : null;
              const dColor = dKey && dayData[dKey]?.color && dayData[dKey].color !== '#ffffff' ? dayData[dKey].color : (current ? '#882BCF' : '#fff');
              
              return (
                <div key={i} title={dKey && dayData[dKey]?.title ? dayData[dKey].title : ""} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  height: '40px',
                  width: '40px',
                  margin: '0 auto',
                  fontSize: '1.1rem',
                  opacity: d.isCurrentMonth ? 0.9 : 0.2,
                  color: d.isCurrentMonth ? dColor : '#fff',
                  border: current ? `1px solid ${dColor}` : '1px solid transparent',
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

        {/* Date Detail Modal */}
        {selectedDate && (
          <div className="modal-overlay animate-fade-in" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="modal-content" style={{
              backgroundColor: '#1E1E24', width: '90%', maxWidth: '1000px',
              height: '85vh', borderRadius: '1rem', display: 'flex',
              flexDirection: 'column', overflow: 'hidden', color: '#fff',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={handleCloseModal} style={{
                  backgroundColor: '#fff', color: '#000', border: 'none',
                  padding: '0.6rem 1.2rem', borderRadius: '2rem', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.9rem'
                }}>
                  달력으로 돌아가기
                </button>
                
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.6rem 1.2rem',
                  borderRadius: '0.5rem', color: '#B388FF'
                }}>
                  <CalendarIcon size={20} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{currentYear}년 {currentMonth}월 {selectedDate}일</span>
                </div>
                
                <button onClick={() => setIsAddingRoutine(!isAddingRoutine)} style={{
                  backgroundColor: isAddingRoutine ? '#4b4b60' : '#A855F7', color: '#fff', border: 'none',
                  padding: '0.6rem 1.2rem', borderRadius: '2rem', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.9rem'
                }}>
                  {isAddingRoutine ? '이전으로' : '일과를 추가하기'}
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                <div style={{
                  backgroundColor: '#2A2A35', borderRadius: '1rem', padding: '2rem',
                  display: 'flex', flexDirection: 'column', gap: '1.5rem'
                }}>
                  {/* Title Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#363644', padding: '1rem', borderRadius: '0.5rem' }}>
                    <CalendarIcon size={24} style={{ opacity: 0.7, color: currentDayData.color !== '#ffffff' ? currentDayData.color : 'inherit' }} />
                    <input 
                      type="text" 
                      placeholder="제목을 적어주세요." 
                      value={currentDayData.title}
                      onChange={(e) => updateCurrentDayData({ title: e.target.value })}
                      style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.1rem', flex: 1, outline: 'none' }}
                    />
                  </div>

                  {!isAddingRoutine ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#363644', padding: '1rem', borderRadius: '0.5rem' }}>
                        <span style={{ opacity: 0.8 }}>연필을 눌러 날짜 색을 변경할 수 있습니다</span>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Edit2 size={20} style={{ opacity: 0.8 }} />
                          <input 
                            type="color" 
                            value={currentDayData.color} 
                            onChange={(e) => updateCurrentDayData({ color: e.target.value })} 
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} 
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#363644', padding: '1.5rem', borderRadius: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{currentYear}년 {String(currentMonth).padStart(2, '0')}월 {String(selectedDate).padStart(2, '0')}일</div>
                          <div style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>시간</div>
                          <input type="time" value={routineForm.time} onChange={(e) => setRoutineForm({...routineForm, time: e.target.value})} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#2A2A35', border: '1px solid #444', borderRadius: '0.5rem', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                        </div>
                        <div>
                          <div style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>일과 내용</div>
                          <textarea 
                            placeholder="일과를 적어주세요. (Enter : 기록 추가 / Shift + Enter : 줄 바꿈)" 
                            value={routineForm.content} 
                            onChange={(e) => setRoutineForm({...routineForm, content: e.target.value})} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddRoutineSubmit();
                              }
                            }}
                            rows={4} 
                            style={{ width: '100%', padding: '0.8rem', backgroundColor: '#2A2A35', border: '1px solid #444', borderRadius: '0.5rem', color: '#fff', outline: 'none', resize: 'vertical' }} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={handleGenerateAiSummary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: '1px solid #A855F7', color: '#A855F7', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>✨ AI로 일상 요약하기</button>
                          <button onClick={handleAddRoutineSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: '1px solid #4ade80', color: '#4ade80', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}><Plus size={18} /> 기록 추가</button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* AI Summary Accordion */}
                  <div style={{ backgroundColor: '#363644', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', cursor: 'pointer' }} onClick={() => setIsAiSummaryOpen(!isAiSummaryOpen)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FCD34D' }}>
                        <span>✨ AI 요약</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
                        <div onClick={(e) => { e.stopPropagation(); setIsEditingAiSummary(!isEditingAiSummary); }} style={{ cursor: 'pointer', color: isEditingAiSummary ? '#A855F7' : 'inherit' }}>
                          <Edit2 size={20} />
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); handleGenerateAiSummary(); }} style={{ cursor: 'pointer' }}>
                          <RefreshCw size={20} />
                        </div>
                        {isAiSummaryOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                    {isAiSummaryOpen && (
                      <div style={{ padding: '0 1rem 1rem 1rem' }}>
                        <textarea 
                          readOnly={!isEditingAiSummary}
                          value={currentDayData.aiSummary} 
                          onChange={(e) => updateCurrentDayData({ aiSummary: e.target.value })}
                          placeholder="AI 요약이 여기에 표시됩니다..."
                          style={{ width: '100%', minHeight: '80px', backgroundColor: '#22212E', border: isEditingAiSummary ? '1px solid #A855F7' : 'none', borderRadius: '0.5rem', padding: '1rem', color: '#fff', outline: 'none', resize: 'vertical', cursor: isEditingAiSummary ? 'text' : 'default' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Added Routines List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {currentDayData.routines.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#363644', padding: '1rem', borderRadius: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4b4b60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', opacity: 0.7 }}>--:--</div>
                        <span style={{ opacity: 0.7 }}>일과를 추가하여 할 일을 작성하기</span>
                      </div>
                    ) : (
                      [...currentDayData.routines].sort((a, b) => a.time.localeCompare(b.time)).map(routine => (
                        <div key={routine.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#363644', padding: '0.75rem', borderRadius: '2rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#5c5c77', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>{routine.time}</div>
                          <span style={{ opacity: 0.9, flex: 1, whiteSpace: 'pre-wrap' }}>{routine.content}</span>
                          <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.7 }}>
                            <Edit2 size={18} style={{ cursor: 'pointer' }} onClick={() => {
                              setRoutineForm({ time: routine.time, content: routine.content });
                              updateCurrentDayData({ routines: currentDayData.routines.filter(r => r.id !== routine.id) });
                              setIsAddingRoutine(true);
                            }} />
                            <Trash2 size={18} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => {
                              updateCurrentDayData({ routines: currentDayData.routines.filter(r => r.id !== routine.id) });
                            }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay animate-fade-in" onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '250px', backgroundColor: 'var(--bg-color)', borderRight: '1px solid var(--border-color)', animation: 'slideRight 0.3s' }}>
            <button className="icon-btn close-sidebar" onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <div style={{ padding: '1rem' }}>
              <h2 style={{ color: 'var(--text-color)' }}>메뉴</h2>
              <ul style={{ marginTop: '2rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-color)' }}>
                <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={() => { setIsSidebarOpen(false); navigate('/'); }}>홈</li>
                <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={() => setIsSidebarOpen(false)}>캘린더</li>
              </ul>
              <h2 style={{ color: 'var(--text-color)', marginTop: '2rem' }}>사용자 설정</h2>
              <ul style={{ marginTop: '1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-color)' }}>
                <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={toggleTheme}>
                  <span>다크모드</span>
                  <span>{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</span>
                </li>
                {isLoggedIn && (
                  <li style={{ cursor: 'pointer', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', color: '#ef4444' }} onClick={() => { setIsLoggedIn(false); setIsSidebarOpen(false); navigate('/'); }}>
                    로그아웃
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calendar;
