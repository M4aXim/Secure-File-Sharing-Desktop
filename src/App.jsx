import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./Dashboard";

function App() {
  const [activeForm, setActiveForm] = useState(null);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [showMfaField, setShowMfaField] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for Google OAuth token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      handleGoogleLoginSuccess(token);
    }

    // Check if user is already authenticated
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const showForm = (formId) => {
    setActiveForm(formId);
    setShowOtpSection(false);
    setShowMfaField(false);
    setMfaToken("");
  };

  const showNotification = (message, type) => {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type} is-light`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.maxWidth = '300px';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.borderRadius = '6px';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'delete';
    closeButton.addEventListener('click', () => {
      notification.remove();
    });
    
    notification.appendChild(closeButton);
    notification.appendChild(document.createTextNode(message));
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  const handleForgotPassword = () => {
    const email = prompt("Please enter your email address:");

    if (!email) {
      showNotification('Please enter email', 'is-danger');
      return;
    }

    fetch(`https://hackclub.maksimmalbasa.in.rs/api/change-password/${encodeURIComponent(email)}`, {
      method: 'POST' 
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        showNotification(data.message, 'is-success');
      } else {
        showNotification(data.error || 'Password reset failed', 'is-danger');
      }
    })
    .catch(error => {
      showNotification('Connection error. Please try again later.', 'is-danger');
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    if (!username || !password) {
      showNotification('Please fill in all fields', 'is-danger');
      return;
    }
    
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, token: mfaToken })
      });
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        showNotification('Login successful! Redirecting...', 'is-success');
        setIsAuthenticated(true);
      } else if (data.error === 'MFA token required') {
        setShowMfaField(true);
        showNotification('Please enter your authentication code', 'is-info');
      } else {
        showNotification(data.error || 'Invalid username or password', 'is-danger');
      }
    } catch (error) {
      showNotification('Connection error. Please try again later.', 'is-danger');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    if (!username || !email || !password) {
      showNotification('Please fill in all fields', 'is-danger');
      return;
    }
    
    if (password.length < 8) {
      showNotification('Password must be at least 8 characters', 'is-danger');
      return;
    }
    
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      if (response.ok) {
        showNotification('Registration successful! Please log in.', 'is-success');
        setTimeout(() => {
          showForm('login');
        }, 2000);
      } else {
        showNotification('Registration failed. Please try again.', 'is-danger');
      }
    } catch (error) {
      showNotification('Connection error. Please try again later.', 'is-danger');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://hackclub.maksimmalbasa.in.rs/api/auth/google';
  };

  const handleGoogleLoginSuccess = async (token) => {
    localStorage.setItem('jwtToken', token);
    showNotification('Google login successful! Redirecting...', 'is-success');
    
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/verify-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.message === 'Token is valid') {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          localStorage.setItem('username', payload.username);
          localStorage.setItem('userRole', payload.role);
          
          console.log('Logged in as:', payload.username, 'with role:', payload.role);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error decoding token:', e);
          showNotification('Error processing login. Please try again.', 'is-danger');
        }
      } else {
        showNotification('Invalid token. Please try again.', 'is-danger');
      }
    } catch (error) {
      showNotification('Error verifying token. Please try again.', 'is-danger');
      console.error('Token verification error:', error);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    if (!email) {
      showNotification('Please enter your email address', 'is-danger');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.message) {
        showNotification('If your email is registered, a one-time password has been sent', 'is-success');
        setOtpEmail(email);
        setShowOtpSection(true);
      } else {
        showNotification(data.error || 'Failed to send OTP', 'is-danger');
      }
    } catch (error) {
      showNotification('Connection error. Please try again later.', 'is-danger');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithOTP = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    
    if (!otpEmail || !otp) {
      showNotification('Please enter the one-time password', 'is-danger');
      return;
    }
    
    if (otp.length !== 6 || isNaN(otp)) {
      showNotification('Please enter a valid 6-digit code', 'is-danger');
      return;
    }
    
    try {
      const response = await fetch('https://hackclub.maksimmalbasa.in.rs/api/login-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: otpEmail, otp })
      });
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        
        if (data.user) {
          localStorage.setItem('username', data.user.username);
          localStorage.setItem('userRole', data.user.role);
        }
        
        showNotification('Login successful! Redirecting...', 'is-success');
        setIsAuthenticated(true);
      } else {
        showNotification(data.error || 'Invalid one-time password', 'is-danger');
      }
    } catch (error) {
      showNotification('Connection error. Please try again later.', 'is-danger');
      console.error('Error:', error);
    }
  };

  const resetOTPForm = () => {
    setShowOtpSection(false);
    setOtpEmail("");
  };

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
        } />
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <section className="section py-6">
              <div className="container">
                {/* Hero Section */}
                <div className="hero p-5 mb-6">
                  <div className="hero-body">
                    <div className="columns is-vcentered">
                      <div className="column">
                        <h1 className="title is-2 has-text-primary">
                          <i className="fas fa-cloud-upload-alt mr-2"></i>FileShare
                        </h1>
                        <p className="subtitle is-4 mt-3">Secure and simple file sharing for everyone</p>
                        <p className="is-size-5 mt-4 has-text-grey">
                          Share files with ease, access from anywhere, and keep your data secure.
                        </p>
                        <div className="buttons mt-5">
                          <button className="button is-primary is-medium px-5" onClick={() => showForm('login')}>
                            <span className="icon"><i className="fas fa-sign-in-alt"></i></span>
                            <span>Login</span>
                          </button>
                          <button className="button is-link is-medium px-5" onClick={() => showForm('register')}>
                            <span className="icon"><i className="fas fa-user-plus"></i></span>
                            <span>Create Account</span>
                          </button>
                          <a href="https://hackclub.maksimmalbasa.in.rs/law.html" className="button is-danger is-medium px-5">
                            <span className="icon"><i className="fas fa-gavel"></i></span>
                            <span>Law Enforcement</span>
                          </a>
                        </div>
                      </div>
                      <div className="column is-hidden-mobile">
                        <img src="https://hackclub.maksimmalbasa.in.rs/assets/Picture.png" alt="File sharing illustration" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Form */}
                {activeForm === 'login' && (
                  <div className="form-card p-5">
                    <h2 className="title is-4 has-text-centered">Welcome Back</h2>
                    <p className="subtitle is-6 has-text-centered has-text-grey mb-5">Log in to access your files</p>
                    
                    <form onSubmit={handleLogin}>
                      <div className="field">
                        <label className="label">Username</label>
                        <div className="control has-icons-left">
                          <input className="input" type="text" name="username" placeholder="Enter your username" required />
                          <span className="icon is-small is-left field-icon">
                            <i className="fas fa-user"></i>
                          </span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label">Password</label>
                        <div className="control has-icons-left">
                          <input className="input" type="password" name="password" placeholder="Enter your password" required />
                          <span className="icon is-small is-left field-icon">
                            <i className="fas fa-lock"></i>
                          </span>
                        </div>
                        <p className="help has-text-right">
                          <button className="button is-text is-small" type="button" onClick={handleForgotPassword}>
                            Forgot Password?
                          </button>
                        </p>
                      </div>

                      {showMfaField && (
                        <div className="field">
                          <label className="label">Authentication Code</label>
                          <div className="control has-icons-left">
                            <input
                              className="input"
                              type="text"
                              name="mfaToken"
                              placeholder="Enter 6-digit code"
                              maxLength="6"
                              value={mfaToken}
                              onChange={(e) => setMfaToken(e.target.value)}
                              required
                            />
                            <span className="icon is-small is-left field-icon">
                              <i className="fas fa-shield-alt"></i>
                            </span>
                          </div>
                          <p className="help">Enter the verification code from your authenticator app</p>
                        </div>
                      )}

                      <div className="field mt-5">
                        <div className="control">
                          <button className="button is-primary is-fullwidth" type="submit">
                            <span className="icon"><i className="fas fa-sign-in-alt"></i></span>
                            <span>Login</span>
                          </button>
                        </div>
                      </div>

                      <div className="field mt-4">
                        <div className="control">
                        </div>
                      </div>
                      
                      <div className="has-text-centered mt-3">
                        <button className="button is-text is-small" type="button" onClick={() => showForm('otp-login')}>
                          <span className="icon"><i className="fas fa-key"></i></span>
                          <span>Login with One-Time Password</span>
                        </button>
                      </div>
                      
                      <p className="form-note mt-4">
                        Don't have an account? <a href="#" onClick={() => showForm('register')}>Register here</a>
                      </p>
                    </form>
                  </div>
                )}

                {/* Register Form */}
                {activeForm === 'register' && (
                  <div className="form-card p-5">
                    <h2 className="title is-4 has-text-centered">Create an Account</h2>
                    <p className="subtitle is-6 has-text-centered has-text-grey mb-5">Join our secure file sharing platform</p>
                    
                    <form onSubmit={handleRegister}>
                      <div className="field">
                        <label className="label">Username</label>
                        <div className="control has-icons-left">
                          <input className="input" type="text" name="username" placeholder="Choose a username" required />
                          <span className="icon is-small is-left field-icon">
                            <i className="fas fa-user"></i>
                          </span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label">Email</label>
                        <div className="control has-icons-left">
                          <input className="input" type="email" name="email" placeholder="Enter your email" required />
                          <span className="icon is-small is-left field-icon">
                            <i className="fas fa-envelope"></i>
                          </span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label">Password</label>
                        <div className="control has-icons-left">
                          <input className="input" type="password" name="password" placeholder="Create a strong password" required />
                          <span className="icon is-small is-left field-icon">
                            <i className="fas fa-lock"></i>
                          </span>
                        </div>
                        <p className="help is-size-7">Password must be at least 8 characters</p>
                      </div>

                      <div className="field mt-5">
                        <div className="control">
                          <button className="button is-link is-fullwidth" type="submit">
                            <span className="icon"><i className="fas fa-user-plus"></i></span>
                            <span>Create Account</span>
                          </button>
                        </div>
                      </div>
                      
                      <p className="form-note mt-4">
                        Already have an account? <a href="#" onClick={() => showForm('login')}>Login here</a>
                      </p>
                    </form>
                  </div>
                )}

                {/* OTP Login Form */}
                {activeForm === 'otp-login' && (
                  <div className="form-card p-5">
                    <h2 className="title is-4 has-text-centered">Login with One-Time Password</h2>
                    <p className="subtitle is-6 has-text-centered has-text-grey mb-5">Enter your email to receive a code</p>
                    
                    {!showOtpSection ? (
                      <form onSubmit={handleRequestOTP}>
                        <div className="field">
                          <label className="label">Email</label>
                          <div className="control has-icons-left">
                            <input className="input" type="email" name="email" placeholder="Enter your email" required />
                            <span className="icon is-small is-left field-icon">
                              <i className="fas fa-envelope"></i>
                            </span>
                          </div>
                        </div>

                        <div className="field mt-4">
                          <div className="control">
                            <button
                              className="button is-info is-fullwidth"
                              type="submit"
                              disabled={isLoading}
                            >
                              <span className="icon">
                                {isLoading ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-paper-plane"></i>
                                )}
                              </span>
                              <span>{isLoading ? 'Sending...' : 'Send One-Time Password'}</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleLoginWithOTP}>
                        <div className="field">
                          <label className="label">Email</label>
                          <div className="control has-icons-left">
                            <input className="input" type="email" value={otpEmail} readOnly />
                            <span className="icon is-small is-left field-icon">
                              <i className="fas fa-envelope"></i>
                            </span>
                          </div>
                        </div>
                        
                        <div className="field">
                          <label className="label">One-Time Password</label>
                          <div className="control has-icons-left">
                            <input
                              className="input"
                              type="text"
                              name="otp"
                              placeholder="Enter the 6-digit code"
                              maxLength="6"
                              required
                            />
                            <span className="icon is-small is-left field-icon">
                              <i className="fas fa-key"></i>
                            </span>
                          </div>
                          <p className="help">Enter the 6-digit code sent to your email</p>
                        </div>

                        <div className="field mt-4">
                          <div className="control">
                            <button className="button is-primary is-fullwidth" type="submit">
                              <span className="icon"><i className="fas fa-sign-in-alt"></i></span>
                              <span>Login</span>
                            </button>
                          </div>
                        </div>
                        
                        <p className="has-text-centered mt-3">
                          <a href="#" onClick={resetOTPForm}>
                            <span className="icon is-small"><i className="fas fa-arrow-left"></i></span>
                            <span>Use a different email</span>
                          </a>
                        </p>
                      </form>
                    )}
                    
                    <p className="form-note mt-4">
                      <a href="#" onClick={() => showForm('login')}>Back to normal login</a>
                    </p>
                  </div>
                )}

                {/* Features Section */}
                <div className="features mt-6">
                  <h2 className="title is-3 has-text-centered mb-6">Why Choose FileShare?</h2>
                  <div className="columns is-multiline">
                    <div className="column is-4">
                      <div className="box feature-card p-5">
                        <div className="has-text-centered">
                          <span className="feature-icon">
                            <i className="fas fa-shield-alt"></i>
                          </span>
                          <h3 className="title is-4">Secure Storage</h3>
                          <p className="has-text-grey">Your files are encrypted and stored safely on our servers.</p>
                        </div>
                      </div>
                    </div>
                    <div className="column is-4">
                      <div className="box feature-card p-5">
                        <div className="has-text-centered">
                          <span className="feature-icon">
                            <i className="fas fa-bolt"></i>
                          </span>
                          <h3 className="title is-4">Fast Transfers</h3>
                          <p className="has-text-grey">Upload and download files at lightning-fast speeds.</p>
                        </div>
                      </div>
                    </div>
                    <div className="column is-4">
                      <div className="box feature-card p-5">
                        <div className="has-text-centered">
                          <span className="feature-icon">
                            <i className="fas fa-share-alt"></i>
                          </span>
                          <h3 className="title is-4">Easy Sharing</h3>
                          <p className="has-text-grey">Share files with anyone using simple links or direct invites.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        } />
      </Routes>

      <footer>
        <div>
          <p><strong>FileShare</strong> &copy; 2025 | Made with <i className="fas fa-heart has-text-danger"></i> by Maksim</p>
          <div className="mt-3">
            <a href="https://hackclub.maksimmalbasa.in.rs/privacy.html" className="has-text-grey mr-3">Privacy Policy</a>
            <a href="https://hackclub.maksimmalbasa.in.rs/TOS.html" className="has-text-grey mr-3">Terms of Service</a>
            <a href="https://hackclub.maksimmalbasa.in.rs/contact.html" className="has-text-grey">Contact Us</a>
          </div>
        </div>
      </footer>
    </Router>
  );
}

export default App;




