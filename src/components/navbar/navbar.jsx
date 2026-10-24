
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AudioLines, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setIsSignedIn(Boolean(data.session));
        }
      } catch (error) {
        console.error('Could not check navbar session:', error);

        if (mounted) {
          setIsSignedIn(false);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsSignedIn(Boolean(session));
        setCheckingSession(false);
        setMenuOpen(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.hash]);

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link
          to={isSignedIn ? '/dashboard' : '/'}
          className="navbar-brand"
          onClick={closeMenu}
        >
          <span className="brand-icon">
            <AudioLines size={23} strokeWidth={2.4} />
          </span>
          <span>vydora</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}
        >
          {!isSignedIn && (
            <>
              <Link to="/#how-it-works" onClick={closeMenu}>
                How it works
              </Link>

              <Link to="/#features" onClick={closeMenu}>
                Features
              </Link>

              <Link to="/#pricing" onClick={closeMenu}>
                Pricing
              </Link>
            </>
          )}

          <div className="navbar-actions">
            {checkingSession ? (
              <span className="navbar-login" aria-live="polite">
                Loading...
              </span>
            ) : isSignedIn ? (
              <>
                <Link
                  to="/storage"
                  className="navbar-login"
                  onClick={closeMenu}
                >
                  My library
                </Link>

                <Link
                  to="/dashboard"
                  className="navbar-signup"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-login"
                  onClick={closeMenu}
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="navbar-signup"
                  onClick={closeMenu}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
