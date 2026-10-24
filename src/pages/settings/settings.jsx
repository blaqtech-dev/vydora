
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Check,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  LoaderCircle,
  FolderOpen,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/themecontext.jsx';
import './settings.css';

function Settings() {
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] =
    useState('error');

  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (active) {
          setEmail(data.user?.email || '');
        }
      } catch (error) {
        console.error('Unable to load account:', error);
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const selectTheme = (value) => {
    if (value === theme) return;

    changeTheme(value);
    setSaved(true);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setPasswordMessage('');
    setPasswordMessageType('error');

    if (newPassword.length < 8) {
      setPasswordMessage(
        'Your new password must be at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Your passwords do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Your password has been updated successfully.');
      setPasswordMessageType('success');
    } catch (error) {
      console.error('Password update failed:', error);

      setPasswordMessage(
        error.message ||
          'Unable to update your password. Please try again.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError('');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
      setSignOutError(
        error.message || 'Unable to sign out. Please try again.'
      );
      setSigningOut(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <Link to="/dashboard" className="settings-back-link">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="settings-page-heading">
          <div className="settings-heading-icon">
            <SettingsIcon size={24} />
          </div>

          <div>
            <h1>Settings</h1>
            <p>Manage your account and personalize Vydora.</p>
          </div>
        </div>

        {/* Appearance */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <h2>Appearance</h2>
            <p>Choose how Vydora looks on your device.</p>
          </div>

          <div className="settings-theme-options">
            <button
              type="button"
              className={`settings-theme-option ${
                theme === 'light' ? 'active' : ''
              }`}
              onClick={() => selectTheme('light')}
              aria-pressed={theme === 'light'}
            >
              <div className="settings-theme-preview light-preview">
                <Sun size={28} />
                <span />
                <span />
                <span />
              </div>

              <div className="settings-theme-label">
                <Sun size={17} />
                <span>Light mode</span>
                {theme === 'light' && (
                  <Check className="settings-theme-check" size={17} />
                )}
              </div>
            </button>

            <button
              type="button"
              className={`settings-theme-option ${
                theme === 'dark' ? 'active' : ''
              }`}
              onClick={() => selectTheme('dark')}
              aria-pressed={theme === 'dark'}
            >
              <div className="settings-theme-preview dark-preview">
                <Moon size={28} />
                <span />
                <span />
                <span />
              </div>

              <div className="settings-theme-label">
                <Moon size={17} />
                <span>Dark mode</span>
                {theme === 'dark' && (
                  <Check className="settings-theme-check" size={17} />
                )}
              </div>
            </button>
          </div>

          <div className="settings-theme-note">
            <Monitor size={17} />
            <p>
              Your theme preference is saved on this device and
              applied throughout Vydora. You can change it anytime.
            </p>
          </div>

          {saved && (
            <p className="settings-saved-message" role="status">
              <Check size={16} />
              Theme preference saved.
            </p>
          )}
        </section>

        {/* Account */}
        <section className="settings-section settings-extra-section">
          <div className="settings-section-heading">
            <h2>Account</h2>
            <p>Manage your personal information.</p>
          </div>

          <div className="settings-account-email">
            <div className="settings-item-icon">
              <Mail size={19} />
            </div>

            <div className="settings-item-content">
              <span className="settings-item-title">
                Email address
              </span>
              <span className="settings-item-description">
                {loadingUser ? 'Loading account...' : email || 'Unavailable'}
              </span>
            </div>

            <span className="settings-readonly-label">Read only</span>
          </div>

          <div className="settings-action-row">
            <div className="settings-item-icon">
              <UserRound size={19} />
            </div>

            <div className="settings-item-content">
              <span className="settings-item-title">
                Profile information
              </span>
              <span className="settings-item-description">
                Update your display name and profile picture.
              </span>
            </div>

            <Link to="/profile" className="settings-link-button">
              Edit profile
            </Link>
          </div>

          <div className="settings-action-row">
            <div className="settings-item-icon">
              <FolderOpen size={19} />
            </div>

            <div className="settings-item-content">
              <span className="settings-item-title">
                Your audio library
              </span>
              <span className="settings-item-description">
                Browse, play, download, rename, or delete saved audio.
              </span>
            </div>

            <Link to="/storage" className="settings-link-button">
              Open storage
            </Link>
          </div>
        </section>

        {/* Password and security */}
        <section className="settings-section settings-extra-section">
          <div className="settings-section-heading">
            <h2>Password &amp; Security</h2>
            <p>Change the password you use to sign in to Vydora.</p>
          </div>

          <div className="settings-security-note">
            <ShieldCheck size={20} />
            <p>
              Choose a strong password of at least 8 characters.
              Your password is handled securely by Supabase Auth.
            </p>
          </div>

          <form
            className="settings-password-form"
            onSubmit={handlePasswordChange}
          >
            <div className="settings-password-field">
              <label htmlFor="settings-new-password">
                New password
              </label>

              <div className="settings-password-input">
                <LockKeyhole size={18} />

                <input
                  id="settings-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordMessage('');
                  }}
                  placeholder="Enter new password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={savingPassword}
                />

                <button
                  type="button"
                  className="settings-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  disabled={savingPassword}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="settings-password-field">
              <label htmlFor="settings-confirm-password">
                Confirm new password
              </label>

              <div className="settings-password-input">
                <LockKeyhole size={18} />

                <input
                  id="settings-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordMessage('');
                  }}
                  placeholder="Enter the password again"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={savingPassword}
                />

                <button
                  type="button"
                  className="settings-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirmation'
                      : 'Show confirmation'
                  }
                  disabled={savingPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {passwordMessage && (
              <p
                className={`settings-feedback ${
                  passwordMessageType === 'success'
                    ? 'settings-feedback-success'
                    : 'settings-feedback-error'
                }`}
                role="status"
              >
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              className="settings-primary-button"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <LoaderCircle
                  size={17}
                  className="settings-spinner"
                />
              ) : (
                <Save size={17} />
              )}

              {savingPassword ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </section>

        {/* Sign out */}
        <section className="settings-section settings-extra-section settings-logout-section">
          <div className="settings-section-heading">
            <h2>Sign out</h2>
            <p>End your current Vydora session on this device.</p>
          </div>

          {signOutError && (
            <p className="settings-feedback settings-feedback-error" role="alert">
              {signOutError}
            </p>
          )}

          <button
            type="button"
            className="settings-logout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <LoaderCircle size={17} className="settings-spinner" />
            ) : (
              <LogOut size={17} />
            )}

            {signingOut ? 'Signing out...' : 'Sign out of Vydora'}
          </button>
        </section>
      </div>
    </div>
  );
}

export default Settings;
