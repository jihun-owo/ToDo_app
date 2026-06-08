import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const id = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      // Mock registration using localStorage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[id]) {
        alert('이미 존재하는 아이디입니다.');
        return;
      }

      users[id] = { password, email };
      localStorage.setItem('users', JSON.stringify(users));

      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error', error);
      alert('회원가입 중 오류가 발생했습니다.');
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
          회원가입
        </h1>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input 
            type="text" 
            placeholder="아이디" 
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
            type="email" 
            placeholder="이메일" 
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
              회원가입 하기
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/login')}
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
              로그인으로 돌아가기
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '500' }}>로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
