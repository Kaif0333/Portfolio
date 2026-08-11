import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward, MdArrowOutward } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";

const projects = [
  {
    title: "Gulshan Empire",
    category: "Real Estate Website — Freelance Client",
    tools: "TypeScript, React, Responsive Design, SEO",
    image: "/images/gulshan-empire.webp",
    live: "https://www.gulshan-empire.in/",
    github: "https://github.com/Kaif0333/Gulshan-Empire-Website",
  },
  {
    title: "SentinelStream",
    category: "FinTech Transaction Monitoring Backend",
    tools: "Python, FastAPI, PostgreSQL, Async SQLAlchemy, JWT",
    image: "/images/sentinelstream.webp",
    github: "https://github.com/Kaif0333/SentinelStream",
  },
  {
    title: "CuraMind AI",
    category: "Healthcare Diagnostic Platform",
    tools: "Python, Django, FastAPI, Celery, Redis, PostgreSQL, Docker",
    image: "/images/curamind-ai.webp",
    github: "https://github.com/Kaif0333/curamind-ai",
  },
  {
    title: "Patrick R. Coyle",
    category: "Personal Brand Site — USA Client",
    tools: "TypeScript, React, Animations, Vercel",
    image: "/images/patrick-coyle.webp",
    live: "https://patrick-rcoyle.vercel.app/",
    github: "https://github.com/Kaif0333/patrick-website",
  },
  {
    title: "Japan Tours",
    category: "Tourism Experience Website — Freelance",
    tools: "TypeScript, React, Animations",
    image: "/images/japan-tourism.webp",
    live: "https://japan-website-work.vercel.app/",
    github: "https://github.com/Kaif0333/JAPAN-Website",
  },
  {
    title: "RAYDZ",
    category: "Brand Shopping Experience — Freelance",
    tools: "Modern Web Design, Animations, E-commerce UI",
    image: "/images/raydz-shoes.webp",
    live: "https://raydz-shoes.vercel.app/",
  },
  {
    title: "Codian",
    category: "E-commerce UI — Mobile Compact",
    tools: "Mobile-first Design, E-commerce UI",
    image: "/images/codian-ui.webp",
    live: "https://codian-ui.vercel.app/",
  },
  {
    title: "Adverse Drug Effect Detection",
    category: "Machine Learning / NLP",
    tools: "Python, NLP, TF-IDF, Random Forest, Scikit-learn, Streamlit",
    image: "/images/adverse-drug.webp",
    github: "https://github.com/Kaif0333/Adverse-Drug-Effect-Detection",
  },
  {
    title: "Meeting Room Booking",
    category: "Full Stack Web Application",
    tools: "Java, JavaScript, HTML5, CSS3",
    image: "/images/meeting-room-booking.webp",
    github: "https://github.com/Kaif0333/meeting-room-booking",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <section className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div
          className="carousel-wrapper"
          role="region"
          aria-roledescription="carousel"
          aria-label="My projects"
        >
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack aria-hidden="true" />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward aria-hidden="true" />
          </button>

          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                width: `${projects.length * 100}%`,
                transform: `translateX(-${(currentIndex * 100) / projects.length}%)`,
              }}
            >
              {projects.map((project, index) => {
                const isCurrent = index === currentIndex;
                return (
                  <div
                    className="carousel-slide"
                    key={project.title}
                    style={{ width: `${100 / projects.length}%`, minWidth: "auto" }}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${projects.length}: ${project.title}`}
                    aria-hidden={!isCurrent}
                  >
                    <div className="carousel-content">
                      <div className="carousel-info">
                        <div className="carousel-number">
                          <h3 aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </h3>
                        </div>
                        <div className="carousel-details">
                          <h4>{project.title}</h4>
                          <p className="carousel-category">{project.category}</p>
                          <div className="carousel-tools">
                            <span className="tools-label">Tools & Features</span>
                            <p>{project.tools}</p>
                          </div>
                          <div className="carousel-links">
                            {project.live && (
                              <a
                                href={project.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="carousel-link"
                                tabIndex={isCurrent ? 0 : -1}
                              >
                                <MdArrowOutward aria-hidden="true" /> Live Site
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="carousel-link"
                                tabIndex={isCurrent ? 0 : -1}
                              >
                                <FaGithub aria-hidden="true" /> View Repository
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="carousel-image-wrapper">
                        <WorkImage
                          image={project.image}
                          alt={`Screenshot of ${project.title}`}
                          link={project.live}
                          eager={index === 0}
                          focusable={isCurrent}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="carousel-dots">
            {projects.map((project, index) => (
              <button
                key={project.title}
                className={`carousel-dot ${
                  index === currentIndex ? "carousel-dot-active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}: ${project.title}`}
                aria-current={index === currentIndex}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
