import { useState } from 'react';
import './App.css';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const rubricCriteria = [
    {
      id: 'C1',
      name: 'Package Preparation',
      desc: 'Prepare package or box before placing item'
    },
    {
      id: 'C2',
      name: 'Item Preparation',
      desc: 'Item is ready for packaging'
    },
    {
      id: 'C3',
      name: 'Item Placement',
      desc: 'Place item inside package'
    },
    {
      id: 'C4',
      name: 'Package Closure',
      desc: 'Close package after placing item'
    },
    {
      id: 'C5',
      name: 'Package Sealing',
      desc: 'Apply sealing material to complete'
    }
  ];

  const handleVideoChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedVideo) {
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('video', selectedVideo);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Video upload failed.');
      }

      setUploadResult(data);
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the SkillProof backend. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-badge">SkillProof AI</div>

        <p className="subtitle">
          AI-Assisted Evidence-Linked Practical Skill Assessment
        </p>
      </header>

      <main className="main-content">
        <section className="card">
          <div className="task-header">
            <span className="badge">TASK #PACKAGE_001</span>

            <h2>
              Basic Package Preparation and Sealing Procedure
            </h2>

            <p className="task-desc">
              Demonstrate the standard package preparation, item placement,
              closure, and sealing steps.
            </p>
          </div>

          <div className="upload-section">
            <label className="upload-box">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                style={{ display: 'none' }}
              />

              <div className="upload-content">
                <span className="upload-icon">📹</span>

                <p>
                  <strong>
                    {selectedVideo
                      ? selectedVideo.name
                      : 'Click to select or upload performance video'}
                  </strong>
                </p>

                <span className="upload-hint">
                  MP4, WebM or MOV format
                </span>
              </div>
            </label>
          </div>

          {videoPreview && (
            <div className="preview-section">
              <h3>Video Preview</h3>

              <video
                src={videoPreview}
                controls
                className="video-player"
              />

              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing
                  ? 'Uploading video to SkillProof...'
                  : 'Submit for Analysis'}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>Upload failed</strong>
              <p>{error}</p>
            </div>
          )}

          {uploadResult && (
            <div className="analysis-summary">
              <h4>✅ Video Received by SkillProof</h4>

              <p>
                <strong>Assessment ID:</strong>{' '}
                {uploadResult.assessment_id}
              </p>

              <p>
                <strong>File:</strong>{' '}
                {uploadResult.original_filename}
              </p>

              <p>
                The video was successfully stored by the backend.
                Evidence analysis is the next processing stage.
              </p>
            </div>
          )}
        </section>

        <section className="card">
          <h3>Task Competency Rubric</h3>

          <p className="rubric-hint">
            Competency criteria for this practical assessment:
          </p>

          <div className="rubric-list">
            {rubricCriteria.map((item) => (
              <div
                key={item.id}
                className="rubric-item"
              >
                <div className="rubric-id">
                  {item.id}
                </div>

                <div className="rubric-info">
                  <strong>{item.name}</strong>
                  <p>{item.desc}</p>
                </div>

                {uploadResult && (
                  <span className="status-badge status-detected">
                    Awaiting Analysis
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;