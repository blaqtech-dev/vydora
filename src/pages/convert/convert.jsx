
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AudioLines,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileVideo,
  LoaderCircle,
  Music2,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { uploadCloudAudio } from '../../services/cloudaudiostorage.js';
import { supabase } from '../../lib/supabase';
import './convert.css';

const MAX_FILE_SIZE = 150 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getDuration = (file) =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration)
        ? video.duration
        : 0;

      URL.revokeObjectURL(url);
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };

    video.src = url;
  });

const formatDuration = (seconds) => {
  if (!seconds) return 'Duration unavailable';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

function Convert() {
  const ffmpegRef = useRef(null);
  const fileInputRef = useRef(null);
  const outputUrlRef = useRef(null);
  const [usage, setUsage] = useState(null);


  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [format, setFormat] = useState('mp3');
  const [quality, setQuality] = useState('192k');
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [output, setOutput] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (outputUrlRef.current) {
        URL.revokeObjectURL(outputUrlRef.current);
      }
    };
  }, []);

  const selectFile = async (selectedFile) => {
    setError('');
    setStatus('');

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('This file is larger than 150 MB. Please choose a smaller video.');
      return;
    }

    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }

    setOutput(null);
    setProgress(0);
    setFile(selectedFile);
    setDuration(await getDuration(selectedFile));
  };

  const removeFile = () => {
    setFile(null);
    setDuration(0);
    setOutput(null);
    setProgress(0);
    setStatus('');
    setError('');

    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

 
const convertFile = async () => {
  if (!file || isConverting) return;

  let conversionReserved = false;
  let conversionSucceeded = false;

  setError('');
  setStatus('Preparing conversion...');
  setIsConverting(true);
  setProgress(0);
  setOutput(null);

  try {

  // Reserve one conversion using the authenticated Supabase user.
  const {
    data: reservation,
    error: reservationError,
  } = await supabase.rpc('reserve_vydora_conversion');

  if (reservationError) {
    throw new Error(
      'Unable to verify your conversion allowance. Please try again.',
    );
  }

  
  if (!reservation?.allowed) {
    setUsage(reservation);

    setError(
      reservation.plan === 'free'
        ? `You've used all ${reservation.limit} free conversions for today. Upgrade to Pro for 30 conversions per day.`
        : `You've used all ${reservation.limit} Pro conversions for today. Please try again after the daily reset.`,
    );

    setStatus('');
    return;
  }

  conversionReserved = true;
  setUsage(reservation);


  // Continue with your existing FFmpeg conversion.
  let ffmpeg = ffmpegRef.current;

      if (!ffmpeg) {
        ffmpeg = new FFmpeg();

        ffmpeg.on('progress', ({ progress: currentProgress }) => {
          setProgress(
            Math.min(99, Math.max(0, Math.round(currentProgress * 100))),
          );
        });

        ffmpegRef.current = ffmpeg;
      }

      if (!ffmpeg.loaded) {
        setStatus('Loading the conversion engine...');
const baseURL =
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript',
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm',
          ),
        });
      }

      setStatus('Converting your video to audio...');

      const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputName = `input.${extension}`;
      const outputName = `vydora-audio.${format}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const audioArguments =
        format === 'mp3'
          ? [
              '-i', inputName,
              '-vn',
              '-codec:a', 'libmp3lame',
              '-b:a', quality,
              outputName,
            ]
          : [
              '-i', inputName,
              '-vn',
              '-c:a', 'pcm_s16le',
              '-ar', '44100',
              '-ac', '2',
              outputName,
            ];

      const exitCode = await ffmpeg.exec(audioArguments);

      if (exitCode !== 0) {
        throw new Error(
          'Conversion failed. Try another video format or a smaller file.',
        );
      }

      const data = await ffmpeg.readFile(outputName);

      const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
     const blob = new Blob([data], { type: mimeType });

const audioName = `${file.name.replace(/\.[^/.]+$/, '')}.${format}`;

// Upload the converted audio to the user's private cloud library.
setStatus('Saving audio to your cloud library...');


const savedFile = await uploadCloudAudio({
  name: audioName,
  blob,
  type: mimeType,
});

const url = URL.createObjectURL(blob);


      if (outputUrlRef.current) {
        URL.revokeObjectURL(outputUrlRef.current);
      }

      outputUrlRef.current = url;

setOutput({
  id: savedFile.id,
  url,
  name: savedFile.name,
  size: savedFile.size,
  type: savedFile.type,
  storagePath: savedFile.storagePath,
});

     
setProgress(100);
setStatus('Conversion complete!');
conversionSucceeded = true;

 
} catch (conversionError) {
  console.error('Vydora conversion error:', conversionError);

  ffmpegRef.current = null;

  if (conversionReserved && !conversionSucceeded) {
    try {
      const { data, error: releaseError } = await supabase.rpc(
        'release_vydora_conversion'
      );

      if (releaseError) {
        console.error(
          'Could not release conversion allowance:',
          releaseError
        );
      } else if (data) {
        setUsage(data);
      }
    } catch (releaseError) {
      console.error(
        'Conversion allowance rollback failed:',
        releaseError
      );
    }
  }

  setError(
    conversionError?.message ||
      'Something went wrong during conversion. Please try again.',
  );

  setStatus('');
} finally {
  setIsConverting(false);
}

  }

  const downloadOutput = () => {
    if (!output) return;

    const link = document.createElement('a');
    link.href = output.url;
    link.download = output.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="convert-page">
      <header className="convert-topbar">
        <Link to="/dashboard" className="convert-back">
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </Link>

        <Link to="/dashboard" className="convert-brand">
          <span className="convert-brand-icon">
            <AudioLines size={21} />
          </span>
          vydora
        </Link>

        <div className="convert-private-note">
          <ShieldCheck size={16} />
          <span>On-device conversion</span>
        </div>
      </header>

      <main className="convert-main">
        <div className="convert-intro">
          <span className="convert-eyebrow">
            <Music2 size={15} />
            VIDEO TO AUDIO
          </span>

          <h1>Every sound, <span>without the video.</span></h1>

          <p>
            Turn your favourite videos into audio files you can listen
            to anywhere.
          </p>
        </div>

        <section className="convert-card">
          <div
            className={`convert-dropzone ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              selectFile(event.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
              }}
            />

            {!file ? (
              <>
                <div className="convert-upload-icon">
                  <Upload size={27} />
                </div>

                <h2>Drop your video here</h2>

                <p>or choose a file from your device</p>

                <button
                  type="button"
                  className="convert-choose-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileVideo size={17} />
                  Choose video
                </button>

                <span className="convert-file-hint">
                  Video files · Maximum 150 MB
                </span>
              </>
            ) : (
              <div className="convert-selected-file">
                <div className="convert-video-icon">
                  <FileVideo size={25} />
                </div>

                <div className="convert-file-info">
                  <strong title={file.name}>{file.name}</strong>
                  <span>
                    {formatBytes(file.size)} · {formatDuration(duration)}
                  </span>
                  <span className="convert-file-ready">
                    <CheckCircle2 size={14} />
                    Video ready
                  </span>
                </div>

                <button
                  type="button"
                  className="convert-remove-button"
                  onClick={removeFile}
                  disabled={isConverting}
                  aria-label="Remove selected video"
                >
                  <X size={19} />
                </button>
              </div>
            )}
          </div>

          <div className="convert-settings">
            <div className="convert-settings-heading">
              <div>
                <h2>Audio settings</h2>
                <p>Choose how you want your audio saved.</p>
              </div>
              <span className="convert-settings-step">STEP 02</span>
            </div>

            <div className="convert-options">
              <label className="convert-field">
                <span>Audio format</span>
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                  disabled={isConverting}
                >
                  <option value="mp3">MP3 — smaller file</option>
                  <option value="wav">WAV — uncompressed audio</option>
                </select>
              </label>

              <label className="convert-field">
                <span>Audio quality</span>
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  disabled={isConverting || format === 'wav'}
                >
                  <option value="128k">Standard · 128 kbps</option>
                  <option value="192k">High · 192 kbps</option>
                  <option value="320k">Very high · 320 kbps</option>
                </select>
              </label>
            </div>

            {format === 'wav' && (
              <p className="convert-quality-note">
                WAV uses uncompressed audio. Its output file may be much larger.
              </p>
            )}

            
{error && (
  <div className="convert-error" role="alert">
    <p>{error}</p>

    {usage?.allowed === false && usage?.plan === 'free' && (
      <button
        type="button"
        className="convert-upgrade-button"
        onClick={() => navigate('/pricing')}
      >
        View Pro plans
      </button>
    )}
  </div>
)}


            {status && (
              <div className="convert-status" role="status">
                {isConverting ? (
                  <LoaderCircle className="convert-spinner" size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                <span>{status}</span>
              </div>
            )}

            {isConverting && (
              <div
                className="convert-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="convert-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {usage && (
  <p className="convert-usage-note">
    {usage.remaining} of {usage.limit} daily conversions remaining
    {' · '}
    {usage.plan === 'pro' ? 'Pro plan' : 'Free plan'}
  </p>
)}

            <button
              type="button"
              className="convert-start-button"
              onClick={convertFile}
              disabled={!file || isConverting}
            >
              {isConverting ? (
                <>
                  <LoaderCircle className="convert-spinner" size={19} />
                  Converting...
                </>
              ) : (
                <>
                  <AudioLines size={19} />
                  Convert to audio
                </>
              )}
            </button>

            {output && (
              <div className="convert-result">
                <div className="convert-result-icon">
                  <Music2 size={23} />
                </div>

                <div className="convert-result-info">
                  <strong>{output.name}</strong>
                  <span>{formatBytes(output.size)} · Ready to download</span>
                </div>

                <button
                  type="button"
                  className="convert-download-button"
                  onClick={downloadOutput}
                >
                  <Download size={17} />
                  Download
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="convert-trust-row">
          <div>
            <ShieldCheck size={19} />
            <span>Your video stays in this browser during conversion</span>
          </div>
          <div>
            <CheckCircle2 size={19} />
            <span>No account needed to try the converter</span>
          </div>
        </div>

        <p className="convert-library-note">
          Want to manage your audio files?{' '}
          <Link to="/storage">Visit your audio library</Link>
        </p>
      </main>
    </div>
  );
}

export default Convert;
