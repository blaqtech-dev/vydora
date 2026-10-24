
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AudioLines,
  Check,
  CloudUpload,
  Download,
  FileAudio,
  FileVideo,
  FolderOpen,
  Headphones,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import './home.css';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

function Home() {


    const [isSignedIn, setIsSignedIn] = useState(false);

useEffect(() => {
  let mounted = true;

  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (!mounted) return;

    if (error) {
      console.error('Could not check homepage session:', error);
      setIsSignedIn(false);
      return;
    }

    setIsSignedIn(Boolean(data.session));
  };

  checkSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (mounted) {
      setIsSignedIn(Boolean(session));
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Simple. Fast. Made for your audio.
            </div>

            <h1>
              Your videos.
              <br />
              <span>Your audio.</span>
              <br />
              One simple tool.
            </h1>

            <p className="hero-description">
              Turn your video files into audio you can listen to anywhere.
              Convert, download, and keep everything organized in one place.
            </p>

            <div className="hero-actions">
              <Link
  to={isSignedIn ? '/convert' : '/signup'}
  className="primary-button"
>
  {isSignedIn ? 'Start converting' : 'Start converting'}
  <ArrowRight size={18} />
</Link>
              <a href="#how-it-works" className="secondary-button">
                See how it works
              </a>
            </div>

            <div className="hero-benefits">
              <span><Check size={16} /> Easy to use</span>
              <span><Check size={16} /> Your own audio library</span>
            </div>
          </div>

          <div className="converter-preview">
            <div className="preview-heading">
              <div>
                <span className="preview-eyebrow">YOUR WORKSPACE</span>
                <h2>Video to audio</h2>
              </div>
              <span className="preview-status">
                <span /> Ready
              </span>
            </div>

            <div className="upload-preview">
              <div className="upload-icon">
                <CloudUpload size={30} />
              </div>
              <h3>Drop your video here</h3>
              <p>Or choose a file from your device</p>
              <span className="supported-formats">
                MP4 · MOV · WEBM · and more
              </span>
            </div>

            <div className="preview-file">
              <div className="file-type-icon">
                <FileVideo size={22} />
              </div>
              <div className="preview-file-info">
                <strong>your-video.mp4</strong>
                <span>Example conversion preview</span>
              </div>
              <AudioLines className="preview-audio-icon" size={25} />
            </div>

            <div className="preview-wave" aria-hidden="true">
              {Array.from({ length: 42 }, (_, index) => (
                <span
                  key={index}
                  style={{
                    height: `${12 + ((index * 17 + 13) % 29)}px`,
                  }}
                />
              ))}
            </div>

            <div className="preview-footer">
              <span><FileAudio size={16} /> Audio output</span>
              <span className="preview-mp3">MP3</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-section" id="features">
        <div className="container trust-inner">
          <p>Everything you need. Nothing you don't.</p>
          <div className="trust-features">
            <span><Zap size={18} /> Simple conversion</span>
            <span><Headphones size={18} /> Listen anywhere</span>
            <span><FolderOpen size={18} /> Organized storage</span>
            <span><ShieldCheck size={18} /> Private library</span>
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <span className="section-eyebrow">HOW IT WORKS</span>
            <h2>From video to audio in three simple steps.</h2>
            <p>No complicated editing tools. Just the audio you need.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><CloudUpload size={24} /></div>
              <h3>Choose your video</h3>
              <p>Upload a video from your phone, tablet, or computer.</p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><AudioLines size={24} /></div>
              <h3>Convert to audio</h3>
              <p>Extract the sound and prepare an audio file for listening.</p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><Download size={24} /></div>
              <h3>Listen and download</h3>
              <p>Play your audio, download it, and find it again in your library.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="library-section">
        <div className="container library-panel">
          <div className="library-copy">
            <span className="section-eyebrow">YOUR AUDIO, ORGANIZED</span>
            <h2>A home for every audio file you create.</h2>
            <p>
              Keep your conversions together in your personal library.
              Come back to play, download, rename, or remove your files whenever
              you need to.
            </p>
          <Link
  to={isSignedIn ? '/storage' : '/signup'}
  className="primary-button"
>
  {isSignedIn ? 'Open my library' : 'Create your library'}
  <ArrowRight size={18} />
</Link>
          </div>

          <div className="library-visual">
            <div className="library-window">
              <div className="library-window-heading">
                <div>
                  <FolderOpen size={19} />
                  <strong>My audio library</strong>
                </div>
                <span>3 files</span>
              </div>

              <div className="library-item">
                <div className="library-item-icon"><FileAudio size={21} /></div>
                <div className="library-item-info">
                  <strong>Lecture notes</strong>
                  <span>MP3 audio</span>
                </div>
                <span className="library-duration">12:48</span>
              </div>

              <div className="library-item">
                <div className="library-item-icon"><FileAudio size={21} /></div>
                <div className="library-item-info">
                  <strong>Weekend memories</strong>
                  <span>MP3 audio</span>
                </div>
                <span className="library-duration">04:16</span>
              </div>

              <div className="library-item">
                <div className="library-item-icon"><FileAudio size={21} /></div>
                <div className="library-item-info">
                  <strong>My presentation</strong>
                  <span>MP3 audio</span>
                </div>
                <span className="library-duration">08:32</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container pricing-content">
          <span className="section-eyebrow">GET STARTED</span>
          <h2>Your audio journey starts here.</h2>
          <p>
            Create an account to start building your personal audio library.
            We'll introduce plans when your conversion experience is ready.
          </p>
         <Link
  to={isSignedIn ? '/dashboard' : '/signup'}
  className="primary-button"
>
  {isSignedIn ? 'Go to dashboard' : 'Get started for free'}
  <ArrowRight size={18} />
</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
