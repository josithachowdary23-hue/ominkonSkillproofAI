import {
  useRef,
  useState
} from 'react';

import './App.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';


function App() {

  const videoRef = useRef(null);

  const [
    selectedVideo,
    setSelectedVideo
  ] = useState(null);

  const [
    videoPreview,
    setVideoPreview
  ] = useState(null);

  const [
    isAnalyzing,
    setIsAnalyzing
  ] = useState(false);

  const [
    uploadResult,
    setUploadResult
  ] = useState(null);

  const [
    error,
    setError
  ] = useState('');

  const [
    trainerDecisions,
    setTrainerDecisions
  ] = useState({});

  const [
    trainerNotes,
    setTrainerNotes
  ] = useState({});

  const [
    isSavingReview,
    setIsSavingReview
  ] = useState(false);

  const [
    reviewSaved,
    setReviewSaved
  ] = useState(false);

  const [
    showFinalRecord,
    setShowFinalRecord
  ] = useState(false);

  const [
    assessmentLookupId,
    setAssessmentLookupId
  ] = useState('');

  const [
    isLoadingAssessment,
    setIsLoadingAssessment
  ] = useState(false);


  const rubricCriteria = [
    {
      id: 'C1',
      name: 'Package Preparation',
      desc:
        'Prepare package or box before placing item'
    },
    {
      id: 'C2',
      name: 'Item Preparation',
      desc:
        'Item is ready for packaging'
    },
    {
      id: 'C3',
      name: 'Item Placement',
      desc:
        'Place item inside package'
    },
    {
      id: 'C4',
      name: 'Package Closure',
      desc:
        'Close package after placing item'
    },
    {
      id: 'C5',
      name: 'Package Sealing',
      desc:
        'Apply sealing material to complete'
    }
  ];


  /* ==================================================
     ASSESSMENT NORMALIZATION
     ================================================== */

  const normalizeAssessment = (
    assessment
  ) => {

    return {
      ...assessment,

      analysis_method:
        assessment.analysis_method ||
        assessment
          .video_metadata
          ?.analysis_method ||
        'opencv_visual_activity_detection',

      sequence_analysis:
        assessment.sequence_analysis ||
        assessment
          .video_metadata
          ?.sequence_analysis ||
        null
    };

  };


  /* ==================================================
     FILE SELECTION
     ================================================== */

  const handleVideoChange = (
    event
  ) => {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    if (
      videoPreview?.startsWith(
        'blob:'
      )
    ) {
      URL.revokeObjectURL(
        videoPreview
      );
    }

    setSelectedVideo(
      file
    );

    setVideoPreview(
      URL.createObjectURL(
        file
      )
    );

    setUploadResult(null);

    setTrainerDecisions({});

    setTrainerNotes({});

    setReviewSaved(false);

    setShowFinalRecord(false);

    setError('');

  };


  /* ==================================================
     ANALYZE NEW VIDEO
     ================================================== */

  const handleAnalyze =
    async () => {

    if (!selectedVideo) {
      return;
    }

    setIsAnalyzing(true);

    setError('');

    setUploadResult(null);

    setTrainerDecisions({});

    setTrainerNotes({});

    setReviewSaved(false);

    setShowFinalRecord(false);


    const formData =
      new FormData();

    formData.append(
      'video',
      selectedVideo
    );


    try {

      const response =
        await fetch(
          `${API_BASE}/upload`,
          {
            method: 'POST',
            body: formData
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Video processing failed.'
        );

      }


      const normalized =
        normalizeAssessment(
          data
        );


      setUploadResult(
        normalized
      );


      setAssessmentLookupId(
        data.assessment_id
      );


      if (
        data.video_url
      ) {

        setVideoPreview(
          `${API_BASE}${data.video_url}`
        );

      }


    } catch (err) {

      setError(
        err.message ||
        'Could not connect to the SkillProof backend.'
      );

    } finally {

      setIsAnalyzing(false);

    }

  };


  /* ==================================================
     LOAD PERSISTED ASSESSMENT
     ================================================== */

  const loadAssessment =
    async () => {

    const cleanId =
      assessmentLookupId
        .trim()
        .toUpperCase();


    if (!cleanId) {

      setError(
        'Enter an assessment ID first.'
      );

      return;

    }


    setIsLoadingAssessment(
      true
    );

    setError('');

    setShowFinalRecord(
      false
    );


    try {

      const response =
        await fetch(
          `${API_BASE}/assessments/${cleanId}`
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Assessment could not be loaded.'
        );

      }


      const normalized =
        normalizeAssessment(
          data
        );


      setUploadResult(
        normalized
      );


      setTrainerDecisions(
        data.trainer_decisions
        || {}
      );


      setTrainerNotes(
        data.trainer_notes
        || {}
      );


      setAssessmentLookupId(
        data.assessment_id
      );


      setSelectedVideo(
        null
      );


      if (
        data.video_url
      ) {

        setVideoPreview(
          `${API_BASE}${data.video_url}`
        );

      } else {

        setVideoPreview(
          null
        );

      }


      setReviewSaved(
        Boolean(
          data.trainer_decisions &&
          Object.keys(
            data.trainer_decisions
          ).length > 0
        )
      );


    } catch (err) {

      setError(
        err.message ||
        'Assessment could not be loaded.'
      );

    } finally {

      setIsLoadingAssessment(
        false
      );

    }

  };


  /* ==================================================
     TRAINER DECISIONS
     ================================================== */

  const handleTrainerDecision = (
    criterionId,
    decision
  ) => {

    setTrainerDecisions(
      (current) => ({
        ...current,
        [criterionId]:
          decision
      })
    );

    setReviewSaved(false);

    setShowFinalRecord(false);

  };


  const handleTrainerNote = (
    criterionId,
    note
  ) => {

    setTrainerNotes(
      (current) => ({
        ...current,
        [criterionId]:
          note
      })
    );

    setReviewSaved(false);

  };


  /* ==================================================
     EVIDENCE HELPERS
     ================================================== */

  const getEvidenceImageUrl = (
    frame
  ) => {

    if (!frame?.filename) {
      return '';
    }

    return (
      `${API_BASE}/evidence/`
      + frame.filename
    );

  };


  const jumpToTimestamp = (
    seconds
  ) => {

    if (!videoRef.current) {
      return;
    }

    videoRef.current.currentTime =
      seconds;

    videoRef.current
      .play()
      .catch(
        () => {}
      );

    videoRef.current
      .scrollIntoView({
        behavior:
          'smooth',

        block:
          'center'
      });

  };


  /* ==================================================
     DERIVED DATA
     ================================================== */

  const evidenceFrames =
    uploadResult
      ?.video_metadata
      ?.evidence_frames
      || [];


  const reviewEvidence =
    uploadResult
      ?.review_evidence
      || [];


  const sequenceAnalysis =
    uploadResult
      ?.sequence_analysis
    ||
    uploadResult
      ?.video_metadata
      ?.sequence_analysis
    ||
    null;


  const completedDecisions =
    Object.keys(
      trainerDecisions
    ).length;


  const confirmedCount =
    Object.values(
      trainerDecisions
    ).filter(
      (decision) =>
        decision ===
        'confirmed'
    ).length;


  const overriddenCount =
    Object.values(
      trainerDecisions
    ).filter(
      (decision) =>
        decision ===
        'overridden'
    ).length;


  const allCriteriaReviewed =
    reviewEvidence.length > 0
    &&
    completedDecisions ===
      reviewEvidence.length;


  /* ==================================================
     SAVE TRAINER REVIEW
     ================================================== */

  const saveTrainerReview =
    async () => {

    if (
      !uploadResult
        ?.assessment_id
    ) {
      return;
    }


    setIsSavingReview(
      true
    );

    setError('');

    setReviewSaved(
      false
    );


    try {

      const response =
        await fetch(
          `${API_BASE}/assessments/${uploadResult.assessment_id}/review`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                trainer_decisions:
                  trainerDecisions,

                trainer_notes:
                  trainerNotes
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Trainer review could not be saved.'
        );

      }


      if (
        data.assessment
      ) {

        const normalized =
          normalizeAssessment(
            data.assessment
          );


        setUploadResult(
          (current) => ({
            ...current,
            ...normalized,

            video_url:
              normalized.video_url
              ||
              current?.video_url,

            stored_filename:
              normalized
                .stored_filename
              ||
              current
                ?.stored_filename
          })
        );


        setTrainerDecisions(
          data.assessment
            .trainer_decisions
          || {}
        );


        setTrainerNotes(
          data.assessment
            .trainer_notes
          || {}
        );

      }


      setReviewSaved(
        true
      );


    } catch (err) {

      setError(
        err.message ||
        'Trainer review could not be saved.'
      );

    } finally {

      setIsSavingReview(
        false
      );

    }

  };


  /* ==================================================
     FINAL RECORD
     ================================================== */

  const generateFinalRecord =
    async () => {

    if (
      !allCriteriaReviewed
    ) {
      return;
    }


    if (!reviewSaved) {

      await saveTrainerReview();

    }


    setShowFinalRecord(
      true
    );


    setTimeout(
      () => {

        document
          .getElementById(
            'verified-record'
          )
          ?.scrollIntoView({
            behavior:
              'smooth',

            block:
              'start'
          });

      },
      100
    );

  };


  /* ==================================================
     UI
     ================================================== */

  return (

    <div className="app-container">


      {/* HEADER */}

      <header className="header">

        <div className="logo-badge">
          SkillProof AI
        </div>

        <p className="subtitle">
          AI-Assisted Evidence-Linked
          Practical Skill Assessment
        </p>

      </header>


      <main className="main-content">


        {/* ==========================================
            REOPEN ASSESSMENT
            ========================================== */}

        <section
          className="card"
          style={{
            gridColumn:
              '1 / -1'
          }}
        >

          <h3>
            Reopen Saved Assessment
          </h3>

          <p className="rubric-hint">
            Enter an assessment ID
            to restore the stored video,
            evidence, trainer decisions,
            and notes.
          </p>


          <div className="assessment-lookup">

            <input
              type="text"
              value={
                assessmentLookupId
              }
              onChange={
                (event) =>
                  setAssessmentLookupId(
                    event.target.value
                  )
              }
              placeholder="Example: SP-00CE1587"
              className="assessment-id-input"
            />


            <button
              className="btn-primary lookup-button"
              onClick={
                loadAssessment
              }
              disabled={
                isLoadingAssessment
              }
            >

              {isLoadingAssessment
                ? 'Loading...'
                : 'Load Assessment'}

            </button>

          </div>

        </section>


        {/* ==========================================
            LEARNER / VIDEO
            ========================================== */}

        <section className="card">


          <div className="task-header">

            <span className="badge">
              TASK #PACKAGE_001
            </span>

            <h2>
              Basic Package Preparation
              and Sealing Procedure
            </h2>

            <p className="task-desc">
              Upload a practical
              performance. SkillProof
              identifies candidate moments
              for evidence-based trainer
              review.
            </p>

          </div>


          <div className="upload-section">

            <label className="upload-box">

              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={
                  handleVideoChange
                }
                style={{
                  display:
                    'none'
                }}
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
                ref={
                  videoRef
                }
                src={
                  videoPreview
                }
                controls
                className="video-player"
              />


              {selectedVideo && (

                <button
                  className="btn-primary"
                  onClick={
                    handleAnalyze
                  }
                  disabled={
                    isAnalyzing
                  }
                >

                  {isAnalyzing
                    ? 'Extracting Candidate Evidence...'
                    : 'Analyze Performance'}

                </button>

              )}

            </div>

          )}


          {error && (

            <div className="error-message">

              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>

            </div>

          )}


          {uploadResult && (

            <div className="analysis-summary">

              <h4>
                ✅ Assessment Ready
              </h4>

              <p>
                <strong>
                  Assessment ID:
                </strong>{' '}

                {
                  uploadResult
                    .assessment_id
                }
              </p>

              <p>
                <strong>
                  Processing Status:
                </strong>{' '}

                {
                  uploadResult
                    .processing_status
                }
              </p>

              <p>
                <strong>
                  Final Review Status:
                </strong>{' '}

                {
                  uploadResult
                    .final_status
                  ||
                  'trainer_review_pending'
                }
              </p>

              <p>
                <strong>
                  CV Method:
                </strong>{' '}

                OpenCV visual
                activity detection
              </p>

              <p>
                <strong>
                  Evidence Mapping:
                </strong>{' '}

                Temporal procedure mapping
              </p>

              <p>
                <strong>
                  Candidate Moments:
                </strong>{' '}

                {
                  evidenceFrames
                    .length
                }
              </p>

              {!selectedVideo && (

                <p>
                  ✓ Assessment restored
                  from persistent backend
                  storage.
                </p>

              )}

            </div>

          )}

        </section>


        {/* ==========================================
            RUBRIC
            ========================================== */}

        <section className="card">

          <h3>
            Task Competency Rubric
          </h3>

          <p className="rubric-hint">
            Predefined criteria for
            this assessment:
          </p>


          <div className="rubric-list">

            {
              rubricCriteria.map(
                (item) => {

                  const decision =
                    trainerDecisions[
                      item.id
                    ];


                  return (

                    <div
                      key={
                        item.id
                      }
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


                      {decision ===
                        'confirmed' && (

                        <span className="status-badge status-confirmed">
                          Confirmed
                        </span>

                      )}


                      {decision ===
                        'overridden' && (

                        <span className="status-badge status-overridden">
                          Overridden
                        </span>

                      )}


                      {!decision
                        &&
                        uploadResult
                        && (

                        <span className="status-badge status-pending">
                          Pending
                        </span>

                      )}

                    </div>

                  );

                }
              )
            }

          </div>

        </section>


        {/* ==========================================
            REAL EVIDENCE VIEWER
            ========================================== */}

        {uploadResult && (

          <section
            className="card"
            style={{
              gridColumn:
                '1 / -1'
            }}
          >

            <h3>
              CV Candidate Evidence
            </h3>

            <p className="rubric-hint">
              Real timestamped frames
              extracted from the learner&apos;s
              performance. Select a timestamp
              to inspect the corresponding
              moment in the video.
            </p>


            <div className="evidence-timeline">

              {
                evidenceFrames.map(
                  (frame) => (

                    <div
                      className="evidence-card"
                      key={
                        frame
                          .evidence_id
                      }
                    >


                      <div className="evidence-thumbnail-wrap">

                        <img
                          src={
                            getEvidenceImageUrl(
                              frame
                            )
                          }
                          alt={
                            `Evidence ${frame.evidence_id} at ${frame.timestamp}`
                          }
                          className="evidence-thumbnail"
                        />

                      </div>


                      <div className="evidence-top">

                        <span className="rubric-id">
                          {
                            frame
                              .evidence_id
                          }
                        </span>


                        <div>

                          <strong>
                            Candidate Moment
                          </strong>

                          <p>
                            Timestamp:{' '}
                            {
                              frame
                                .timestamp
                            }
                          </p>

                        </div>

                      </div>


                      <div className="evidence-details">

                        <span>
                          Activity score:{' '}

                          <strong>
                            {
                              frame
                                .activity_score
                            }
                          </strong>

                        </span>


                        {videoPreview && (

                          <button
                            className="btn-evidence-view"
                            onClick={
                              () =>
                                jumpToTimestamp(
                                  frame
                                    .timestamp_seconds
                                )
                            }
                          >
                            ▶ Jump to{' '}
                            {
                              frame
                                .timestamp
                            }
                          </button>

                        )}


                        <span className="status-badge status-pending">
                          Trainer Review
                        </span>

                      </div>

                    </div>

                  )
                )
              }

            </div>

          </section>

        )}


        {/* ==========================================
            PROCEDURE SEQUENCE ANALYSIS
            ========================================== */}

        {sequenceAnalysis && (

          <section
            className="card sequence-card"
            style={{
              gridColumn:
                '1 / -1'
            }}
          >

            <div className="sequence-header">

              <div>

                <h3>
                  Procedure Sequence Analysis
                </h3>

                <p className="rubric-hint">
                  Suggested evidence is checked
                  against the expected
                  chronological task order.
                </p>

              </div>


              <span
                className={
                  sequenceAnalysis
                    .sequence_status ===
                  'expected_order_observed'
                    ? 'sequence-status sequence-ok'
                    : 'sequence-status sequence-review'
                }
              >

                {sequenceAnalysis
                  .sequence_status ===
                'expected_order_observed'
                  ? '✓ Expected Order Observed'
                  : '⚠ Trainer Review Required'}

              </span>

            </div>


            <div className="sequence-flow">

              {
                (
                  sequenceAnalysis
                    .observed_order
                  || []
                ).map(
                  (
                    criterionId,
                    index
                  ) => (

                    <div
                      className="sequence-step"
                      key={
                        criterionId
                      }
                    >

                      <span>
                        Step {index + 1}
                      </span>

                      <strong>
                        {criterionId}
                      </strong>

                    </div>

                  )
                )
              }

            </div>


            <p className="sequence-note">

              Method:
              timestamp-order validation.
              Temporal suggestions support
              the review workflow and remain
              subject to trainer verification.

            </p>

          </section>

        )}


        {/* ==========================================
            TRAINER DASHBOARD
            ========================================== */}

        {reviewEvidence.length > 0 && (

          <section
            className="card"
            style={{
              gridColumn:
                '1 / -1'
            }}
          >


            <div className="trainer-header">

              <div>

                <h3>
                  Trainer Verification
                  Dashboard
                </h3>

                <p className="rubric-hint">
                  SkillProof suggests
                  criterion-specific candidate
                  evidence. The trainer makes
                  and saves the final decision.
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

              {
                reviewEvidence.map(
                  (criterion) => {

                    const criterionId =
                      criterion
                        .criterion_id;


                    const decision =
                      trainerDecisions[
                        criterionId
                      ];


                    return (

                      <div
                        className="trainer-review-card"
                        key={
                          criterionId
                        }
                      >


                        <div className="trainer-criterion">

                          <div className="rubric-id">
                            {criterionId}
                          </div>


                          <div>

                            <h4>
                              {
                                criterion
                                  .criterion_name
                              }
                            </h4>

                            <p>
                              {
                                criterion
                                  .criterion_description
                              }
                            </p>

                            <p>
                              Mapping method:{' '}
                              <strong>
                                Temporal procedure
                                mapping
                              </strong>
                            </p>

                          </div>

                        </div>


                        <div className="candidate-moments">

                          <strong>
                            Suggested Evidence
                          </strong>


                          <div className="timestamp-list">

                            {
                              (
                                criterion
                                  .candidate_evidence
                                || []
                              ).map(
                                (evidence) => (

                                  <button
                                    type="button"
                                    className="timestamp-chip timestamp-button"
                                    key={
                                      criterionId
                                      +
                                      evidence
                                        .evidence_id
                                    }
                                    onClick={
                                      () =>
                                        jumpToTimestamp(
                                          evidence
                                            .timestamp_seconds
                                        )
                                    }
                                  >

                                    {
                                      evidence
                                        .evidence_id
                                    }
                                    {' • '}
                                    {
                                      evidence
                                        .timestamp
                                    }

                                  </button>

                                )
                              )
                            }

                          </div>

                        </div>


                        <div className="trainer-actions">

                          <button
                            className={
                              decision ===
                              'confirmed'
                                ? 'btn-confirm active'
                                : 'btn-confirm'
                            }
                            onClick={
                              () =>
                                handleTrainerDecision(
                                  criterionId,
                                  'confirmed'
                                )
                            }
                          >
                            ✓ Confirm
                          </button>


                          <button
                            className={
                              decision ===
                              'overridden'
                                ? 'btn-override active'
                                : 'btn-override'
                            }
                            onClick={
                              () =>
                                handleTrainerDecision(
                                  criterionId,
                                  'overridden'
                                )
                            }
                          >
                            ✕ Override
                          </button>

                        </div>


                        <div className="trainer-note-section">

                          <label
                            htmlFor={
                              `note-${criterionId}`
                            }
                          >
                            Trainer Note
                          </label>


                          <textarea
                            id={
                              `note-${criterionId}`
                            }
                            className="trainer-note-input"
                            placeholder="Optional observation or reason for override..."
                            value={
                              trainerNotes[
                                criterionId
                              ]
                              || ''
                            }
                            onChange={
                              (event) =>
                                handleTrainerNote(
                                  criterionId,
                                  event.target.value
                                )
                            }
                          />

                        </div>


                        {decision && (

                          <div
                            className={
                              decision ===
                              'confirmed'
                                ? 'decision-result confirmed'
                                : 'decision-result overridden'
                            }
                          >

                            Trainer Decision:{' '}

                            <strong>

                              {decision ===
                              'confirmed'
                                ? 'CONFIRMED'
                                : 'OVERRIDDEN'}

                            </strong>

                          </div>

                        )}

                      </div>

                    );

                  }
                )
              }

            </div>


            <div className="review-save-panel">

              <button
                className="btn-primary"
                onClick={
                  saveTrainerReview
                }
                disabled={
                  isSavingReview
                  ||
                  completedDecisions
                    === 0
                }
              >

                {isSavingReview
                  ? 'Saving Review...'
                  : 'Save Trainer Review'}

              </button>


              {reviewSaved && (

                <div className="review-saved-message">

                  ✓ Trainer review saved
                  to persistent storage.

                </div>

              )}

            </div>


            {allCriteriaReviewed && (

              <div className="verification-complete">

                <h3>
                  ✓ Trainer Verification
                  Complete
                </h3>

                <p>
                  All competency criteria
                  have been reviewed.
                </p>


                <p>

                  <strong>
                    Assessment:
                  </strong>{' '}

                  {
                    uploadResult
                      .assessment_id
                  }

                </p>


                <button
                  className="btn-primary"
                  onClick={
                    generateFinalRecord
                  }
                >

                  Generate Verified
                  Assessment Record

                </button>

              </div>

            )}

          </section>

        )}


        {/* ==========================================
            VERIFIED RECORD
            ========================================== */}

        {showFinalRecord
          &&
          uploadResult
          && (

          <section
            id="verified-record"
            className="card verified-record"
            style={{
              gridColumn:
                '1 / -1'
            }}
          >


            <div className="verified-record-header">

              <div>

                <span className="verified-label">
                  TRAINER VERIFIED
                </span>

                <h2>
                  Verified Assessment
                  Record
                </h2>

                <p>
                  SkillProof AI —
                  Evidence-Linked Practical
                  Skill Assessment
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
                  {
                    uploadResult
                      .assessment_id
                  }
                </strong>

              </div>


              <div>

                <span>
                  Task
                </span>

                <strong>
                  {
                    uploadResult
                      .task
                  }
                </strong>

              </div>


              <div>

                <span>
                  Task ID
                </span>

                <strong>
                  {
                    uploadResult
                      .task_id
                  }
                </strong>

              </div>


              <div>

                <span>
                  Review Status
                </span>

                <strong>
                  5 / 5 Criteria
                  Reviewed
                </strong>

              </div>


            </div>


            <div className="verified-criteria">

              {
                rubricCriteria.map(
                  (criterion) => {

                    const decision =
                      trainerDecisions[
                        criterion.id
                      ];


                    const note =
                      trainerNotes[
                        criterion.id
                      ];


                    return (

                      <div
                        className="verified-criterion"
                        key={
                          criterion.id
                        }
                      >


                        <div className="verified-criterion-info">

                          <span className="rubric-id">
                            {
                              criterion.id
                            }
                          </span>


                          <div>

                            <strong>
                              {
                                criterion.name
                              }
                            </strong>

                            <p>
                              {
                                criterion.desc
                              }
                            </p>


                            {note && (

                              <p>
                                Trainer note:{' '}
                                {note}
                              </p>

                            )}

                          </div>

                        </div>


                        <span
                          className={
                            decision ===
                            'confirmed'
                              ? 'record-result confirmed'
                              : 'record-result overridden'
                          }
                        >

                          {decision ===
                          'confirmed'
                            ? '✓ CONFIRMED'
                            : '✕ OVERRIDDEN'}

                        </span>

                      </div>

                    );

                  }
                )
              }

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
                  TRAINER REVIEW
                  COMPLETE
                </strong>

              </div>


            </div>


            <div className="record-note">

              <strong>
                Persistent assessment:
              </strong>{' '}

              Trainer decisions,
              notes, video, evidence
              and assessment metadata
              are available through
              the backend.

              <br />
              <br />

              <strong>
                Human-in-the-loop
                safeguard:
              </strong>{' '}

              Computer vision and
              temporal mapping provide
              candidate evidence but
              do not independently
              certify learner
              competency.

            </div>

          </section>

        )}


      </main>

    </div>

  );

}


export default App;