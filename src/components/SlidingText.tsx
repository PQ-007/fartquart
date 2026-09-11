import { ArrowTopRight } from "./icons"

export const SlidingText = ({
  text,
  arrow = false,
  className = "",
  onClick,
  expanded,
}: {
  text: string
  arrow?: boolean
  className?: string
  /** Makes this a real control rather than decoration inside a link. */
  onClick?: () => void
  expanded?: boolean
}) => (
  <button
    className={`sliding-text ${className}`}
    type="button"
    onClick={onClick}
    aria-expanded={expanded}
  >
    <span className="sr-only">{text}</span>
    {text.split("").map((letter, i) => (
      <span key={i} className="letter" aria-hidden="true">
        {letter}
        <span>{letter}</span>
      </span>
    ))}
    {arrow && <ArrowTopRight />}
  </button>
)
