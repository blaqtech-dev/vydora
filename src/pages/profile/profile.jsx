
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserRound,
  Mail,
  Save,
  LoaderCircle,
  CheckCircle2,
  ImagePlus,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
const [previewUrl, setPreviewUrl] = useState('');
const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        setError('Unable to load your profile. Please try again.');
        setLoading(false);
        return;
      }

      setUser(data.user);
      setDisplayName(
        data.user.user_metadata?.display_name ||
        data.user.user_metadata?.full_name ||
        '',
      );
      setLoading(false);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);


  const handleImageChange = (event) => {
  const file = event.target.files?.[0];

  // Allow selecting the same file again later.
  event.target.value = '';

  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    setError('Choose a JPG, PNG, or WebP image.');
    setSuccess('');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError('Your profile picture must be 5 MB or smaller.');
    setSuccess('');
    return;
  }

  setError('');
  setSuccess('');
  setSelectedImage(file);
  setPreviewUrl(URL.createObjectURL(file));
};

const handleImageUpload = async () => {
  if (!selectedImage || uploadingImage) return;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    setError('Cloudinary is not configured. Check your .env file.');
    return;
  }

  setUploadingImage(true);
  setError('');
  setSuccess('');

  try {
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message || 'Cloudinary could not upload your image.',
      );
    }

    const { data, error: updateError } =
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          avatar_url: result.secure_url,
        },
      });

    if (updateError) {
      throw updateError;
    }

    setUser(data.user);
    setSelectedImage(null);
    setPreviewUrl('');
    setSuccess('Your profile picture has been updated.');
  } catch (err) {
    console.error('Profile picture upload failed:', err);
    setError(err.message || 'Could not upload your profile picture.');
  } finally {
    setUploadingImage(false);
  }
};

  const handleSave = async (event) => {
    event.preventDefault();

    const cleanName = displayName.trim();

    if (!cleanName) {
      setError('Please enter your display name.');
      setSuccess('');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          display_name: cleanName,
        },
      });

      if (error) throw error;

      setUser(data.user);
      setDisplayName(data.user.user_metadata?.display_name || cleanName);
      setSuccess('Your profile has been updated successfully.');
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Could not update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
  if (!previewUrl) return;

  return () => {
    URL.revokeObjectURL(previewUrl);
  };
}, [previewUrl]);

  const initials = (displayName || user?.email || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-loading">
          <LoaderCircle size={24} className="profile-spinner" />
          <span>Loading your profile...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-container">
        <Link to="/dashboard" className="profile-back-link">
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="profile-heading">
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My profile</h1>
          <p>Manage your personal information and how you appear in Vydora.</p>
        </div>

        <div className="profile-card">
         <div className="profile-card-heading">
  <div className="profile-avatar">
    {previewUrl || user?.user_metadata?.avatar_url ? (
      <img
        src={previewUrl || user.user_metadata.avatar_url}
        alt="Profile preview"
      />
    ) : (
      initials || <UserRound size={28} />
    )}
  </div>

  <div className="profile-card-identity">
    <h2>{displayName || 'Your profile'}</h2>
    <p>{user?.email}</p>

    <div className="profile-picture-actions">
      <label className="profile-picture-choose">
        <ImagePlus size={16} />
        {selectedImage ? 'Choose another' : 'Choose picture'}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={uploadingImage}
        />
      </label>

      {selectedImage && (
        <button
          type="button"
          className="profile-picture-upload"
          onClick={handleImageUpload}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <LoaderCircle size={16} className="profile-spinner" />
          ) : (
            <Save size={16} />
          )}
          {uploadingImage ? 'Uploading...' : 'Upload picture'}
        </button>
      )}
    </div>

    <span className="profile-picture-hint">
      JPG, PNG or WebP · Maximum 5 MB
    </span>
  </div>
</div>

          <div className="profile-divider" />

          <form onSubmit={handleSave} className="profile-form">
            <label htmlFor="profile-name">Display name</label>

            <div className="profile-input-wrap">
              <UserRound size={18} />
              <input
                id="profile-name"
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setError('');
                  setSuccess('');
                }}
                placeholder="Enter your name"
                maxLength={60}
                required
              />
            </div>

            <label htmlFor="profile-email">Email address</label>

            <div className="profile-input-wrap profile-input-disabled">
              <Mail size={18} />
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                readOnly
              />
            </div>

            <p className="profile-field-note">
              Your email is linked to your login account and cannot be changed here.
            </p>

            {error && (
              <div className="profile-message profile-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="profile-message profile-success" role="status">
                <CheckCircle2 size={17} />
                {success}
              </div>
            )}

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle size={18} className="profile-spinner" />
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Saving changes...' : 'Save changes'}
            </button>
          </form>
        </div>

        <p className="profile-security-note">
          Your account information is managed securely through Supabase.
        </p>
      </div>
    </section>
  );
}

export default Profile;
