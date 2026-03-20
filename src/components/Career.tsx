import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Python Developer Intern</h4>
                <h5>Zaalima Development</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Developed backend services with Python and FastAPI, writing clean and scalable code. Reduced query time by 30 percent through PostgreSQL optimization and indexing. Cut bug reports by 25 percent through automated testing and debugging. Collaborated with managers and engineers in agile sprints maintaining 99 percent uptime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
