/**
 * House configurations for the kundali chart
 * Each house has:
 * - name (H1-H12)
 * - position (top, topRight, right, etc.)
 * - dimensions (width and height as percentages for React Native)
 */
export const HOUSE_CONFIGS = [
  // House 1 - Top (Ascendant House)
  {
    name: "H1",
    position: "top",
    color: "transparent",
    dimensions: { width: "50%", height: "50%" },
  },

  // Houses in clockwise order
  // Houses 12, 11 (Top Right)
  {
    name: "H12",
    position: "topRight",
    color: "transparent",
    dimensions: { width: "50%", height: "25%" },
  },
  {
    name: "H11",
    position: "topRight",
    color: "transparent",
    dimensions: { width: "25%", height: "50%" },
  },

  // House 10 (Right)
  {
    name: "H10",
    position: "right",
    color: "transparent",
    dimensions: { width: "50%", height: "50%" },
  },

  // Houses 9, 8 (Bottom Right)
  {
    name: "H9",
    position: "bottomRight",
    color: "transparent",
    dimensions: { width: "25%", height: "50%" },
  },
  {
    name: "H8",
    position: "bottomRight",
    color: "transparent",
    dimensions: { width: "50%", height: "25%" },
  },

  // House 7 (Bottom)
  {
    name: "H7",
    position: "bottom",
    color: "transparent",
    dimensions: { width: "50%", height: "50%" },
  },

  // Houses 6, 5 (Bottom Left)
  {
    name: "H6",
    position: "bottomLeft",
    color: "transparent",
    dimensions: { width: "50%", height: "25%" },
  },
  {
    name: "H5",
    position: "bottomLeft",
    color: "transparent",
    dimensions: { width: "25%", height: "50%" },
  },

  // House 4 (Left)
  {
    name: "H4",
    position: "left",
    color: "transparent",
    dimensions: { width: "50%", height: "50%" },
  },

  // Houses 3, 2 (Top Left)
  {
    name: "H3",
    position: "topLeft",
    color: "transparent",
    dimensions: { width: "25%", height: "50%" },
  },
  {
    name: "H2",
    position: "topLeft",
    color: "transparent",
    dimensions: { width: "50%", height: "25%" },
  },
];
