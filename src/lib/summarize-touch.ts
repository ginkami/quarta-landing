/**
 * Pure formatter that turns one attribution touch object into display chips:
 * utm parameters first, then click ids, then referrer hostname and landing.
 * Empty touches produce an empty array (the UI shows «нет данных»).
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_KEYS = ["yclid", "gclid", "fbclid"] as const;

export interface TouchChip {
  readonly kind: "utm" | "click" | "referrer" | "landing";
  readonly label: string;
  readonly title: string;
}

function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname || value;
  } catch {
    return value;
  }
}

function pathOf(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return value;
    }
    return `${url.pathname}${url.search}` || value;
  } catch {
    return value;
  }
}

export function summarizeTouch(touch: Readonly<Record<string, string>>): TouchChip[] {
  const chips: TouchChip[] = [];

  for (const key of UTM_KEYS) {
    const value = touch[key];
    if (value) {
      chips.push({ kind: "utm", label: value, title: `${key}=${value}` });
    }
  }

  for (const key of CLICK_KEYS) {
    const value = touch[key];
    if (value) {
      chips.push({ kind: "click", label: value, title: `${key}=${value}` });
    }
  }

  if (touch.referrer) {
    chips.push({
      kind: "referrer",
      label: hostnameOf(touch.referrer),
      title: touch.referrer,
    });
  }

  if (touch.landing) {
    chips.push({
      kind: "landing",
      label: pathOf(touch.landing),
      title: touch.landing,
    });
  }

  return chips;
}
