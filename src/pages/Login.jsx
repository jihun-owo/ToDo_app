import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUserId } = useContext(AppContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    const inputIdOrEmail = e.target[0].value;
    const inputPassword = e.target[1].value;

    try {
      // Mock login using localStorage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const user = users[inputIdOrEmail];
      
      // Check if user exists and password matches
      // Also allow matching by email if implemented (for simplicity, we assume inputIdOrEmail matches the key)
      const isMatch = user && user.password === inputPassword;
      let matchedUserId = inputIdOrEmail;

      if (!isMatch) {
        // Try matching by email
        const userByEmail = Object.keys(users).find(key => users[key].email === inputIdOrEmail && users[key].password === inputPassword);
        if (userByEmail) {
          matchedUserId = userByEmail;
        } else {
          alert('일치하는 회원 정보가 없습니다. 회원가입 페이지로 이동합니다.');
          navigate('/signup');
          return;
        }
      }

      setCurrentUserId(matchedUserId);
      navigate('/');
    } catch (error) {
      console.error('Login error', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: '500', marginBottom: '3rem' }}>
          로그인
        </h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input 
            type="text" 
            placeholder="아이디 또는 이메일" 
            required 
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '9999px',
              backgroundColor: '#1f1f1f',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            required 
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '9999px',
              backgroundColor: '#1f1f1f',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              type="submit" 
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '9999px',
                backgroundColor: '#a855f7',
                color: '#ffffff',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = 0.9}
              onMouseOut={e => e.currentTarget.style.opacity = 1}
            >
              로그인
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = 0.9}
              onMouseOut={e => e.currentTarget.style.opacity = 1}
            >
              이전
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '0.875rem', color: '#a3a3a3' }}>
          ↓만약 처음이라면↓
        </div>

        <button 
          type="button"
          onClick={() => navigate('/signup')}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.9}
          onMouseOut={e => e.currentTarget.style.opacity = 1}
        >
          회원가입 하기
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: '#ffffff', width: '1.1rem', height: '1.1rem', cursor: 'pointer' }} />
            자동 로그인
          </label>
          <a href="#" style={{ color: '#a3a3a3', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>계정 찾기</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
