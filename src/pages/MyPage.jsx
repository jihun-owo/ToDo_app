import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, AppContext } from '../App';
import { ArrowLeft, User, LogOut, Key, Trash2 } from 'lucide-react';

const MyPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { setUserName } = useContext(AppContext);
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');

  // Fallback protection: although routing handles this usually, it's good to have it here too.
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.trim() === '') return;
    localStorage.setItem('userPassword', newPassword);
    alert('비밀번호가 성공적으로 변경되었습니다.');
    setNewPassword('');
  };

  const handleChangeUsername = (e) => {
    e.preventDefault();
    if (newUsername.trim() === '') return;
    localStorage.setItem('userId', newUsername);
    setUserName(newUsername);
    alert('사용자 이름(아이디)이 성공적으로 변경되었습니다. 다음 로그인 시 새 아이디를 사용해주세요.');
    setNewUsername('');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPassword');
      setIsLoggedIn(false);
      alert('계정이 성공적으로 탈퇴되었습니다.');
      navigate('/');
    }
  };

  return (
    <div className="page-container animate-fade-in" onClick={() => navigate(-1)} style={{ cursor: 'default' }}>
      
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', backgroundColor: 'var(--card-bg)', padding: '3rem', borderRadius: '1rem', color: 'var(--card-text)', textAlign: 'left', cursor: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={40} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {localStorage.getItem('userId') || '사용자'}님
            </h1>
            <p style={{ opacity: 0.7 }}>
              {localStorage.getItem('userEmail') || 'user@example.com'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
              <User size={20} /> 사용자 이름 변경
            </h2>
            <form onSubmit={handleChangeUsername} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="새로운 사용자 이름 (아이디)" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="input-field"
                style={{ marginBottom: 0, flex: 1, borderColor: 'var(--border-color)', color: 'var(--card-text)' }}
                required
              />
              <button type="submit" className="primary-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>변경</button>
            </form>
          </section>

          <section>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
              <Key size={20} /> 비밀번호 변경
            </h2>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="password" 
                placeholder="새로운 비밀번호" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                style={{ marginBottom: 0, flex: 1, borderColor: 'var(--border-color)', color: 'var(--card-text)' }}
                required
              />
              <button type="submit" className="primary-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>변경</button>
            </form>
          </section>

          <section>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem', color: '#ef4444' }}>
              <Trash2 size={20} /> 계정 탈퇴
            </h2>
            <p style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.9rem' }}>탈퇴 시 모든 회원 정보가 삭제되며 복구할 수 없습니다.</p>
            <button onClick={handleDeleteAccount} className="primary-btn" style={{ backgroundColor: '#ef4444', width: 'auto', display: 'inline-block' }}>
              탈퇴하기
            </button>
          </section>
          
          <div style={{ marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '1rem', 
                backgroundColor: 'transparent', 
                border: '1px solid #ef4444', 
                color: '#ef4444', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
                flex: 1
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <LogOut size={20} />
              로그아웃
            </button>
            
            <button 
              onClick={() => navigate(-1)}
              style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--btn-bg)', 
                color: 'var(--btn-text)', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 'bold',
                transition: 'opacity 0.2s',
                flex: 1
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              이전
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
