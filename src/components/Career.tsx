import "./styles/Career.css";

const Career = () => {
  return (
    <section className="career-section section-container">
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
                <h3>Freelance Web Developer</h3>
                <p className="career-company">Remote — Client Projects</p>
              </div>
              <p className="career-year">2025+</p>
            </div>
            <p>
              Designing and shipping production websites for clients in real
              estate, tourism, retail and finance — including a RERA-approved
              luxury housing site and a personal brand site for a US-based
              financial executive. Responsive, animated, SEO-ready builds
              delivered end to end.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h3>Python Developer Intern</h3>
                <p className="career-company">Zaalima Development</p>
              </div>
              <p className="career-year">2025</p>
            </div>
            <p>
              Developed FastAPI backend services and PostgreSQL-backed REST
              endpoints for web application workflows. Optimized queries and
              indexes to improve response performance, implemented
              user-management APIs, and collaborated in Git-based agile sprints
              with automated testing and debugging.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Career;
