
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AudioLines,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  LoaderCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './signup.css';

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage('');
    setMessageType('error');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (name.length < 2) {
      setMessage('Please enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Your password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // Email confirmation is disabled, so the user is signed in.
        navigate('/dashboard', { replace: true });
        return;
      }

      // Email confirmation is enabled.
      setMessage(
        'Your account has been created! Please check your email for a verification link before logging in.'
      );
      setMessageType('success');

      setFormData({
        name: '',
        email: '',
        password: '',
      });
    } catch (error) {
      console.error('Signup error:', error);

      if (error.message?.toLowerCase().includes('already registered')) {
        setMessage(
          'An account with this email may already exist. Try logging in instead.'
        );
      } else {
        setMessage(
          error.message || 'Unable to create your account. Please try again.'
        );
      }

      setMessageType('error');
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
            <span className="auth-eyebrow">GET STARTED</span>
            <h1>Create your account</h1>
            <p>
              Start turning your videos into audio, all in one place.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                minLength={2}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password">Password</label>

              <div className="password-input-wrap">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <span className="field-hint">
                Use at least 8 characters.
              </span>
            </div>

            {message && (
              <div
                className={`auth-message ${
                  messageType === 'success'
                    ? 'auth-message-success'
                    : ''
                }`}
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  Creating account...
                  <LoaderCircle className="signup-spinner" size={18} />
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="auth-terms">
              By continuing, you agree to use Vydora responsibly and only
              convert content you have permission to use.
            </p>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="auth-secondary-button">
            Log in instead
          </Link>
        </div>

        <div className="auth-assurance">
          <span>
            <Check size={15} /> Simple to use
          </span>
          <span>
            <Check size={15} /> Your personal library
          </span>
        </div>
      </div>
    </section>
  );
}

export default Signup;
