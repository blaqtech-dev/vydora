
import { useEffect, useState } from 'react';
import {
  AudioLines,
  LayoutDashboard,
  RefreshCw,
  FolderOpen,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  FileAudio,
  LogOut,
  Plus,
  Play,
  Menu,
  UserRound,
  ChevronDown,
  X,
  HardDrive,
  Download,
  LoaderCircle,
} from 'lucide-react';
import {
  getCloudAudioFiles,
  downloadCloudAudio,
} from '../../services/cloudaudiostorage.js';
import './dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDate = (date) => {
  if (!date) return 'Unknown';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'Unknown';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (parsedDate.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (parsedDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getFormat = (file) => {
  const extension = file.name?.split('.').pop()?.toUpperCase();

  return extension || 'AUDIO';
};

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
const [user, setUser] = useState(null);
const [profileMenuOpen, setProfileMenuOpen] = useState(false);
 
useEffect(() => {
  let cancelled = false;

  const loadDashboardAudio = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const savedFiles = await getCloudAudioFiles();

      if (!cancelled) {
        setFiles(savedFiles);
      }
    } catch (error) {
      console.error('Could not load dashboard audio:', error);

      if (!cancelled) {
        setLoadError(
          'Unable to load your cloud audio. Please refresh the page.',
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadDashboardAudio();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  let mounted = true;

  const loadUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Could not load user profile:', error);
      return;
    }

    if (mounted) {
      setUser(data.user);
    }
  };

  loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (mounted) {
      setUser(session?.user ?? null);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

const displayName =
  user?.user_metadata?.display_name ||
  user?.user_metadata?.full_name ||
  user?.email?.split('@')[0] ||
  'User';

const initials = displayName
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0].toUpperCase())
  .join('');


  const totalStorage = files.reduce(
    (total, file) => total + (file.size || file.blob?.size || 0),
    0,
  );

  const latestFile = files[0];

 
const handleDownload = async (file) => {
  try {
    const blob = await downloadCloudAudio(file.storagePath);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Dashboard download failed:', error);
    window.alert('Could not download this audio file. Please try again.');
  }
};



  const navigate = useNavigate();
const [loggingOut, setLoggingOut] = useState(false);

const handleLogout = async () => {
  if (loggingOut) return;

  setLoggingOut(true);

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    navigate('/login', { replace: true });
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Unable to log out. Please try again.');
  } finally {
    setLoggingOut(false);
  }
};

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <button
          className="dashboard-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? 'dashboard-sidebar-open' : ''
        }`}
      >
        <Link to="/" className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <AudioLines size={22} />
          </span>
          vydora
        </Link>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="dashboard-nav">
          <Link
            to="/dashboard"
            className="dashboard-nav-link dashboard-nav-active"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/convert"
            className="dashboard-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <RefreshCw size={19} />
            <span>Convert video</span>
          </Link>

          <Link
            to="/storage"
            className="dashboard-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <FolderOpen size={19} />
            <span>My storage</span>
          </Link>
        </nav>

        <div className="sidebar-section-label sidebar-settings-label">
          PREFERENCES
        </div>

        <nav className="dashboard-nav">
          <Link
            to="/settings"
            className="dashboard-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={19} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-icon">
            <AudioLines size={20} />
          </div>
          <strong>Need a hand?</strong>
          <p>Your audio workspace, made simple.</p>
          <Link to="/#how-it-works">
            Learn how Vydora works <ArrowRight size={14} />
          </Link>

          <button
  type="button"
  className="dashboard-logout-button"
  onClick={handleLogout}
  disabled={loggingOut}
>
  <LogOut size={17} />
  <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
</button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="dashboard-menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div className="dashboard-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Dashboard</strong>
          </div>



        <div className="dashboard-topbar-actions">
  <div className="dashboard-profile-menu">
    <button
      type="button"
      className="dashboard-avatar"
      aria-label="Open user profile menu"
      aria-expanded={profileMenuOpen}
      onClick={() => setProfileMenuOpen((open) => !open)}
    >
      {user?.user_metadata?.avatar_url ? (
  <img
    className="dashboard-avatar-image"
    src={user.user_metadata.avatar_url}
    alt="Your profile"
  />
) : (
  initials || <UserRound size={20} />
)}
<ChevronDown size={14} />
    </button>

    {profileMenuOpen && (
      <div className="dashboard-profile-dropdown">
        <div className="dashboard-profile-info">
          <strong>{displayName}</strong>
          <span>{user?.email || ''}</span>
        </div>

        <div className="dashboard-profile-divider" />

        <Link
          to="/profile"
          onClick={() => setProfileMenuOpen(false)}
        >
          <UserRound size={17} />
          My profile
        </Link>

        <Link
          to="/settings"
          onClick={() => setProfileMenuOpen(false)}
        >
          <Settings size={17} />
          Settings
        </Link>

        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            handleLogout();
          }}
          disabled={loggingOut}
        >
          <LogOut size={17} />
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    )}
  </div>
</div>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
              <h1>
                Welcome to Vydora <span>👋</span>
              </h1>
              <p>Your videos have a soundtrack waiting to be heard.</p>
            </div>

            <Link to="/convert" className="dashboard-primary-button">
              <Plus size={18} />
              Convert a video
            </Link>
          </section>

          <section className="dashboard-hero-card">
            <div className="dashboard-hero-copy">
              <span className="dashboard-hero-label">
                <AudioLines size={15} /> VIDEO TO AUDIO
              </span>

              <h2>
                Keep the sound.
                <br />
                Leave the video behind.
              </h2>

              <p>
                Turn videos into audio files, listen whenever you want,
                and keep your conversions organized in one place.
              </p>

              <Link to="/convert" className="dashboard-hero-button">
                Start a conversion <ArrowRight size={17} />
              </Link>
            </div>

            <div className="dashboard-hero-art" aria-hidden="true">
              <div className="hero-art-circle hero-art-circle-one" />
              <div className="hero-art-circle hero-art-circle-two" />

              <div className="hero-art-card">
                <div className="hero-art-icon">
                  <AudioLines size={34} />
                </div>

                <div className="hero-art-wave">
                  {Array.from({ length: 27 }, (_, index) => (
                    <span
                      key={index}
                      style={{
                        height: `${13 + ((index * 13 + 7) % 39)}px`,
                      }}
                    />
                  ))}
                </div>

                <div className="hero-art-duration">
                  <span>YOUR NEXT AUDIO</span>
                  <strong>Ready when you are</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-purple">
                <FileAudio size={21} />
              </div>

              <div>
                <span>Total audio files</span>
                <h3>
                  {loading ? '—' : String(files.length).padStart(2, '0')}
                </h3>
                <p>Saved in your library</p>
              </div>

              <ArrowUpRight
                className="dashboard-stat-arrow"
                size={18}
              />
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-blue">
                <HardDrive size={21} />
              </div>

              <div>
                <span>Storage used</span>
                <h3>{loading ? '—' : formatBytes(totalStorage)}</h3>
                <p>Stored in this browser</p>
              </div>

              <ArrowUpRight
                className="dashboard-stat-arrow"
                size={18}
              />
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stat-green">
                <Clock3 size={21} />
              </div>

              <div>
                <span>Last activity</span>
                <h3>{loading ? '—' : latestFile ? formatDate(latestFile.createdAt) : '—'}</h3>
                <p>{latestFile ? latestFile.name : 'No conversions yet'}</p>
              </div>

              <ArrowUpRight
                className="dashboard-stat-arrow"
                size={18}
              />
            </article>
          </section>

          <section className="dashboard-recent-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Recent audio</h2>
                <p>Your latest saved conversions in one place.</p>
              </div>

              <Link to="/storage" className="dashboard-view-all">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="dashboard-files-card">
              <div className="dashboard-files-header">
                <span>FILE NAME</span>
                <span>DATE ADDED</span>
                <span>DURATION</span>
                <span>FORMAT</span>
                <span />
              </div>

              {loading ? (
                <div className="dashboard-state-message">
                  <LoaderCircle className="dashboard-loading-icon" size={22} />
                  <span>Loading your audio library...</span>
                </div>
              ) : loadError ? (
                <div className="dashboard-state-message" role="alert">
                  {loadError}
                </div>
              ) : files.length === 0 ? (
                <div className="dashboard-state-message dashboard-empty-state">
                  <div className="dashboard-empty-icon">
                    <FileAudio size={25} />
                  </div>
                  <strong>No audio files yet</strong>
                  <p>Your converted audio files will appear here.</p>
                  <Link to="/convert" className="dashboard-empty-button">
                    <Plus size={16} /> Convert your first video
                  </Link>
                </div>
              ) : (
                files.slice(0, 5).map((file) => (
                  <div className="dashboard-file-row" key={file.id}>
                    <div className="dashboard-file-name">
                      <div className="dashboard-file-icon">
                        <FileAudio size={19} />
                      </div>

                      <div>
                        <strong title={file.name}>{file.name}</strong>
                        <span>{formatBytes(file.size || file.blob?.size || 0)}</span>
                      </div>
                    </div>

                    <span className="dashboard-file-date">
                      {formatDate(file.createdAt)}
                    </span>

                    <span className="dashboard-file-duration">—</span>

                    <span className="dashboard-file-format">
                      {getFormat(file)}
                    </span>

                    <button
                      className="dashboard-file-more"
                      aria-label={`Download ${file.name}`}
                      title="Download audio"
                      onClick={() => handleDownload(file)}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))
              )}

              <div className="dashboard-files-footer">
                <span>
                  {loading
                    ? 'Loading files'
                    : `Showing ${Math.min(files.length, 5)} of ${files.length} files`}
                </span>

                <Link to="/storage">
                  Open audio library <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          <section className="dashboard-bottom-cta">
            <div className="dashboard-bottom-icon">
              <Play size={20} />
            </div>

            <div>
              <h3>Ready to create your next audio?</h3>
              <p>Choose a video and let Vydora handle the conversion.</p>
            </div>

            <Link to="/convert" className="dashboard-bottom-link">
              Get started <ArrowRight size={16} />
            </Link>
          </section>

          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} Vydora</span>
            <span>Made for the love of listening.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
