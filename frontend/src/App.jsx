import { useState } from 'react';
import './App.css';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [trainerDecisions, setTrainerDecisions] = useState({});
  const [showFinalRecord, setShowFinalRecord] = useState(false);

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
      setTrainerDecisions({});
      setShowFinalRecord(false);
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
    setTrainerDecisions({});
    setShowFinalRecord(false);

    const formData = new FormData();
    formData.append('video', selectedVideo);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Video processing failed.'
        );
      }

      setUploadResult(data);
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the SkillProof backend.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTrainerDecision = (
    criterionId,
    decision
  ) => {
    setTrainerDecisions((current) => ({
      ...current,
      [criterionId]: decision
    }));

    setShowFinalRecord(false);
  };

  const evidenceFrames =
    uploadResult?.video_metadata?.evidence_frames || [];

  const reviewEvidence =
    uploadResult?.review_evidence || [];

  const completedDecisions =
    Object.keys(trainerDecisions).length;

  const confirmedCount =
    Object.values(trainerDecisions).filter(
      (decision) => decision === 'confirmed'
    ).length;

  const overriddenCount =
    Object.values(trainerDecisions).filter(
      (decision) => decision === 'overridden'
    ).length;

  const allCriteriaReviewed =
    reviewEvidence.length > 0 &&
    completedDecisions === reviewEvidence.length;

  const generateFinalRecord = () => {
    if (!allCriteriaReviewed) {
      return;
    }

    setShowFinalRecord(true);

    setTimeout(() => {
      document
        .getElementById('verified-record')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    }, 100);
  };

  return (
    <div className="app-container">

      <header className="header">
        <div className="logo-badge">
          SkillProof AI
        </div>

        <p className="subtitle">
          AI-Assisted Evidence-Linked Practical Skill Assessment
        </p>
      </header>

      <main className="main-content">

        {/* LEARNER / VIDEO SECTION */}
        <section className="card">

          <div className="task-header">

            <span className="badge">
              TASK #PACKAGE_001
            </span>

            <h2>
              Basic Package Preparation and Sealing Procedure
            </h2>

            <p className="task-desc">
              Upload a practical performance.
              SkillProof identifies candidate moments
              for evidence-based trainer review.
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

                <span className="upload-icon">
                  📹
                </span>

                <p>
                  <strong>
                    {selectedVideo
                      ? selectedVideo.name
                      : 'Click to select performance video'}
                  </strong>
                </p>

                <span className="upload-hint">
                  MP4, WebM or MOV
                </span>

              </div>

            </label>

          </div>

          {videoPreview && (
            <div className="preview-section">

              <h3>
                Performance Video
              </h3>

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
                  ? 'Extracting Candidate Evidence...'
                  : 'Analyze Performance'}
              </button>

            </div>
          )}

          {error && (
            <div className="error-message">

              <strong>
                Processing Failed
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}

          {uploadResult && (
            <div className="analysis-summary">

              <h4>
                ✅ Candidate Evidence Extracted
              </h4>

              <p>
                <strong>
                  Assessment ID:
                </strong>{' '}
                {uploadResult.assessment_id}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{' '}
                {uploadResult.processing_status}
              </p>

              <p>
                <strong>
                  CV Method:
                </strong>{' '}
                OpenCV visual activity detection
              </p>

              <p>
                <strong>
                  Candidate Moments:
                </strong>{' '}
                {evidenceFrames.length}
              </p>

              <p>
                Candidate moments require trainer
                verification before becoming verified
                assessment evidence.
              </p>

            </div>
          )}

        </section>

        {/* RUBRIC */}
        <section className="card">

          <h3>
            Task Competency Rubric
          </h3>

          <p className="rubric-hint">
            Predefined criteria for this assessment:
          </p>

          <div className="rubric-list">

            {rubricCriteria.map((item) => {
              const decision =
                trainerDecisions[item.id];

              return (
                <div
                  key={item.id}
                  className="rubric-item"
                >

                  <div className="rubric-id">
                    {item.id}
                  </div>

                  <div className="rubric-info">

                    <strong>
                      {item.name}
                    </strong>

                    <p>
                      {item.desc}
                    </p>

                  </div>

                  {decision === 'confirmed' && (
                    <span className="status-badge status-confirmed">
                      Confirmed
                    </span>
                  )}

                  {decision === 'overridden' && (
                    <span className="status-badge status-overridden">
                      Overridden
                    </span>
                  )}

                  {!decision && uploadResult && (
                    <span className="status-badge status-pending">
                      Pending
                    </span>
                  )}

                </div>
              );
            })}

          </div>

        </section>

        {/* CV EVIDENCE TIMELINE */}
        {uploadResult && (
          <section
            className="card"
            style={{ gridColumn: '1 / -1' }}
          >

            <h3>
              CV Candidate Evidence Timeline
            </h3>

            <p className="rubric-hint">
              High-activity moments automatically
              identified from the learner&apos;s video.
              These moments support review but do not
              independently prove competency.
            </p>

            <div className="evidence-timeline">

              {evidenceFrames.map((frame) => (
                <div
                  className="evidence-card"
                  key={frame.evidence_id}
                >

                  <div className="evidence-top">

                    <span className="rubric-id">
                      {frame.evidence_id}
                    </span>

                    <div>

                      <strong>
                        Candidate Moment
                      </strong>

                      <p>
                        Timestamp: {frame.timestamp}
                      </p>

                    </div>

                  </div>

                  <div className="evidence-details">

                    <span>
                      Activity score:{' '}
                      <strong>
                        {frame.activity_score}
                      </strong>
                    </span>

                    <span className="status-badge status-pending">
                      Review Candidate
                    </span>

                  </div>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* TRAINER DASHBOARD */}
        {reviewEvidence.length > 0 && (
          <section
            className="card"
            style={{ gridColumn: '1 / -1' }}
          >

            <div className="trainer-header">

              <div>

                <h3>
                  Trainer Verification Dashboard
                </h3>

                <p className="rubric-hint">
                  AI/CV suggests moments. The trainer
                  makes the final assessment decision.
                </p>

              </div>

              <div className="review-progress">
                {completedDecisions}
                {' / '}
                {reviewEvidence.length}
                {' reviewed'}
              </div>

            </div>

            <div className="trainer-review-list">

              {reviewEvidence.map((criterion) => {
                const decision =
                  trainerDecisions[
                    criterion.criterion_id
                  ];

                return (
                  <div
                    className="trainer-review-card"
                    key={criterion.criterion_id}
                  >

                    <div className="trainer-criterion">

                      <div className="rubric-id">
                        {criterion.criterion_id}
                      </div>

                      <div>

                        <h4>
                          {criterion.criterion_name}
                        </h4>

                        <p>
                          {
                            criterion
                              .criterion_description
                          }
                        </p>

                      </div>

                    </div>

                    <div className="candidate-moments">

                      <strong>
                        CV Candidate Moments
                      </strong>

                      <div className="timestamp-list">

                        {criterion.candidate_evidence.map(
                          (evidence) => (
                            <span
                              className="timestamp-chip"
                              key={
                                criterion.criterion_id +
                                evidence.evidence_id
                              }
                            >
                              {evidence.timestamp}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                    <div className="trainer-actions">

                      <button
                        className={
                          decision === 'confirmed'
                            ? 'btn-confirm active'
                            : 'btn-confirm'
                        }
                        onClick={() =>
                          handleTrainerDecision(
                            criterion.criterion_id,
                            'confirmed'
                          )
                        }
                      >
                        ✓ Confirm
                      </button>

                      <button
                        className={
                          decision === 'overridden'
                            ? 'btn-override active'
                            : 'btn-override'
                        }
                        onClick={() =>
                          handleTrainerDecision(
                            criterion.criterion_id,
                            'overridden'
                          )
                        }
                      >
                        ✕ Override
                      </button>

                    </div>

                    {decision && (
                      <div
                        className={
                          decision === 'confirmed'
                            ? 'decision-result confirmed'
                            : 'decision-result overridden'
                        }
                      >

                        Trainer Decision:{' '}

                        <strong>
                          {decision === 'confirmed'
                            ? 'CONFIRMED'
                            : 'OVERRIDDEN'}
                        </strong>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

            {allCriteriaReviewed && (
              <div className="verification-complete">

                <h3>
                  ✓ Trainer Verification Complete
                </h3>

                <p>
                  All competency criteria have been
                  reviewed by the trainer.
                </p>

                <p>
                  <strong>
                    Assessment:
                  </strong>{' '}
                  {uploadResult.assessment_id}
                </p>

                <button
                  className="btn-primary"
                  onClick={generateFinalRecord}
                >
                  Generate Verified Assessment Record
                </button>

              </div>
            )}

          </section>
        )}

        {/* FINAL VERIFIED RECORD */}
        {showFinalRecord && uploadResult && (
          <section
            id="verified-record"
            className="card verified-record"
            style={{ gridColumn: '1 / -1' }}
          >

            <div className="verified-record-header">

              <div>

                <span className="verified-label">
                  TRAINER VERIFIED
                </span>

                <h2>
                  Verified Assessment Record
                </h2>

                <p>
                  SkillProof AI — Evidence-Linked
                  Practical Skill Assessment
                </p>

              </div>

              <div className="verified-mark">
                ✓
              </div>

            </div>

            <div className="record-meta">

              <div>
                <span>
                  Assessment ID
                </span>
                <strong>
                  {uploadResult.assessment_id}
                </strong>
              </div>

              <div>
                <span>
                  Task
                </span>
                <strong>
                  {uploadResult.task}
                </strong>
              </div>

              <div>
                <span>
                  Task ID
                </span>
                <strong>
                  {uploadResult.task_id}
                </strong>
              </div>

              <div>
                <span>
                  Review Status
                </span>
                <strong>
                  5 / 5 Criteria Reviewed
                </strong>
              </div>

            </div>

            <div className="verified-criteria">

              {rubricCriteria.map((criterion) => {
                const decision =
                  trainerDecisions[criterion.id];

                return (
                  <div
                    className="verified-criterion"
                    key={criterion.id}
                  >

                    <div className="verified-criterion-info">

                      <span className="rubric-id">
                        {criterion.id}
                      </span>

                      <div>

                        <strong>
                          {criterion.name}
                        </strong>

                        <p>
                          {criterion.desc}
                        </p>

                      </div>

                    </div>

                    <span
                      className={
                        decision === 'confirmed'
                          ? 'record-result confirmed'
                          : 'record-result overridden'
                      }
                    >
                      {decision === 'confirmed'
                        ? '✓ CONFIRMED'
                        : '✕ OVERRIDDEN'}
                    </span>

                  </div>
                );
              })}

            </div>

            <div className="record-summary">

              <div>
                <span>
                  Confirmed
                </span>
                <strong>
                  {confirmedCount}
                </strong>
              </div>

              <div>
                <span>
                  Overridden
                </span>
                <strong>
                  {overriddenCount}
                </strong>
              </div>

              <div>
                <span>
                  Final Status
                </span>
                <strong>
                  TRAINER REVIEW COMPLETE
                </strong>
              </div>

            </div>

            <div className="record-note">
              <strong>
                Human-in-the-loop safeguard:
              </strong>{' '}
              This record reflects trainer-reviewed
              decisions. Computer vision provides candidate
              evidence but does not independently certify
              learner competency.
            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default App;