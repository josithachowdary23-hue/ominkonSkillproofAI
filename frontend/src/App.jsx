import { useState } from 'react';
import './App.css';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setIsAnalysisComplete] = useState(false);

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
      setIsAnalysisComplete(false);
    }
  };

  const handleAnalyze = () => {
    if (!selectedVideo) {
      return;
    }

    setIsAnalyzing(true);

    // Temporary frontend simulation.
    // This will be connected to the FastAPI backend later.
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalysisComplete(true);
    }, 2000);
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

            <h2>Basic Package Preparation and Sealing Procedure</h2>

            <p className="task-desc">
              Demonstrate the standard package preparation, item placement,
              closure, and sealing steps.
            </p>
          </div>

          <div className="upload-section">
            <label className="upload-box">
              <input
                type="file"
                accept="video/*"
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
                  ? 'Preparing prototype analysis...'
                  : 'Analyze Performance'}
              </button>
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
              <div key={item.id} className="rubric-item">
                <div className="rubric-id">{item.id}</div>

                <div className="rubric-info">
                  <strong>{item.name}</strong>
                  <p>{item.desc}</p>
                </div>

                {analysisComplete && (
                  <span className="status-badge status-detected">
                    Ready for Review
                  </span>
                )}
              </div>
            ))}
          </div>

          {analysisComplete && (
            <div className="analysis-summary">
              <h4>✅ Prototype Analysis Complete</h4>

              <p>
                Task criteria loaded. Backend evidence analysis will be
                connected in the next development stage.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;