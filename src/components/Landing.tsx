import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <section className="landing-section" id="landingDiv">
      <div className="landing-container">
        <div className="landing-intro">
          <p className="landing-hello">Hello! I'm</p>
          <h1>
            SHAIK MOHAMMED
            <br />
            <span>KAIF BASHA</span>
          </h1>
        </div>
        <div className="landing-info" aria-label="A Full Stack Developer and Engineer">
          <p className="landing-role">A Full Stack</p>
          <h2 className="landing-info-h2" aria-hidden="true">
            <div className="landing-h2-1">Developer</div>
            <div className="landing-h2-2">Engineer</div>
          </h2>
          <h2 aria-hidden="true">
            <div className="landing-h2-info">Engineer</div>
            <div className="landing-h2-info-1">Developer</div>
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
};

export default Landing;
