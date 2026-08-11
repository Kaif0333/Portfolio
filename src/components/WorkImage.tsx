import { MdArrowOutward } from "react-icons/md";

interface Props {
  image: string;
  alt: string;
  link?: string;
  eager?: boolean;
  focusable?: boolean;
}

const WorkImage = ({ image, alt, link, eager, focusable = true }: Props) => {
  const img = (
    <img
      src={image}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      width={1280}
      height={800}
    />
  );

  return (
    <div className="work-image">
      {link ? (
        <a
          className="work-image-in"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="disable"
          tabIndex={focusable ? 0 : -1}
          aria-label={`${alt} — open live site`}
        >
          <div className="work-link">
            <MdArrowOutward aria-hidden="true" />
          </div>
          {img}
        </a>
      ) : (
        <div className="work-image-in">{img}</div>
      )}
    </div>
  );
};

export default WorkImage;
