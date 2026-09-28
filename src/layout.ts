export interface LayoutInput {
  length: number;
  /** Persian letters read right-to-left; digits-only captchas read left-to-right. */
  rtl: boolean;
  width: number;
  height: number;
  fontSize: number;
}

const SLOT_STEP_RATIO = 0.6;
const JITTER_RATIO = 0.1;

export const maxJitter = (fontSize: number) => fontSize * JITTER_RATIO;

/**
 * Horizontal center of each answer character, indexed by answer position,
 * so that reading the image in the script's direction yields the answer.
 */
export function glyphCenters({
  length,
  rtl,
  width,
  height,
  fontSize,
}: LayoutInput): number[] {
  const step = fontSize * SLOT_STEP_RATIO;
  // A glyph box is at most ~fontSize wide, rotation included.
  const requiredWidth = (length - 1) * step + fontSize;
  const requiredHeight = fontSize + 2 * maxJitter(fontSize);

  if (requiredWidth > width) {
    throw new RangeError(
      `${length} characters at fontSize ${fontSize} need a width of at least ${Math.ceil(requiredWidth)}, received ${width}`,
    );
  }
  if (requiredHeight > height) {
    throw new RangeError(
      `fontSize ${fontSize} needs a height of at least ${Math.ceil(requiredHeight)}, received ${height}`,
    );
  }

  const firstSlot = width / 2 - ((length - 1) * step) / 2;
  return Array.from({ length }, (_, i) => {
    const slot = rtl ? length - 1 - i : i;
    return firstSlot + slot * step;
  });
}
