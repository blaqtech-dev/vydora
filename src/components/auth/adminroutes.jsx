
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoaderCircle, ShieldAlert } from 'lucide-react';

function AdminRoute() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) setStatus('denied');
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          setStatus(data ? 'allowed' : 'denied');
        }
      } catch (error) {
        console.error('Admin permission check failed:', error);

        if (mounted) setStatus('error');
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="admin-route-message">
        <LoaderCircle className="admin-route-spinner" size={30} />
        <p>Verifying administrator access...</p>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === 'error') {
    return (
      <div className="admin-route-message">
        <ShieldAlert size={32} />
        <h2>Access verification failed</h2>
        <p>
          Vydora could not verify your administrator access.
          Please try again later.
        </p>
      </div>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
