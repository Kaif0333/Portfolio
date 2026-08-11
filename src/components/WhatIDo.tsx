import { useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const services = [
  {
    title: "FRONTEND",
    subtitle: "Building Interactive UIs",
    description:
      "Crafting responsive, animated interfaces with modern frameworks. From landing pages to full products, I deliver pixel-perfect experiences.",
    skills: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "GSAP",
      "Responsive Design",
    ],
  },
  {
    title: "BACKEND",
    subtitle: "Scalable Server Architecture",
    description:
      "Designing robust APIs and services with Python. From REST endpoints to async workflows, I build backends that scale.",
    skills: [
      "Python",
      "FastAPI",
      "Django",
      "Flask",
      "REST APIs",
      "PostgreSQL",
      "MongoDB",
      "Docker",
    ],
  },
];

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  const toggleCard = (container: HTMLDivElement | null) => {
    if (container) handleClick(container);
  };

  return (
    <section className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <span className="what-title-line">
            I<span className="do-h2"> DO</span>
          </span>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2" aria-hidden="true">
            <svg width="100%" aria-hidden="true" focusable="false">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`what-content ${
                ScrollTrigger.isTouch ? "" : "what-noTouch"
              }`}
              ref={(el) => setRef(el, index)}
              role="button"
              tabIndex={0}
              aria-label={`${service.title}: ${service.subtitle}`}
              onClick={() => {
                if (ScrollTrigger.isTouch) toggleCard(containerRef.current[index]);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleCard(containerRef.current[index]);
                }
              }}
            >
              <div className="what-border1" aria-hidden="true">
                <svg height="100%" aria-hidden="true" focusable="false">
                  {index === 0 && (
                    <line
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="0"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  )}
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />
                </svg>
              </div>
              <div className="what-corner" aria-hidden="true"></div>

              <div className="what-content-in">
                <h3>{service.title}</h3>
                <h4>{service.subtitle}</h4>
                <p>{service.description}</p>
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {service.skills.map((skill) => (
                    <div className="what-tags" key={skill}>
                      {skill}
                    </div>
                  ))}
                </div>
                <div className="what-arrow" aria-hidden="true"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
