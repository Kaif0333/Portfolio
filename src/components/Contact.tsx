import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <footer className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h2 className="contact-title">Contact</h2>
        <div className="contact-flex">
          <div className="contact-box">
            <h3>Email</h3>
            <p>
              <a href="mailto:smohammedkaifbasha@gmail.com" data-cursor="disable">
                smohammedkaifbasha@gmail.com
              </a>
            </p>
            <h3>Education</h3>
            <p>B.Tech CSE (AIML)</p>
          </div>
          <div className="contact-box">
            <h3>Social</h3>
            <a
              href="https://github.com/Kaif0333"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com/in/s-mohammedkaifbasha"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward aria-hidden="true" />
            </a>
            <a
              href="https://www.instagram.com/kaif._3/"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Instagram <MdArrowOutward aria-hidden="true" />
            </a>
          </div>
          <div className="contact-box">
            <p className="contact-credit">
              Designed and Developed <br /> by{" "}
              <span>Shaik Mohammed Kaif Basha</span>
            </p>
            <p className="contact-year">
              <MdCopyright aria-hidden="true" /> {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
