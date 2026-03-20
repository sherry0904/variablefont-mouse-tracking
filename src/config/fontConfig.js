/**
 * Font configuration for the Mouse Tracking Landing Page.
 * Isolating this configuration makes it easy to swap variable fonts in the future.
 */
export const fontConfig = {
  family: "Roboto Flex Variable",
  axes: {
    // Weight (Thickness)
    wght: { min: 100, max: 1000, default: 400 },
    // Width (Stretch)
    wdth: { min: 25, max: 151, default: 100 },
    // Grade (Optical thickness without layout reflow)
    GRAD: { min: -200, max: 150, default: -200 },
    // Slant (Italic/oblique tilt)
    slnt: { min: -10, max: 0, default: 0 },
    // Main Stroke Weight (Thick Stroke)
    XOPQ: { min: 18, max: 175, default: 96 },
    // Thin Stroke Weight
    YOPQ: { min: 18, max: 135, default: 79 },
    // Counter Width (Space inside letters)
    XTRA: { min: 323, max: 603, default: 468 },
    // Optical Size (Visual size optimization)
    opsz: { min: 8, max: 144, default: 14 }
  }
};
