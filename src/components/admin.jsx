import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Logo from './imgs/logo2.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Form = () => {
  const { t, i18n } = useTranslation();
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://elmanafea.shop/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminUsername', user_name);
        localStorage.setItem('loginTime', new Date().toISOString());
        window.dispatchEvent(new Event('adminStatusChanged'));
        navigate('/');
      } else {
        setError(data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkAdmin = () => {
    const token = localStorage.getItem('adminToken');
    return !!token;
  };

  const isTokenValid = () => {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('loginTime');
    
    if (!token || !loginTime) return false;
    
    const tokenAge = new Date() - new Date(loginTime);
    const tokenMaxAge = 24 * 60 * 60 * 1000;
    
    return tokenAge < tokenMaxAge;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('loginTime');
    navigate('/login');
  };

  const getDirection = () => {
    return ['ar', 'fa', 'ur'].includes(i18n.language) ? 'rtl' : 'ltr';
  };

  return (
    <StyledWrapper dir={getDirection()}>
      <div className="form-container" dir={getDirection()}>
        <div className="logo-container">
          <img src={Logo} alt="Power Line Gas" className="logo" draggable="false" />
          {/* <p className="powered-by">Powered By Sam Company</p> */}
        </div>
        
        <h1 className="title">
          Login To <span>Manafea</span>
        </h1>
        
        <p className="welcome-text">Welcome back! Please log in to access your account.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label style={{ textAlign: getDirection() === 'rtl' ? 'right' : 'left' }}>
              {t('Email')}
            </label>
            <div className="input-wrapper">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className={getDirection() === 'rtl' ? 'field-icon-rtl' : 'field-icon'} 
              />
              <input
                type="text"
                placeholder={t("Enter your Email")}
                value={user_name}
                onChange={(e) => setUsername(e.target.value)}
                style={{ textAlign: getDirection() === 'rtl' ? 'right' : 'left' }}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label style={{ textAlign: getDirection() === 'rtl' ? 'right' : 'left' }}>
              {t('Password')}
            </label>
            <div className="input-wrapper">
              <FontAwesomeIcon 
                icon={faLock} 
                className={getDirection() === 'rtl' ? 'field-icon-rtl' : 'field-icon'} 
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("Enter your Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ textAlign: getDirection() === 'rtl' ? 'right' : 'left' }}
                required
              />
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                className={getDirection() === 'rtl' ? 'show-password-rtl' : 'show-password'}
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>
          
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e3a5f;
  padding: 20px;
  user-select: none;

  .form-container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  .logo-container {
    text-align: center;
    // margin-bottom: 20px;
  }

  .logo {
    width: 220px;
    height: auto;
  }

  .powered-by {
    color: #666;
    font-size: 14px;
    margin-top: 5px;
  }

  .title {
    text-align: center;
    font-size: 24px;
    margin-bottom: 10px;
    
    span {
      color: #1e3a5f;
      user-select: text;
    }
  }

  .welcome-text {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
  }

  .input-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    .field-icon {
      position: absolute;
      left: 12px;
      color: #666;
      width: 20px;
      height: 20px;
    }

    .field-icon-rtl {
      position: absolute;
      right: 12px;
      color: #666;
      width: 20px;
      height: 20px;
    }

    .show-password {
      position: absolute;
      right: 12px;
      color: #666;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }

    .show-password-rtl {
      position: absolute;
      left: 12px;
      color: #666;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }

    input {
      width: 100%;
      padding: ${props => props.dir === 'rtl' ? '12px 40px 12px 12px' : '12px 12px 12px 40px'};
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;

      &:focus {
        border-color: #1e3a5f;
        outline: none;
      }
    }
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    background: #1e3a5f;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: #13243e;
    }
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #dc2626;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }
`;

export default Form;
