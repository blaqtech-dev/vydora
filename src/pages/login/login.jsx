
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AudioLines,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './login.css';
import '../signup/signup.css';

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.session) {
        setError('Login was unsuccessful. Please try again.');
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      const errorMessage = err.message?.toLowerCase() || '';

      if (
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email_not_confirmed')
      ) {
        setError(
          'Please confirm your email address using the verification link we sent you.'
        );
      } else if (
        errorMessage.includes('invalid login credentials')
      ) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(
          err.message || 'Unable to log in. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">
              <AudioLines size={22} />
            </span>
            vydora
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h1>Log in to Vydora</h1>
            <p>
              Sign in to access your audio library and conversions.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="login-password">Password</label>

              <div className="password-input-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-message" role="alert">
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  Logging in...
                  <LoaderCircle
                    className="login-spinner"
                    size={18}
                  />
                </>
              ) : (
                <>
                  Log in <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to Vydora?</span>
          </div>

          <Link to="/signup" className="auth-secondary-button">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Login;
