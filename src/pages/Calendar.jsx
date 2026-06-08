import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext, AuthContext, AppContext } from '../App';
import { Menu, Home as HomeIcon, Moon, Sun, User, LogIn, LogOut, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2, ChevronDown, ChevronUp, RefreshCw, Plus, Trash2, X } from 'lucide-react';

const LIMIT = 5;
const COOLDOWN_MS = 60 * 60 * 1000; // 1시간

const Calendar = () => {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { userName, addRecentCalendar, removeRecentCalendar, currentUserId, dayData, setDayData, aiUsageData: aiUsage, setAiUsageData: setAiUsage, saveDataToServer } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentYear = parseInt(year, 10) || new Date().getFullYear();
  const currentMonth = parseInt(month, 10) || new Date().getMonth() + 1;
  const [selectedDate, setSelectedDate] = useState(null);
  
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [isEditingAiSummary, setIsEditingAiSummary] = useState(false);
  const [routineForm, setRoutineForm] = useState({ time: getCurrentTime(), content: '' });
  
  // dayData is now managed by AppContext

  const dateKey = selectedDate ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null;
  const currentDayData = dateKey ? (dayData[dateKey] || { title: '', color: '#ffffff', routines: [], aiSummary: '' }) : null;

  const checkAndCleanEmptyMonth = (data) => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}-`;
    let hasData = false;
    for (const key in data) {
      if (key.startsWith(monthPrefix)) {
        const d = data[key];
        if ((d.routines && d.routines.length > 0) || d.title || (d.color && d.color !== '#ffffff') || d.aiSummary) {
          hasData = true;
          break;
        }
      }
    }
    if (!hasData) {
      removeRecentCalendar(currentYear, currentMonth);
    }
  };

  const updateCurrentDayData = (updates) => {
    setDayData(prev => {
      const updated = {
        ...prev,
        [dateKey]: { ...(prev[dateKey] || { title: '', color: '#ffffff', routines: [], aiSummary: '' }), ...updates }
      };
      saveDataToServer(null, updated, null);
      checkAndCleanEmptyMonth(updated);
      return updated;
    });
  };

  // aiUsage is now managed by AppContext

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [aiCooldown, setAiCooldown] = useState(0);

  useEffect(() => {
    if (aiCooldown > 0) {
      const timer = setTimeout(() => setAiCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [aiCooldown]);

  useEffect(() => {
    let interval = null;
    if (aiUsage.count >= LIMIT && aiUsage.resetTime) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = aiUsage.resetTime - now;
        if (diff <= 0) {
          setAiUsage({ count: 0, resetTime: null });
          setRemainingTime('');
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setRemainingTime(`${m}분 ${s}초 뒤 충전`);
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setRemainingTime('');
    }
    return () => clearInterval(interval);
  }, [aiUsage]);

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
    setRoutineForm({ time: getCurrentTime(), content: '' });
  };

  const handleAddRoutineSubmit = () => {
    if (routineForm.time && routineForm.content) {
      const newRoutines = [...(currentDayData.routines), { id: Date.now(), time: routineForm.time, content: routineForm.content }];
      updateCurrentDayData({ routines: newRoutines });
      setRoutineForm({ ...routineForm, content: '' });
      addRecentCalendar(currentYear, currentMonth);
    }
  };

  const handleGenerateAiSummary = async () => {
    if (aiUsage.count >= LIMIT) {
      alert('일일 사용량을 모두 소진했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    if (aiCooldown > 0) return;

    const routineTexts = currentDayData?.routines.map(r => r.content).join(", ");
    if (!routineTexts) {
      updateCurrentDayData({ aiSummary: "일과를 먼저 추가해 주시면 요약해 드립니다." });
      setIsAiSummaryOpen(true);
      return;
    }

    setAiCooldown(10);
    setIsLoadingAi(true);
    setIsAiSummaryOpen(true);
    updateCurrentDayData({ aiSummary: "✨ AI가 일상을 요약하고 있습니다..." });

    try {
      // Mock AI summarize instead of fetch
      await new Promise(resolve => setTimeout(resolve, 1500));
      const sortedRoutines = [...(currentDayData?.routines || [])].sort((a, b) => a.time.localeCompare(b.time));
      const count = sortedRoutines.length;

      // 시간대별 그룹핑 (오전/오후/저녁)
      const morning = sortedRoutines.filter(r => { const h = parseInt(r.time.split(':')[0], 10); return h < 12; });
      const afternoon = sortedRoutines.filter(r => { const h = parseInt(r.time.split(':')[0], 10); return h >= 12 && h < 18; });
      const evening = sortedRoutines.filter(r => { const h = parseInt(r.time.split(':')[0], 10); return h >= 18; });

      const summarizeGroup = (items) => items.map(r => r.content).join(', ');

      let parts = [];
      if (morning.length > 0) parts.push(`🌅 오전에는 ${summarizeGroup(morning)} 등을 하셨어요.`);
      if (afternoon.length > 0) parts.push(`☀️ 오후에는 ${summarizeGroup(afternoon)} 등을 하며 보내셨네요.`);
      if (evening.length > 0) parts.push(`🌙 저녁에는 ${summarizeGroup(evening)} 등으로 하루를 마무리하셨어요.`);

      const greetings = [
        '오늘도 정말 알차게 보내셨네요! 😊',
        '바쁜 하루 속에서도 멋지게 해내셨어요! 💪',
        '하루하루 성실하게 보내시는 모습이 멋져요! ✨',
        '오늘 하루도 수고 많으셨어요! 내일도 파이팅! 🎉'
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];

      const summaryLines = [
        `✨ 오늘 하루 동안 총 ${count}가지 일과를 기록해 주셨어요!`,
        '',
        ...parts,
        '',
        greeting
      ];

      const data = { summary: summaryLines.join('\n') };
      
      updateCurrentDayData({ aiSummary: data.summary });
      
      const newCount = aiUsage.count + 1;
      const newAiUsage = {
        count: newCount,
        resetTime: newCount >= LIMIT ? Date.now() + COOLDOWN_MS : null
      };
      setAiUsage(newAiUsage);
      saveDataToServer(null, null, newAiUsage);

    } catch (error) {
      console.error(error);
      updateCurrentDayData({ aiSummary: "요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setIsLoadingAi(false);
    }
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
        <div className="calendar-container">
          <h3 style={{ textAlign: 'center', color: '#fff', fontWeight: '400', marginBottom: '4rem', fontSize: '1.2rem', opacity: 0.8, letterSpacing: '0.05em' }}>
            날짜를 선택해주세요
          </h3>

          <div className="calendar-grid">
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
                <div key={i} title={dKey && dayData[dKey]?.title ? dayData[dKey].title : ""} className="day-cell" style={{
                  opacity: d.isCurrentMonth ? 0.9 : 0.2,
                  color: d.isCurrentMonth ? dColor : '#fff',
                  border: current ? `1px solid ${dColor}` : '1px solid transparent',
                  cursor: d.isCurrentMonth ? 'pointer' : 'default',
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
            <div className="modal-content calendar-modal" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="calendar-modal-header">
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
                
                <div className="modal-actions">
                  <button onClick={() => {
                    if (window.confirm('이 날의 모든 일과 및 데이터를 삭제하시겠습니까?')) {
                      updateCurrentDayData({ routines: [], title: '', color: '#ffffff', aiSummary: '' });
                      handleCloseModal();
                    }
                  }} style={{
                    backgroundColor: '#ef4444', color: '#fff', border: 'none',
                    padding: '0.6rem 1.2rem', borderRadius: '2rem', cursor: 'pointer',
                    fontWeight: '600', fontSize: '0.9rem'
                  }}>
                    일과 전체 삭제
                  </button>
                  <button onClick={() => {
                    setIsAddingRoutine(!isAddingRoutine);
                    if (!isAddingRoutine) {
                      setRoutineForm({ time: getCurrentTime(), content: '' });
                    }
                  }} style={{
                    backgroundColor: isAddingRoutine ? '#4b4b60' : '#A855F7', color: '#fff', border: 'none',
                    padding: '0.6rem 1.2rem', borderRadius: '2rem', cursor: 'pointer',
                    fontWeight: '600', fontSize: '0.9rem'
                  }}>
                    {isAddingRoutine ? '이전으로' : '일과를 추가하기'}
                  </button>
                </div>
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
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const updates = { title: newTitle };
                        if (newTitle.length > 0 && currentDayData.color === '#ffffff') {
                          updates.color = '#8b5cf6';
                        }
                        updateCurrentDayData(updates);
                      }}
                      style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.1rem', flex: 1, outline: 'none' }}
                    />
                  </div>

                  {!isAddingRoutine ? (
                    <>
                      <div style={{ backgroundColor: '#363644', padding: '1.5rem', borderRadius: '0.5rem' }}>
                        <div style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.9rem' }}>날짜 테마 색상 선택</div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {[
                            { hex: '#ffffff', name: '기본 (하양)' },
                            { hex: '#ef4444', name: '빨강' },
                            { hex: '#f97316', name: '주황' },
                            { hex: '#f59e0b', name: '노랑' },
                            { hex: '#84cc16', name: '연두' },
                            { hex: '#22c55e', name: '초록' },
                            { hex: '#06b6d4', name: '청록' },
                            { hex: '#3b82f6', name: '파랑' },
                            { hex: '#8b5cf6', name: '보라' },
                            { hex: '#d946ef', name: '분홍' },
                            { hex: '#f43f5e', name: '진분홍' }
                          ].map(c => (
                            <button 
                              key={c.hex}
                              onClick={() => updateCurrentDayData({ color: c.hex })}
                              style={{
                                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c.hex,
                                border: currentDayData.color === c.hex ? '3px solid #fff' : '2px solid transparent',
                                cursor: 'pointer', transition: 'transform 0.2s',
                                transform: currentDayData.color === c.hex ? 'scale(1.1)' : 'scale(1)',
                                boxShadow: currentDayData.color === c.hex ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                              }}
                              title={c.name}
                            />
                          ))}
                          <label style={{
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: 'conic-gradient(from 0deg, #ef4444, #f97316, #f59e0b, #84cc16, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #d946ef, #f43f5e, #ef4444)',
                            border: '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden'
                          }} title="직접 선택">
                            <input 
                              type="color" 
                              value={currentDayData.color} 
                              onChange={(e) => updateCurrentDayData({ color: e.target.value })} 
                              style={{ position: 'absolute', width: '200%', height: '200%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 }} 
                            />
                          </label>
                        </div>
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
                          <button 
                            onClick={handleGenerateAiSummary} 
                            disabled={isLoadingAi || aiUsage.count >= LIMIT || aiCooldown > 0}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '0.5rem', 
                              backgroundColor: 'transparent', 
                              border: '1px solid',
                              borderColor: (isLoadingAi || aiUsage.count >= LIMIT || aiCooldown > 0) ? '#666' : '#A855F7',
                              color: (isLoadingAi || aiUsage.count >= LIMIT || aiCooldown > 0) ? '#666' : '#A855F7',
                              padding: '0.5rem 1rem', borderRadius: '0.5rem', 
                              cursor: (isLoadingAi || aiUsage.count >= LIMIT || aiCooldown > 0) ? 'not-allowed' : 'pointer'
                            }}>
                            {aiUsage.count >= LIMIT 
                              ? (remainingTime ? `충전 대기 중... (${remainingTime})` : `✨ AI로 일상 요약하기 (0/${LIMIT})`)
                              : (aiCooldown > 0 
                                  ? `잠시만 기다려주세요... (${aiCooldown}초)` 
                                  : (isLoadingAi 
                                      ? '요약 중...' 
                                      : `✨ AI로 일상 요약하기 (${LIMIT - aiUsage.count}/${LIMIT})`))}
                          </button>
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
                        <div 
                          onClick={(e) => { e.stopPropagation(); if (!isLoadingAi && aiUsage.count < LIMIT && aiCooldown === 0) handleGenerateAiSummary(); }} 
                          style={{ cursor: (isLoadingAi || aiUsage.count >= LIMIT || aiCooldown > 0) ? 'not-allowed' : 'pointer', opacity: (isLoadingAi || aiUsage.count >= LIMIT || aiCooldown > 0) ? 0.5 : 1 }}
                        >
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
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn close-sidebar" onClick={() => setIsSidebarOpen(false)}>
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
