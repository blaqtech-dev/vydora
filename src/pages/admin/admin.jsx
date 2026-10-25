
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AudioLines,
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  RefreshCw,
FileAudio,
CheckCircle2,
  LogOut,
  Menu,
  Search,
ChevronLeft,
ChevronRight,
Mail,
CalendarDays,
  X,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './admin.css';

function Admin() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
const [statsLoading, setStatsLoading] = useState(true);
const [statsError, setStatsError] = useState('');
const [refreshing, setRefreshing] = useState(false);
const [activeSection, setActiveSection] = useState('overview');
const [users, setUsers] = useState([]);
const [userSearch, setUserSearch] = useState('');
const [usersLoading, setUsersLoading] = useState(false);
const [usersError, setUsersError] = useState('');
const [userPage, setUserPage] = useState(0);
const [userTotal, setUserTotal] = useState(0);

const [subscriptions, setSubscriptions] = useState([]);
const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
const [subscriptionsError, setSubscriptionsError] = useState('');
const [subscriptionSearch, setSubscriptionSearch] = useState('');
const [subscriptionStatus, setSubscriptionStatus] = useState('all');
const [subscriptionPage, setSubscriptionPage] = useState(0);
const [subscriptionTotal, setSubscriptionTotal] = useState(0);


const [conversionActivity, setConversionActivity] = useState([]);
const [activityLoading, setActivityLoading] = useState(false);
const [activityError, setActivityError] = useState('');
const [activitySearch, setActivitySearch] = useState('');
const [activityStartDate, setActivityStartDate] = useState('');
const [activityEndDate, setActivityEndDate] = useState('');
const [activityPage, setActivityPage] = useState(0);
const [activityTotal, setActivityTotal] = useState(0);
const [activityTotalConversions, setActivityTotalConversions] = useState(0);

const [payments, setPayments] = useState([]);
const [paymentsLoading, setPaymentsLoading] = useState(false);
const [paymentsError, setPaymentsError] = useState('');
const [paymentSearch, setPaymentSearch] = useState('');
const [paymentStatus, setPaymentStatus] = useState('all');
const [paymentPage, setPaymentPage] = useState(0);
const [paymentTotal, setPaymentTotal] = useState(0);
const [paymentRevenueKobo, setPaymentRevenueKobo] = useState(0);

const PAYMENTS_PER_PAGE = 10;

const ACTIVITY_PER_PAGE = 10;

const SUBSCRIPTIONS_PER_PAGE = 10;

const USERS_PER_PAGE = 10;

const fetchStats = async (isRefresh = false) => {
  if (isRefresh) {
    setRefreshing(true);
  } else {
    setStatsLoading(true);
  }

  setStatsError('');

  try {
    const { data, error } = await supabase.rpc(
      'get_vydora_admin_overview'
    );

    if (error) throw error;

    setStats(data);
  } catch (error) {
    console.error('Failed to load admin statistics:', error);
    setStatsError(
      error.message || 'Unable to load dashboard statistics.'
    );
  } finally {
    setStatsLoading(false);
    setRefreshing(false);
  }
};

useEffect(() => {
  fetchStats();
}, []);

const fetchUsers = async (page = userPage, search = userSearch) => {
  setUsersLoading(true);
  setUsersError('');

  try {
    const { data, error } = await supabase.rpc(
      'get_vydora_admin_users',
      {
        p_search: search.trim(),
        p_limit: USERS_PER_PAGE,
        p_offset: page * USERS_PER_PAGE,
      }
    );

    if (error) throw error;

    setUsers(data?.users || []);
    setUserTotal(Number(data?.total || 0));
  } catch (error) {
    console.error('Failed to load admin users:', error);
    setUsersError(
      error.message || 'Unable to load registered users.'
    );
    setUsers([]);
    setUserTotal(0);
  } finally {
    setUsersLoading(false);
  }
};


const fetchSubscriptions = async (
  page = subscriptionPage,
  search = subscriptionSearch,
  status = subscriptionStatus
) => {
  setSubscriptionsLoading(true);
  setSubscriptionsError('');

  try {
    const { data, error } = await supabase.rpc(
      'get_vydora_admin_subscriptions',
      {
        p_search: search.trim(),
        p_status: status,
        p_limit: SUBSCRIPTIONS_PER_PAGE,
        p_offset: page * SUBSCRIPTIONS_PER_PAGE,
      }
    );

    if (error) throw error;

    setSubscriptions(data?.subscriptions || []);
    setSubscriptionTotal(Number(data?.total || 0));
  } catch (error) {
    console.error('Failed to load subscriptions:', error);
    setSubscriptionsError(
      error.message || 'Unable to load subscriptions.'
    );
    setSubscriptions([]);
    setSubscriptionTotal(0);
  } finally {
    setSubscriptionsLoading(false);
  }
};


const fetchConversionActivity = async (
  page = activityPage,
  search = activitySearch,
  startDate = activityStartDate,
  endDate = activityEndDate
) => {
  setActivityLoading(true);
  setActivityError('');

  try {
    const { data, error } = await supabase.rpc(
      'get_vydora_admin_conversion_activity',
      {
        p_search: search.trim(),
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_limit: ACTIVITY_PER_PAGE,
        p_offset: page * ACTIVITY_PER_PAGE,
      }
    );

    if (error) throw error;

    setConversionActivity(data?.activity || []);
    setActivityTotal(Number(data?.total || 0));
    setActivityTotalConversions(
      Number(data?.total_conversions || 0)
    );
  } catch (error) {
    console.error('Failed to load conversion activity:', error);

    setActivityError(
      error.message || 'Unable to load conversion activity.'
    );

    setConversionActivity([]);
    setActivityTotal(0);
    setActivityTotalConversions(0);
  } finally {
    setActivityLoading(false);
  }
};


const fetchPayments = async (
  page = paymentPage,
  search = paymentSearch,
  status = paymentStatus
) => {
  setPaymentsLoading(true);
  setPaymentsError('');

  try {
    const { data, error } = await supabase.rpc(
      'get_vydora_admin_payments',
      {
        p_search: search.trim(),
        p_status: status,
        p_limit: PAYMENTS_PER_PAGE,
        p_offset: page * PAYMENTS_PER_PAGE,
      }
    );

    if (error) throw error;

    setPayments(data?.payments || []);
    setPaymentTotal(Number(data?.total || 0));
    setPaymentRevenueKobo(
      Number(data?.total_successful_amount_kobo || 0)
    );
  } catch (error) {
    console.error('Failed to load payment transactions:', error);

    setPaymentsError(
      error.message || 'Unable to load payment transactions.'
    );

    setPayments([]);
    setPaymentTotal(0);
    setPaymentRevenueKobo(0);
  } finally {
    setPaymentsLoading(false);
  }
};


useEffect(() => {
  if (activeSection === 'users') {
    fetchUsers();
  }
}, [activeSection, userPage]);

useEffect(() => {
  if (activeSection === 'subscriptions') {
    fetchSubscriptions();
  }
}, [activeSection, subscriptionPage, subscriptionStatus]);

useEffect(() => {
  if (activeSection === 'activity') {
    fetchConversionActivity();
  }
}, [activeSection, activityPage]);

useEffect(() => {
  if (activeSection === 'payments') {
    fetchPayments();
  }
}, [activeSection, paymentPage, paymentStatus]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Admin logout failed:', error);
      return;
    }

    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand-icon">
            <AudioLines size={22} />
          </span>
          <span>vydora <small>ADMIN</small></span>

          <button
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <p className="admin-nav-label">MANAGEMENT</p>

        <nav className="admin-nav">
      <button
  className={`admin-nav-item ${
    activeSection === 'overview' ? 'active' : ''
  }`}
  onClick={() => {
    setActiveSection('overview');
    setSidebarOpen(false);
  }}
>
            <LayoutDashboard size={19} />
            Overview
          </button>

         <button
  className={`admin-nav-item ${
    activeSection === 'users' ? 'active' : ''
  }`}
  onClick={() => {
    setActiveSection('users');
    setSidebarOpen(false);
    setUserPage(0);
  }}
>
  <Users size={19} />
  Users
</button>
        <button
  className={`admin-nav-item ${
    activeSection === 'subscriptions' ? 'active' : ''
  }`}
  onClick={() => {
    setActiveSection('subscriptions');
    setSidebarOpen(false);
    setSubscriptionPage(0);
  }}
>
  <CreditCard size={19} />
  Subscriptions
</button>

<button
  className={`admin-nav-item ${
    activeSection === 'activity' ? 'active' : ''
  }`}
  onClick={() => {
    setActiveSection('activity');
    setSidebarOpen(false);
    setActivityPage(0);
  }}
>
  <Activity size={19} />
  Conversion activity
</button>

<button
  className={`admin-nav-item ${
    activeSection === 'payments' ? 'active' : ''
  }`}
  onClick={() => {
    setActiveSection('payments');
    setSidebarOpen(false);
    setPaymentPage(0);
  }}
>
  <CreditCard size={19} />
  Payment Management
</button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-secure-label">
            <ShieldCheck size={17} />
            Protected admin area
          </div>

          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="admin-topbar-eyebrow">VYDORA CONTROL CENTER</p>
            <h1>Admin overview</h1>
          </div>

          <span className="admin-role-badge">
            <ShieldCheck size={16} />
            Administrator
          </span>
        </header>


{activeSection === 'overview' && (
  <>
        <section className="admin-welcome">
          <div>
            <h2>Welcome to Vydora Admin</h2>
            <p>
              Manage your platform, monitor subscriptions and keep
              your users' experience running smoothly.
            </p>
          </div>
          <div className="admin-welcome-icon">
            <AudioLines size={34} />
          </div>
        </section>

      
<section className="admin-stats-section">
  <div className="admin-stats-heading">
    <div>
      <h2>Platform overview</h2>
      <p>Live statistics from your Vydora database.</p>
    </div>

    <button
      className="admin-refresh-button"
      onClick={() => fetchStats(true)}
      disabled={statsLoading || refreshing}
    >
      <RefreshCw
        size={16}
        className={
          refreshing || statsLoading ? 'admin-refreshing' : ''
        }
      />
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>

  {statsError && (
    <div className="admin-stats-error">
      <p>{statsError}</p>
      <button onClick={() => fetchStats()}>
        Try again
      </button>
    </div>
  )}

  {statsLoading && !stats ? (
    <div className="admin-stats-loading">
      Loading platform statistics...
    </div>
  ) : stats ? (
    <>
      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={22} />
          </div>
          <p>Total users</p>
          <h3>{Number(stats.total_users || 0).toLocaleString()}</h3>
          <span>Registered accounts</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <FileAudio size={22} />
          </div>
          <p>Audio files</p>
          <h3>{Number(stats.total_audio_files || 0).toLocaleString()}</h3>
          <span>Files in the library</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <CreditCard size={22} />
          </div>
          <p>Subscriptions</p>
          <h3>{Number(stats.total_subscriptions || 0).toLocaleString()}</h3>
          <span>All subscription records</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <CheckCircle2 size={22} />
          </div>
          <p>Active subscriptions</p>
          <h3>{Number(stats.active_subscriptions || 0).toLocaleString()}</h3>
          <span>Currently marked active</span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Activity size={22} />
          </div>
          <p>Conversions today</p>
          <h3>{Number(stats.conversions_today || 0).toLocaleString()}</h3>
          <span>Recorded usage for today (UTC)</span>
        </article>
      </div>

      <div className="admin-stats-note">
        <ShieldCheck size={18} />
        Statistics are retrieved through an administrator-verified
        database function.
      </div>
    </>
  ) : !statsError ? (
    <div className="admin-stats-loading">
      No statistics were returned.
    </div>
  ) : null}
</section>
  </>
)}


{activeSection === 'users' && (
  <section className="admin-users-section">
    <div className="admin-stats-heading">
      <div>
        <h2>User management</h2>
        <p>
          {userTotal.toLocaleString()} registered accounts
        </p>
      </div>

      <button
        className="admin-refresh-button"
        onClick={() => fetchUsers(userPage, userSearch)}
        disabled={usersLoading}
      >
        <RefreshCw
          size={16}
          className={usersLoading ? 'admin-refreshing' : ''}
        />
        Refresh
      </button>
    </div>

    <form
      className="admin-user-search"
      onSubmit={(event) => {
        event.preventDefault();
        setUserPage(0);
        fetchUsers(0, userSearch);
      }}
    >
      <Search size={19} />
      <input
        type="search"
        placeholder="Search users by email..."
        value={userSearch}
        onChange={(event) => setUserSearch(event.target.value)}
      />
      <button type="submit" disabled={usersLoading}>
        Search
      </button>
    </form>

    {usersError && (
      <div className="admin-stats-error">
        <p>{usersError}</p>
        <button onClick={() => fetchUsers()}>
          Try again
        </button>
      </div>
    )}

    <div className="admin-users-table-wrap">
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Joined</th>
          </tr>
        </thead>

        <tbody>
          {usersLoading ? (
            <tr>
              <td colSpan={3} className="admin-table-message">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={3} className="admin-table-message">
                {usersError ? 'Unable to load users.' : 'No users found.'}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="admin-user-identity">
                    <span className="admin-user-avatar">
                      {(user.email || '?').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{user.email || 'No email'}</strong>
                      <span>
                        <Mail size={13} />
                        Registered user
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    className={`admin-plan-badge ${
                      user.plan?.toLowerCase() === 'pro'
                        ? 'pro'
                        : 'free'
                    }`}
                  >
                    {user.plan || 'free'}
                  </span>
                </td>

                <td>
                  <span className="admin-user-date">
                    <CalendarDays size={15} />
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="admin-users-pagination">
      <span>
        {userTotal === 0
          ? 'No accounts'
          : `Showing ${userPage * USERS_PER_PAGE + 1}–${Math.min(
              (userPage + 1) * USERS_PER_PAGE,
              userTotal
            )} of ${userTotal}`}
      </span>

      <div>
        <button
          aria-label="Previous page"
          disabled={userPage === 0 || usersLoading}
          onClick={() => setUserPage((page) => page - 1)}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          aria-label="Next page"
          disabled={
            usersLoading ||
            (userPage + 1) * USERS_PER_PAGE >= userTotal
          }
          onClick={() => setUserPage((page) => page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  </section>
)}




{activeSection === 'subscriptions' && (
  <section className="admin-users-section">
    <div className="admin-stats-heading">
      <div>
        <h2>Subscription management</h2>
        <p>
          {subscriptionTotal.toLocaleString()} subscription records
        </p>
      </div>

      <button
        className="admin-refresh-button"
        onClick={() =>
          fetchSubscriptions(
            subscriptionPage,
            subscriptionSearch,
            subscriptionStatus
          )
        }
        disabled={subscriptionsLoading}
      >
        <RefreshCw
          size={16}
          className={subscriptionsLoading ? 'admin-refreshing' : ''}
        />
        Refresh
      </button>
    </div>

    <form
      className="admin-user-search"
      onSubmit={(event) => {
        event.preventDefault();
        setSubscriptionPage(0);
        fetchSubscriptions(0, subscriptionSearch, subscriptionStatus);
      }}
    >
      <Search size={19} />

      <input
        type="search"
        placeholder="Search email, user ID, payment reference..."
        value={subscriptionSearch}
        onChange={(event) => setSubscriptionSearch(event.target.value)}
      />

      <button type="submit" disabled={subscriptionsLoading}>
        Search
      </button>
    </form>

    <div className="admin-subscription-filters">
      <label htmlFor="subscription-status">Status:</label>

      <select
        id="subscription-status"
        value={subscriptionStatus}
        onChange={(event) => {
          setSubscriptionStatus(event.target.value);
          setSubscriptionPage(0);
        }}
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="cancelled">Cancelled</option>
        <option value="inactive">Inactive</option>
        <option value="failed">Failed</option>
      </select>
    </div>

    {subscriptionsError && (
      <div className="admin-stats-error">
        <p>{subscriptionsError}</p>
        <button
          onClick={() =>
            fetchSubscriptions(
              subscriptionPage,
              subscriptionSearch,
              subscriptionStatus
            )
          }
        >
          Try again
        </button>
      </div>
    )}

    <div className="admin-users-table-wrap">
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Payment reference</th>
            <th>Created</th>
            <th>Period ends</th>
          </tr>
        </thead>

        <tbody>
          {subscriptionsLoading ? (
            <tr>
              <td colSpan={6} className="admin-table-message">
                Loading subscriptions...
              </td>
            </tr>
          ) : subscriptions.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-table-message">
                {subscriptionsError
                  ? 'Unable to load subscriptions.'
                  : 'No subscriptions found.'}
              </td>
            </tr>
          ) : (
            subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>
                  <div className="admin-user-identity">
                    <span className="admin-user-avatar">
                      {(subscription.email || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <div>
                      <strong>
                        {subscription.email || 'No email'}
                      </strong>
                      <span>
                        <Mail size={13} />
                        {subscription.user_id
                          ? `${subscription.user_id.slice(0, 8)}…`
                          : 'Unknown user'}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="admin-plan-badge">
                    {subscription.plan_code || 'Unspecified'}
                  </span>
                </td>

                <td>
                  <span
                    className={`admin-plan-badge ${
                      (subscription.status || '').toLowerCase() === 'active'
                        ? 'pro'
                        : 'free'
                    }`}
                  >
                    {subscription.status || 'Unknown'}
                  </span>
                </td>

                <td>
                  <span className="admin-subscription-reference">
                    {subscription.payment_reference || '—'}
                  </span>
                </td>

                <td>
                  {subscription.created_at
                    ? new Date(subscription.created_at).toLocaleDateString()
                    : '—'}
                </td>

                <td>
                  {subscription.current_period_end
                    ? new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="admin-users-pagination">
      <span>
        {subscriptionTotal === 0
          ? 'No subscriptions'
          : `Showing ${
              subscriptionPage * SUBSCRIPTIONS_PER_PAGE + 1
            }–${Math.min(
              (subscriptionPage + 1) * SUBSCRIPTIONS_PER_PAGE,
              subscriptionTotal
            )} of ${subscriptionTotal}`}
      </span>

      <div>
        <button
          aria-label="Previous subscription page"
          disabled={subscriptionPage === 0 || subscriptionsLoading}
          onClick={() =>
            setSubscriptionPage((page) => page - 1)
          }
        >
          <ChevronLeft size={18} />
        </button>

        <button
          aria-label="Next subscription page"
          disabled={
            subscriptionsLoading ||
            (subscriptionPage + 1) * SUBSCRIPTIONS_PER_PAGE >=
              subscriptionTotal
          }
          onClick={() =>
            setSubscriptionPage((page) => page + 1)
          }
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  </section>
)}




{activeSection === 'activity' && (
  <section className="admin-users-section">
    <div className="admin-users-header">
      <div>
        <h2>Conversion Activity</h2>
        <p>Monitor users' daily conversion usage.</p>
      </div>

      <button
        className="admin-refresh-button"
        onClick={() =>
          fetchConversionActivity(
            activityPage,
            activitySearch,
            activityStartDate,
            activityEndDate
          )
        }
        disabled={activityLoading}
      >
        <RefreshCw
          size={16}
          className={activityLoading ? 'admin-spin' : ''}
        />
        Refresh
      </button>
    </div>

    {activityError && (
      <div className="admin-error-message">
        <p>{activityError}</p>
        <button
          type="button"
          onClick={() =>
            fetchConversionActivity(
              activityPage,
              activitySearch,
              activityStartDate,
              activityEndDate
            )
          }
        >
          Try again
        </button>
      </div>
    )}

    {/* Summary cards */}
    <div className="admin-activity-summary">
      <div className="admin-activity-card">
        <div className="admin-activity-card-icon">
          <Activity size={20} />
        </div>
        <div>
          <p>Total conversions</p>
          <h3>
            {activityTotalConversions.toLocaleString()}
          </h3>
          <span>For the selected filters</span>
        </div>
      </div>

      <div className="admin-activity-card">
        <div className="admin-activity-card-icon">
          <FileAudio size={20} />
        </div>
        <div>
          <p>Usage records</p>
          <h3>{activityTotal.toLocaleString()}</h3>
          <span>Matching records</span>
        </div>
      </div>
    </div>

    {/* Search and date filters */}
    <form
      className="admin-activity-filters"
      onSubmit={(event) => {
        event.preventDefault();

        if (
          activityStartDate &&
          activityEndDate &&
          activityStartDate > activityEndDate
        ) {
          setActivityError(
            'Start date cannot be later than end date.'
          );
          return;
        }

        setActivityPage(0);
        fetchConversionActivity(
          0,
          activitySearch,
          activityStartDate,
          activityEndDate
        );
      }}
    >
      <div className="admin-activity-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search email or user ID..."
          value={activitySearch}
          onChange={(event) =>
            setActivitySearch(event.target.value)
          }
        />
      </div>

      <div className="admin-activity-date">
        <label htmlFor="activity-start-date">From</label>
        <input
          id="activity-start-date"
          type="date"
          value={activityStartDate}
          onChange={(event) =>
            setActivityStartDate(event.target.value)
          }
        />
      </div>

      <div className="admin-activity-date">
        <label htmlFor="activity-end-date">To</label>
        <input
          id="activity-end-date"
          type="date"
          value={activityEndDate}
          onChange={(event) =>
            setActivityEndDate(event.target.value)
          }
        />
      </div>

      <button
        className="admin-activity-filter-button"
        type="submit"
        disabled={activityLoading}
      >
        Apply filters
      </button>

      <button
        className="admin-activity-clear-button"
        type="button"
        onClick={() => {
          setActivitySearch('');
          setActivityStartDate('');
          setActivityEndDate('');
          setActivityPage(0);
          fetchConversionActivity(0, '', '', '');
        }}
        disabled={activityLoading}
      >
        Clear
      </button>
    </form>

    {/* Activity table */}
    <div className="admin-users-table-wrap">
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Usage date</th>
            <th>Conversions used</th>
          </tr>
        </thead>

        <tbody>
          {activityLoading ? (
            <tr>
              <td colSpan="3" className="admin-table-message">
                Loading conversion activity...
              </td>
            </tr>
          ) : activityError ? (
            <tr>
              <td colSpan="3" className="admin-table-message">
                Unable to load activity.
              </td>
            </tr>
          ) : conversionActivity.length === 0 ? (
            <tr>
              <td colSpan="3" className="admin-table-message">
                No conversion activity found for these filters.
              </td>
            </tr>
          ) : (
            conversionActivity.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="admin-user-identity">
                    <div className="admin-user-avatar">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="admin-activity-email">
                        {item.email || 'Unknown user'}
                      </span>
                      <small className="admin-activity-user-id">
                        {item.user_id}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="admin-activity-date-value">
                    <CalendarDays size={15} />
                    {item.usage_date
                      ? new Date(
                          `${item.usage_date}T00:00:00`
                        ).toLocaleDateString()
                      : '—'}
                  </span>
                </td>

                <td>
                  <span className="admin-activity-count">
                    {Number(
                      item.conversions_used || 0
                    ).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="admin-users-pagination">
      <span>
        {activityTotal === 0
          ? 'No records'
          : `Showing ${activityPage * ACTIVITY_PER_PAGE + 1}–${Math.min(
              (activityPage + 1) * ACTIVITY_PER_PAGE,
              activityTotal
            )} of ${activityTotal.toLocaleString()} records`}
      </span>

      <div className="admin-pagination-controls">
        <button
          type="button"
          onClick={() =>
            setActivityPage((page) => Math.max(0, page - 1))
          }
          disabled={activityPage === 0 || activityLoading}
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
        </button>

        <span>Page {activityPage + 1}</span>

        <button
          type="button"
          onClick={() =>
            setActivityPage((page) => page + 1)
          }
          disabled={
            activityLoading ||
            (activityPage + 1) * ACTIVITY_PER_PAGE >= activityTotal
          }
          aria-label="Next page"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  </section>
)}


{activeSection === 'payments' && (
  <section className="admin-users-section">
    <div className="admin-stats-heading">
      <div>
        <h2>Payment Management</h2>
        <p>
          {paymentTotal.toLocaleString()} matching payment records
        </p>
      </div>

      <button
        className="admin-refresh-button"
        onClick={() =>
          fetchPayments(paymentPage, paymentSearch, paymentStatus)
        }
        disabled={paymentsLoading}
      >
        <RefreshCw
          size={16}
          className={paymentsLoading ? 'admin-refreshing' : ''}
        />
        Refresh
      </button>
    </div>

    <div className="admin-activity-summary">
      <div className="admin-activity-card">
        <div className="admin-activity-card-icon">
          <CreditCard size={20} />
        </div>
        <div>
          <p>Matching transactions</p>
          <h3>{paymentTotal.toLocaleString()}</h3>
          <span>Based on your current filters</span>
        </div>
      </div>

      <div className="admin-activity-card">
        <div className="admin-activity-card-icon">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p>Successful payment amount</p>
          <h3>
            {new Intl.NumberFormat('en-NG', {
              style: 'currency',
              currency: 'NGN',
              maximumFractionDigits: 2,
            }).format(paymentRevenueKobo / 100)}
          </h3>
          <span>Successful payments matching filters</span>
        </div>
      </div>
    </div>

    <form
      className="admin-activity-filters"
      onSubmit={(event) => {
        event.preventDefault();
        setPaymentPage(0);
        fetchPayments(0, paymentSearch, paymentStatus);
      }}
    >
      <div className="admin-activity-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search email, reference or user ID..."
          value={paymentSearch}
          onChange={(event) =>
            setPaymentSearch(event.target.value)
          }
        />
      </div>

      <div className="admin-activity-date">
        <label htmlFor="payment-status">Payment status</label>
        <select
          id="payment-status"
          value={paymentStatus}
          onChange={(event) => {
            setPaymentStatus(event.target.value);
            setPaymentPage(0);
          }}
        >
          <option value="all">All statuses</option>
          <option value="success">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>

      <button
        className="admin-activity-filter-button"
        type="submit"
        disabled={paymentsLoading}
      >
        Search
      </button>

      <button
        className="admin-activity-clear-button"
        type="button"
        onClick={() => {
          setPaymentSearch('');
          setPaymentStatus('all');
          setPaymentPage(0);
          fetchPayments(0, '', 'all');
        }}
        disabled={paymentsLoading}
      >
        Clear
      </button>
    </form>

    {paymentsError && (
      <div className="admin-error-message">
        <p>{paymentsError}</p>
        <button
          type="button"
          onClick={() =>
            fetchPayments(paymentPage, paymentSearch, paymentStatus)
          }
        >
          Try again
        </button>
      </div>
    )}

    <div className="admin-users-table-wrap">
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Channel</th>
            <th>Reference</th>
            <th>Paid at</th>
          </tr>
        </thead>

        <tbody>
          {paymentsLoading ? (
            <tr>
              <td colSpan={6} className="admin-table-message">
                Loading payment records...
              </td>
            </tr>
          ) : paymentsError ? (
            <tr>
              <td colSpan={6} className="admin-table-message">
                Unable to load payment records.
              </td>
            </tr>
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={6} className="admin-table-message">
                No payment records found. Records will appear here
                when payments are saved to the database.
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id}>
                <td>
                  <div className="admin-user-identity">
                    <span className="admin-user-avatar">
                      {(payment.email || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <div>
                      <strong>
                        {payment.email || 'No email'}
                      </strong>
                      <span>
                        {payment.user_id
                          ? `${payment.user_id.slice(0, 8)}…`
                          : 'Unknown user'}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <strong>
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: payment.currency || 'NGN',
                    }).format(
                      Number(payment.amount_kobo || 0) / 100
                    )}
                  </strong>
                </td>

                <td>
                  <span
                    className={`admin-plan-badge ${
                      payment.status === 'success'
                        ? 'pro'
                        : 'free'
                    }`}
                  >
                    {payment.status || 'Unknown'}
                  </span>
                </td>

                <td>{payment.channel || '—'}</td>

                <td>
                  <span className="admin-subscription-reference">
                    {payment.reference || '—'}
                  </span>
                </td>

                <td>
                  {payment.paid_at
                    ? new Date(payment.paid_at).toLocaleString()
                    : payment.created_at
                      ? new Date(
                          payment.created_at
                        ).toLocaleString()
                      : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="admin-users-pagination">
      <span>
        {paymentTotal === 0
          ? 'No payments'
          : `Showing ${
              paymentPage * PAYMENTS_PER_PAGE + 1
            }–${Math.min(
              (paymentPage + 1) * PAYMENTS_PER_PAGE,
              paymentTotal
            )} of ${paymentTotal.toLocaleString()}`}
      </span>

      <div className="admin-pagination-controls">
        <button
          type="button"
          aria-label="Previous payments page"
          disabled={paymentPage === 0 || paymentsLoading}
          onClick={() =>
            setPaymentPage((page) => Math.max(0, page - 1))
          }
        >
          <ChevronLeft size={17} />
        </button>

        <span>Page {paymentPage + 1}</span>

        <button
          type="button"
          aria-label="Next payments page"
          disabled={
            paymentsLoading ||
            (paymentPage + 1) * PAYMENTS_PER_PAGE >= paymentTotal
          }
          onClick={() =>
            setPaymentPage((page) => page + 1)
          }
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  </section>
)}


      </main>
    </div>
  );
}

export default Admin;
