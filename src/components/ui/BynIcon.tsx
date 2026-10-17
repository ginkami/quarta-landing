import { Fragment, type ReactNode } from "react";

/**
 * Belarusian ruble symbol using the official NBRB icon font
 * (ligature "BYN"; plain-text fallback when the font is unavailable).
 */
export function BynIcon() {
  return <i className="nbrb-icon">BYN</i>;
}

/**
 * Returns the text with every "BYN" occurrence rendered as <BynIcon />.
 * Content strings stay plain text — wrapping happens only at render time.
 */
export function renderBynText(text: string, keyPrefix = "byn"): ReactNode {
  const parts = text.split(/(BYN)/g);
  return parts.map((part, index) =>
    part === "BYN" ? (
      <BynIcon key={`${keyPrefix}-${index}`} />
    ) : (
      <Fragment key={`${keyPrefix}-${index}`}>{part}</Fragment>
    ),
  );
}
