
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoaderCircle } from 'lucide-react';

function ProtectedRoute() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setSession(data.session);
          setChecking(false);
        }
      } catch (error) {
        console.error('Unable to check authentication:', error);

        if (mounted) {
          setSession(null);
          setChecking(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setChecking(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#7856e8',
        }}
      >
        <LoaderCircle
          size={30}
          style={{ animation: 'auth-route-spin 1s linear infinite' }}
        />
        <p style={{ color: '#777486' }}>Checking your session...</p>

        <style>
          {`
            @keyframes auth-route-spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
