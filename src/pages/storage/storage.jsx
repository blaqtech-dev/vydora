
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AudioLines,
  ArrowDownToLine,
  ArrowLeft,
  Clock3,
  FileAudio,
  FolderOpen,
  LoaderCircle,
  MoreHorizontal,
  Music2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';


import {
  deleteCloudAudio,
  downloadCloudAudio,
  getCloudAudioFiles,
  getCloudAudioUrl,
  renameCloudAudio,
} from '../../services/cloudaudiostorage.js';


import './storage.css';

const formatBytes = (bytes = 0) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function Storage() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
const [audioUrls, setAudioUrls] = useState({});

 
const loadFiles = useCallback(async () => {
  setLoading(true);
  setError('');

  try {
    const savedFiles = await getCloudAudioFiles();
    setFiles(savedFiles);
  } catch (loadError) {
    console.error('Could not load Vydora cloud audio:', loadError);
    setError('Your cloud audio library could not be loaded. Please refresh the page.');
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

 
useEffect(() => {
  let cancelled = false;

  const loadAudioUrls = async () => {
    const entries = await Promise.all(
      files.map(async (file) => {
        try {
          const url = await getCloudAudioUrl(file.storagePath);
          return [file.id, url];
        } catch (error) {
          console.error(`Could not prepare playback for ${file.name}:`, error);
          return [file.id, null];
        }
      }),
    );

    if (!cancelled) {
      setAudioUrls(Object.fromEntries(entries));
    }
  };

  setAudioUrls({});
  loadAudioUrls();

  return () => {
    cancelled = true;
  };
}, [files]);


  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

 
const handleRename = async (file) => {
  const newName = window.prompt(
    'Enter a new name for this audio file:',
    file.name,
  );

  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    window.alert('Please enter a file name.');
    return;
  }

  try {
    await renameCloudAudio(file.id, cleanName);
    await loadFiles();
    setActiveMenu(null);
  } catch (renameError) {
    console.error('Could not rename cloud audio:', renameError);
    window.alert('Could not rename this file. Please try again.');
  }
};

const handleDelete = async (file) => {
  const confirmed = window.confirm(
    `Delete "${file.name}" from your cloud audio library? This cannot be undone.`,
  );

  if (!confirmed) return;

  try {
    await deleteCloudAudio(file);
    await loadFiles();
    setActiveMenu(null);
  } catch (deleteError) {
    console.error('Could not delete cloud audio:', deleteError);
    window.alert('Could not delete this file. Please try again.');
  }
};

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
  } catch (downloadError) {
    console.error('Could not download cloud audio:', downloadError);
    window.alert('Could not download this file. Please try again.');
  }
};


  return (
    <div className="storage-page">
      <header className="storage-topbar">
        <Link to="/dashboard" className="storage-brand">
          <span className="storage-brand-icon">
            <AudioLines size={21} />
          </span>
          vydora
        </Link>

        <Link to="/dashboard" className="storage-back">
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </header>

      <main className="storage-main">
        <div className="storage-heading">
          <div>
            <span className="storage-eyebrow">
              <FolderOpen size={15} />
              YOUR COLLECTION
            </span>
            <h1>Your audio library</h1>
            <p>
              Your converted audio, organised in one place.
            </p>
          </div>

          <Link to="/convert" className="storage-add-button">
            <Plus size={18} />
            Convert video
          </Link>
        </div>

        <section className="storage-summary">
          <div className="storage-summary-icon">
            <Music2 size={23} />
          </div>
          <div>
            <span>Saved audio files</span>
            <strong>{files.length}</strong>
          </div>
          <div className="storage-summary-note">
            <ShieldCheck size={17} />
          Stored securely in the cloud
          </div>
        </section>

        <section className="storage-library">
          <div className="storage-library-heading">
            <div>
              <h2>All audio files</h2>
              <p>
                {files.length} {files.length === 1 ? 'file' : 'files'} saved
              </p>
            </div>

            <label className="storage-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your audio..."
                aria-label="Search audio files"
              />
            </label>
          </div>

          {error && (
            <div className="storage-error" role="alert">
              {error}
              <button type="button" onClick={loadFiles}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="storage-loading">
              <LoaderCircle className="storage-spinner" size={25} />
              <span>Loading your audio library...</span>
            </div>
          ) : !error && filteredFiles.length === 0 ? (
            <div className="storage-empty">
              <div className="storage-empty-icon">
                {search ? <Search size={27} /> : <FileAudio size={29} />}
              </div>

              <h3>
                {search ? 'No matching audio' : 'Your library is waiting'}
              </h3>

              <p>
                {search
                  ? 'Try another search term.'
                  : 'Convert your first video and save the audio here.'}
              </p>

              {!search && (
                <Link to="/convert" className="storage-empty-button">
                  <Plus size={17} />
                  Convert a video
                </Link>
              )}
            </div>
          ) : (
            <div className="storage-file-list">
              {filteredFiles.map((file) => (
                <article className="storage-file-card" key={file.id}>
                  <div className="storage-file-icon">
                    <Music2 size={22} />
                  </div>

                  <div className="storage-file-details">
                    <strong title={file.name}>{file.name}</strong>

                    <div className="storage-file-meta">
                      <span>{formatBytes(file.size)}</span>
                      <span className="storage-meta-dot">·</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>

                    <audio
                      className="storage-audio-player"
                      controls
                      preload="none"
                   src={audioUrls[file.id]}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>

                  <div className="storage-file-actions">
                    <button
                      type="button"
                      className="storage-icon-button"
                      onClick={() => handleDownload(file)}
                      title="Download audio"
                      aria-label={`Download ${file.name}`}
                    >
                      <ArrowDownToLine size={18} />
                    </button>

                    <div className="storage-menu-wrap">
                      <button
                        type="button"
                        className="storage-icon-button"
                        onClick={() =>
                          setActiveMenu(activeMenu === file.id ? null : file.id)
                        }
                        title="More actions"
                        aria-label={`More actions for ${file.name}`}
                        aria-expanded={activeMenu === file.id}
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {activeMenu === file.id && (
                        <div className="storage-action-menu">
                          <button
                            type="button"
                            onClick={() => handleRename(file)}
                          >
                            <Pencil size={15} />
                            Rename
                          </button>

                          <button
                            type="button"
                            className="storage-delete-action"
                            onClick={() => handleDelete(file)}
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="storage-footnote">
         <Clock3 size={16} />
<span>
  Your audio files are stored in your private Vydora cloud library
  and can be accessed when you sign in.
</span>
        </div>
      </main>
    </div>
  );
}

export default Storage;
