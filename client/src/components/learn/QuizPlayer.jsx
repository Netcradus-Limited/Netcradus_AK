import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

/**
 * QuizPlayer
 * 
 * Interactive student quiz assessment player.
 * Renders multiple-choice questions, tracks student selections,
 * submits answers to the server-side evaluation endpoint,
 * and renders results and retry options without exposing correct answer keys.
 */
export default function QuizPlayer({
  lecture,
  isCompleted,
  onQuizPassed,
  onNextLesson,
  hasNextLesson,
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  const questions = Array.isArray(lecture?.quiz) ? lecture.quiz : [];
  const totalQuestions = questions.length;

  // Reset quiz state whenever active lecture changes
  useEffect(() => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setSubmitError(null);
    setStartedAt(new Date().toISOString());
  }, [lecture?._id]);

  // Handle student selecting an option for a question
  const handleSelectOption = (questionId, optionIndex) => {
    if (quizSubmitted) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    if (submitError) setSubmitError(null);
  };

  const answeredCount = Object.keys(selectedAnswers).filter((qId) =>
    questions.some((q) => q._id === qId)
  ).length;

  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  // Handle quiz submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAllAnswered || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: Number(selectedAnswers[q._id]),
      }));

      const result = await studentService.submitQuiz(
        lecture._id,
        answersPayload,
        startedAt
      );

      setQuizResult(result);
      setQuizSubmitted(true);

      // If student passed, notify parent Learn component to update progress & completion state
      if (result.passed && onQuizPassed) {
        onQuizPassed(result);
      }
    } catch (err) {
      console.error('[QuizPlayer] Submission Error:', err);
      setSubmitError(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset state to allow student to retry a failed quiz
  const handleRetry = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setSubmitError(null);
    setStartedAt(new Date().toISOString());
  };

  // 1. Edge Case: Quiz with no questions published
  if (totalQuestions === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 30px',
          textAlign: 'center',
          maxWidth: '850px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(0, 210, 255, 0.1)',
            border: '1px solid var(--cyan-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--cyan-primary)',
            fontSize: '1.8rem',
          }}
        >
          <i className="fa-solid fa-clipboard-question"></i>
        </div>
        <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '10px' }}>
          {lecture.title || 'Lesson Quiz'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: 1.6 }}>
          No quiz questions have been published for this lesson yet.
        </p>
        {hasNextLesson && (
          <button onClick={onNextLesson} className="btn btn-cyan">
            <i className="fa-solid fa-arrow-right" style={{ marginRight: '8px' }}></i> Continue to Next Lesson
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* QUIZ HEADER CARD */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(0, 210, 255, 0.15)',
                color: 'var(--cyan-primary)',
                fontSize: '0.75rem',
                border: '1px solid var(--border-glow)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '4px 10px',
                borderRadius: '4px',
              }}
            >
              <i className="fa-solid fa-clipboard-question" style={{ marginRight: '5px' }}></i> Quiz Assessment
            </span>

            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-dark)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
            </span>

            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-dark)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Pass: 70%
            </span>
          </div>

          {isCompleted && (
            <span
              style={{
                fontSize: '0.82rem',
                color: '#2ed573',
                background: 'rgba(46, 213, 115, 0.1)',
                border: '1px solid rgba(46, 213, 115, 0.3)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <i className="fa-solid fa-circle-check"></i> Previously Passed
            </span>
          )}
        </div>

        <h1 style={{ color: 'var(--white)', fontSize: '1.75rem', marginBottom: '10px' }}>
          {lecture.title}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          {lecture.description || 'Answer all questions below and submit to evaluate your comprehension and earn lesson credit.'}
        </p>

        {/* PROGRESS BAR (While taking quiz) */}
        {!quizSubmitted && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Progress: <strong style={{ color: 'var(--cyan-primary)' }}>{answeredCount}</strong> of {totalQuestions} answered
              </span>
              <span style={{ color: isAllAnswered ? '#2ed573' : 'var(--text-muted)', fontWeight: 500 }}>
                {isAllAnswered ? 'All questions answered' : `${totalQuestions - answeredCount} remaining`}
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(answeredCount / totalQuestions) * 100}%`,
                  height: '100%',
                  background: isAllAnswered ? '#2ed573' : 'var(--cyan-primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* RESULT SCREEN AFTER SUBMISSION */}
      {quizSubmitted && quizResult && (
        <div
          style={{
            background: quizResult.passed ? 'rgba(46, 213, 115, 0.08)' : 'rgba(235, 77, 75, 0.08)',
            border: `1px solid ${quizResult.passed ? 'rgba(46, 213, 115, 0.35)' : 'rgba(235, 77, 75, 0.35)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            marginBottom: '28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: quizResult.passed ? 'rgba(46, 213, 115, 0.15)' : 'rgba(235, 77, 75, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: quizResult.passed ? '#2ed573' : '#eb4d4b',
              fontSize: '2rem',
            }}
          >
            <i className={`fa-solid ${quizResult.passed ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
          </div>

          <h2 style={{ color: 'var(--white)', fontSize: '1.6rem', marginBottom: '8px' }}>
            {quizResult.passed ? 'Quiz Passed!' : 'Quiz Needs Another Attempt'}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '22px' }}>
            {quizResult.passed
              ? `Outstanding! You scored ${quizResult.score} out of ${quizResult.totalQuestions} (${quizResult.percentage}%). This lesson is now marked as complete.`
              : `You scored ${quizResult.score} out of ${quizResult.totalQuestions} (${quizResult.percentage}%). A minimum score of ${quizResult.passingThreshold}% is required to pass.`}
          </p>

          {/* SCORE METRIC PILLS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '25px',
            }}
          >
            <div style={{ background: 'var(--bg-dark)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: quizResult.passed ? '#2ed573' : '#eb4d4b' }}>
                {quizResult.score} / {quizResult.totalQuestions}
              </div>
            </div>

            <div style={{ background: 'var(--bg-dark)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Percentage</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: quizResult.passed ? '#2ed573' : '#eb4d4b' }}>
                {quizResult.percentage}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-dark)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passing Goal</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                {quizResult.passingThreshold}%
              </div>
            </div>

            <div style={{ background: 'var(--bg-dark)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attempt</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--white)' }}>
                #{quizResult.attemptNumber || 1}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {quizResult.passed ? (
              <>
                {hasNextLesson && (
                  <button onClick={onNextLesson} className="btn btn-cyan" style={{ padding: '10px 22px', fontSize: '0.92rem' }}>
                    <i className="fa-solid fa-arrow-right" style={{ marginRight: '8px' }}></i> Continue to Next Lesson
                  </button>
                )}
                <button onClick={handleRetry} className="btn btn-outline-cyan" style={{ padding: '10px 20px', fontSize: '0.92rem' }}>
                  <i className="fa-solid fa-rotate-right" style={{ marginRight: '8px' }}></i> Retake Quiz
                </button>
              </>
            ) : (
              <button onClick={handleRetry} className="btn btn-cyan" style={{ padding: '10px 24px', fontSize: '0.92rem' }}>
                <i className="fa-solid fa-rotate-right" style={{ marginRight: '8px' }}></i> Retry Quiz Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUIZ FORM / QUESTIONS LIST */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          {questions.map((question, qIdx) => {
            const questionId = question._id;
            const currentSelected = selectedAnswers[questionId];
            const resultItem = quizResult?.results?.find((r) => r.questionId === questionId);

            return (
              <div
                key={questionId || qIdx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 28px',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'var(--transition)',
                }}
              >
                {/* Question Header & Review Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cyan-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Question {qIdx + 1} of {totalQuestions}
                  </span>

                  {quizSubmitted && resultItem && (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: resultItem.isCorrect ? '#2ed573' : '#eb4d4b',
                        background: resultItem.isCorrect ? 'rgba(46, 213, 115, 0.1)' : 'rgba(235, 77, 75, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <i className={`fa-solid ${resultItem.isCorrect ? 'fa-check' : 'fa-xmark'}`} />
                      {resultItem.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Question Title */}
                <h3 style={{ color: 'var(--white)', fontSize: '1.1rem', marginBottom: '18px', lineHeight: 1.5 }}>
                  {question.question}
                </h3>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(question.options || []).map((optionText, optIdx) => {
                    const isSelected = currentSelected === optIdx;
                    const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    // Styling for option rows
                    let optionBg = 'var(--bg-dark)';
                    let optionBorder = '1px solid var(--border-subtle)';
                    let optionColor = 'var(--text-main)';

                    if (isSelected) {
                      optionBg = 'rgba(0, 210, 255, 0.12)';
                      optionBorder = '1px solid var(--cyan-primary)';
                      optionColor = 'var(--white)';
                    }

                    if (quizSubmitted && resultItem && isSelected) {
                      if (resultItem.isCorrect) {
                        optionBg = 'rgba(46, 213, 115, 0.15)';
                        optionBorder = '1px solid #2ed573';
                      } else {
                        optionBg = 'rgba(235, 77, 75, 0.15)';
                        optionBorder = '1px solid #eb4d4b';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(questionId, optIdx)}
                        disabled={quizSubmitted}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 18px',
                          background: optionBg,
                          border: optionBorder,
                          borderRadius: 'var(--radius-sm)',
                          color: optionColor,
                          fontSize: '0.92rem',
                          textAlign: 'left',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          transition: 'var(--transition)',
                          width: '100%',
                        }}
                      >
                        {/* Radio Checkbox Indicator */}
                        <div style={{ fontSize: '1rem', color: isSelected ? (quizSubmitted && resultItem && !resultItem.isCorrect ? '#eb4d4b' : 'var(--cyan-primary)') : 'var(--text-muted)' }}>
                          <i className={`fa-solid ${isSelected ? 'fa-circle-dot' : 'fa-circle'}`} style={{ opacity: isSelected ? 1 : 0.4 }} />
                        </div>

                        {/* Option Letter Badge (A, B, C...) */}
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            background: isSelected ? 'var(--cyan-primary)' : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected ? '#000' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {optionLetter}
                        </span>

                        {/* Option Text */}
                        <span style={{ flex: 1, lineHeight: 1.4 }}>
                          {optionText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* SUBMISSION ACTION FOOTER (Only when quiz is not yet submitted) */}
        {!quizSubmitted && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px',
            }}
          >
            <div>
              <div style={{ color: 'var(--white)', fontSize: '0.95rem', fontWeight: 600 }}>
                {isAllAnswered ? 'Ready to Submit' : 'Incomplete Quiz'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {isAllAnswered
                  ? 'All questions answered. Submit to record your attempt.'
                  : `Please answer all ${totalQuestions} questions before submitting.`}
              </div>
            </div>

            {submitError && (
              <div
                style={{
                  width: '100%',
                  color: '#ff4757',
                  background: 'rgba(255, 71, 87, 0.1)',
                  border: '1px solid rgba(255, 71, 87, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isAllAnswered || submitting}
              className="btn btn-cyan"
              style={{
                padding: '12px 28px',
                fontSize: '0.95rem',
                opacity: !isAllAnswered ? 0.5 : 1,
                cursor: !isAllAnswered ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <span>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }} /> Evaluating Quiz...
                </span>
              ) : (
                <span>
                  <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }} /> Submit Quiz ({answeredCount}/{totalQuestions})
                </span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
