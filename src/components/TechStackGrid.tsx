const stack = [
  { name: "Python", icon: "/images/python.webp" },
  { name: "FastAPI", icon: "/images/FastAPI.webp" },
  { name: "Django", icon: "/images/Django.jpg" },
  { name: "PostgreSQL", icon: "/images/postgresql.jpg" },
  { name: "MongoDB", icon: "/images/mongo.webp" },
  { name: "MySQL", icon: "/images/mysql.webp" },
  { name: "React", icon: "/images/react2.webp" },
  { name: "Next.js", icon: "/images/next2.webp" },
  { name: "Node.js", icon: "/images/node2.webp" },
  { name: "Express", icon: "/images/express.webp" },
  { name: "TypeScript", icon: "/images/typescript.webp" },
  { name: "JavaScript", icon: "/images/javascript.webp" },
];

/** Lightweight tech-stack section for screens where the physics canvas is off. */
const TechStackGrid = () => {
  return (
    <section className="techstack-grid" aria-label="My tech stack">
      <h2>My Techstack</h2>
      <ul>
        {stack.map((tech) => (
          <li key={tech.name}>
            <img src={tech.icon} alt="" loading="lazy" width={42} height={42} />
            {tech.name}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TechStackGrid;
