import React, { useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";

export default function HomePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function goLearningWithQuery() {
    const q = query.trim();
    if (!user) {
      showToast("Please log in or register");
      return navigate("/login");
    }
    navigate(`/learning?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="page">

      <section className="hero">
        <div className="hero__inner container">
          <div className="hero__left">
            <h1>
              Turn knowledge <br /> into progress.
            </h1>

            <div className="hero__search">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm0-2a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm8.78 4.19-4.2-4.2 1.41-1.41 4.2 4.2-1.41 1.41Z"
                  fill="currentColor"
                />
              </svg>
              <input
                placeholder="Search tests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goLearningWithQuery();
                }}
              />
              <button className="btn btn--dark" onClick={goLearningWithQuery}>
                Search
              </button>
            </div>
          </div>

          <div className="hero__right" aria-hidden="true">
            <div className="grad-card grad-card--one">
              <div className="grad-cap" />
              <div className="grad-face" />
              <div className="grad-ribbon" />
            </div>
            <div className="grad-card grad-card--two">
              <div className="grad-cap" />
              <div className="grad-face" />
              <div className="grad-ribbon" />
            </div>
          </div>
        </div>
      </section>

      <section className="about" id="review">
        <div className="container">
          <h2 className="section-title">ABOUT US</h2>

          <div className="about__grid">
            <div className="about__text card">
              <p className="muted">
                We build an AI-powered learning platform that helps students
                learn smarter and mentors assess tests.
              </p>

              <h3 className="subhead">Our Mission</h3>
              <p className="muted">
                To make learning more effective by combining artificial
                intelligence, mentorship, and practical testing.
              </p>
            </div>

            <div className="about__steps card">
              <div className="timeline">
                <div className="tl-item">
                  <span className="dot dot--active" />
                  <div className="tl-text">AI Creates Tests</div>
                </div>

                <div className="tl-item">
                  <span className="dot" />
                  <div className="tl-text">Mentors Review</div>
                </div>

                <div className="tl-item">
                  <span className="dot" />
                  <div className="tl-text">Students Learn</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="teachers">
        <div className="teachers__inner container">
          <div className="teachers__left">
            <h2>For Teachers</h2>
            <p className="muted">
              Your expertise shapes the future. Mentor, inspire, and make a
              difference.
            </p>
            <div className="teachers__actions">
              <button className="btn btn--primary" onClick={() => {
                if (!user) {
                  showToast("Please log in or register");
                  return navigate("/login");
                }
                navigate("/review");
              }}>
                Become a Mentor
              </button>
              <button className="btn btn--ghost">Learn More</button>
            </div>
          </div>

          <div className="teachers__right" aria-hidden="true">
            <div className="mock">
              <div className="mock__header">
                <span className="pill" />
                <span className="pill" />
                <span className="pill" />
              </div>
              <div className="mock__row">
                <span className="mock__label">Test #1</span>
                <span className="mock__status ok">OK</span>
              </div>
              <div className="mock__row">
                <span className="mock__label">Test #2</span>
                <span className="mock__status warn">Review</span>
              </div>
              <div className="mock__row">
                <span className="mock__label">Test #3</span>
                <span className="mock__status ok">OK</span>
              </div>

              <div className="chart">
                <div className="bar bar--a" />
                <div className="bar bar--b" />
                <div className="bar bar--c" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="study" id="tests">
        <div className="study__inner container">
          <div className="study__left" aria-hidden="true">
            <div className="ai-icon">
              <div className="ai-chip">AI</div>
              <div className="ai-lines">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className="study__right">
            <h2>Tests for Study</h2>
            <p>
              Learn smarter, not harder. Prepare for exams with personalized AI
              practice tests.
            </p>
            <div className="study__actions">
              <button className="btn btn--dark" onClick={() => {
                if (!user) {
                  showToast("Please log in or register");
                  return navigate("/login");
                }
                navigate("/generator");
              }}>
                Start Now
              </button>
              <button className="btn btn--ghost" onClick={() => {
                if (!user) {
                  showToast("Please log in or register");
                  return navigate("/login");
                }
                navigate("/learning");
              }}>
                Browse Tests
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" id="learning">
        <div className="container footer__grid">
          <div>
            <div className="brand brand--footer">
              <span className="brand__dot" />
              <span className="brand__text">TestMentor</span>
            </div>
          </div>

          <div>
            <div className="footer__title">Need help?</div>
            <div className="footer__text muted">
              Contact our support team:
              <br />
              <a href="mailto:saya@gmail.com">s_amangeldinova@kbtu.kz</a>
            </div>

            <div className="footer__title mt">About</div>
            <div className="footer__text muted">
              This platform helps students generate practice tests and improve
              exam preparation using AI.
            </div>
          </div>

          <div>
            <div className="footer__title">Quick Links</div>
            <ul className="footer__links">
              <li><a href="#tests">Home</a></li>
              <li><a href="#tests">Generate Tests</a></li>
              <li><a href="#review">Review Panel</a></li>
              <li><a href="#learning">My Learning</a></li>
              <li><a href="#review">Contact</a></li>
            </ul>
          </div>

          <div className="footer__right muted">
            Amangeldinova Saya
            <br />
            University Project, 2026
          </div>
        </div>
      </footer>
    </div>
  );
}