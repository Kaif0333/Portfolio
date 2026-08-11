import { FaGithub, FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { hasFinePointer } from "./utils/motion";

const socialLinks = [
  {
    href: "https://github.com/Kaif0333",
    label: "GitHub profile",
    Icon: FaGithub,
  },
  {
    href: "https://linkedin.com/in/s-mohammedkaifbasha",
    label: "LinkedIn profile",
    Icon: FaLinkedinIn,
  },
  {
    href: "https://www.instagram.com/kaif._3/",
    label: "Instagram profile",
    Icon: FaInstagram,
  },
];

const SocialIcons = () => {
  useEffect(() => {
    if (!hasFinePointer()) return;
    const social = document.getElementById("social");
    if (!social) return;

    const spans = Array.from(social.querySelectorAll("span"));
    const items = spans
      .map((elem) => {
        const link = elem.querySelector("a");
        if (!link) return null;
        const rect = elem.getBoundingClientRect();
        return {
          elem,
          link: link as HTMLElement,
          mouseX: rect.width / 2,
          mouseY: rect.height / 2,
          currentX: 0,
          currentY: 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const onMouseMove = (e: MouseEvent) => {
      items.forEach((item) => {
        const rect = item.elem.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 40 && x > 10 && y < 40 && y > 5) {
          item.mouseX = x;
          item.mouseY = y;
        } else {
          item.mouseX = rect.width / 2;
          item.mouseY = rect.height / 2;
        }
      });
    };
    document.addEventListener("mousemove", onMouseMove);

    let rafId = 0;
    const updatePositions = () => {
      items.forEach((item) => {
        item.currentX += (item.mouseX - item.currentX) * 0.1;
        item.currentY += (item.mouseY - item.currentY) * 0.1;
        item.link.style.setProperty("--siLeft", `${item.currentX}px`);
        item.link.style.setProperty("--siTop", `${item.currentY}px`);
      });
      rafId = requestAnimationFrame(updatePositions);
    };
    rafId = requestAnimationFrame(updatePositions);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {socialLinks.map(({ href, label, Icon }) => (
          <span key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon aria-hidden="true" />
            </a>
          </span>
        ))}
      </div>
      <a
        className="resume-button"
        href="/Shaik_Mohammed_Kaif_Basha_Resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open resume PDF"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes aria-hidden="true" />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
