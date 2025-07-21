
// Generate consistent, unique colors for projects
export const generateProjectColor = (projectName: string): string => {
  // Create a simple hash from the project name
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get existing project colors from localStorage to avoid duplicates
  const existingColors = getExistingProjectColors();
  
  // Google Material-inspired, bold, matte, accessible project colors
  const materialColors = [
    '#4285F4', // Google Blue
    '#EA4335', // Google Red
    '#FBBC05', // Google Yellow
    '#34A853', // Google Green
    '#A142F4', // Material Purple
    '#F44292', // Material Pink
    '#00B8D4', // Material Cyan
    '#FF7043', // Material Orange
    '#8E24AA', // Deep Purple
    '#F4B400', // Google Gold
    '#0B8043', // Google Dark Green
    '#C5221F', // Google Deep Red
    '#F09300', // Material Amber
    '#5E35B1', // Material Indigo
    '#039BE5', // Material Light Blue
    '#7CB342', // Material Light Green
    '#F4511E', // Material Deep Orange
    '#6D4C41', // Material Brown
    '#757575', // Material Gray
    '#009688', // Material Teal
  ];
  
  // Check if this project already has a color assigned
  const existingColor = existingColors[projectName];
  if (existingColor) {
    return existingColor;
  }
  
  // Replace all uses of 'softColors' with 'materialColors'
  const usedColors = Object.values(existingColors);
  const availableColors = materialColors.filter(color => !usedColors.includes(color));
  
  let selectedColor;
  if (availableColors.length > 0) {
    // Use hash to select from available colors
    const index = Math.abs(hash) % availableColors.length;
    selectedColor = availableColors[index];
  } else {
    // If all colors are used, fall back to hash-based selection
    const index = Math.abs(hash) % materialColors.length;
    selectedColor = materialColors[index];
  }
  
  // Store the color assignment
  const updatedColors = { ...existingColors, [projectName]: selectedColor };
  localStorage.setItem('project-colors', JSON.stringify(updatedColors));
  
  return selectedColor;
};

const getExistingProjectColors = (): Record<string, string> => {
  const saved = localStorage.getItem('project-colors');
  return saved ? JSON.parse(saved) : {};
};

export const isColorCodedProjectsEnabled = (): boolean => {
  const saved = localStorage.getItem('color-coded-projects-enabled');
  return saved ? JSON.parse(saved) : false;
};

// Utility to darken a hex color by a percentage
export function darkenHexColor(hex: string, percent: number = 20): string {
  // Remove # if present
  hex = hex.replace('#', '');
  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  // Decrease each by percent
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
