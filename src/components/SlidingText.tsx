import { ArrowTopRight } from "./icons"

export const SlidingText = ({
  text,
  arrow = false,
  className = "",
}: {
  text: string
  arrow?: boolean
  className?: string
}) => (
  <button className={`sliding-text ${className}`} type="button">
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
