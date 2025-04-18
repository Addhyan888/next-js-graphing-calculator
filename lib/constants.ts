export const functionTypes = [
  { value: "polynomial", label: "Polynomial" },
  { value: "trigonometric", label: "Trigonometric" },
  { value: "exponential", label: "Exponential" },
  { value: "logarithmic", label: "Logarithmic" },
  { value: "special", label: "Special" },
  { value: "bessel", label: "Bessel Functions" },
  { value: "error", label: "Error Functions" },
  { value: "gamma", label: "Gamma Functions" },
  { value: "hyperbolic", label: "Hyperbolic" },
]

export const lineStyles = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
]

// Add examples for different function types
export const functionExamples = {
  polynomial: ["x^2", "3*x^3 - 2*x + 1", "x^4 - 4*x^2 + 4"],
  trigonometric: ["sin(x)", "cos(2*x)", "tan(x/2)"],
  exponential: ["exp(x)", "2^x", "exp(-x^2/2)"],
  logarithmic: ["log(x)", "log10(x)", "log2(x)"],
  special: ["sinc(x)", "sign(x)", "floor(x)"],
  bessel: ["besselJ0(x)", "besselJ1(x)", "besselY0(x)"],
  error: ["erf(x)", "erfc(x)", "erfcx(x)"],
  gamma: ["gamma(x)", "lngamma(x)", "digamma(x)"],
  hyperbolic: ["sinh(x)", "cosh(x)", "tanh(x)"],
}

// 3D function examples (z = f(x,y))
export const function3DExamples = [
  { label: "Simple Plane", value: "x + y" },
  { label: "Paraboloid", value: "x^2 + y^2" },
  { label: "Sine Wave", value: "sin(sqrt(x^2 + y^2))" },
  { label: "Ripple", value: "sin(x*x + y*y) / (x*x + y*y + 0.1)" },
  { label: "Saddle", value: "x^2 - y^2" },
  { label: "Gaussian", value: "exp(-(x^2 + y^2)/5)" },
  { label: "Mexican Hat", value: "(1 - (x^2 + y^2)/4) * exp(-(x^2 + y^2)/8)" },
  { label: "Sinc Product", value: "sinc(x) * sinc(y)" },
  { label: "Bessel", value: "besselJ0(sqrt(x^2 + y^2) * 2)" },
]

// Color schemes for graphs
export const colorSchemes = {
  default: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e"],
  pastel: ["#67e8f9", "#a5b4fc", "#fca5a5", "#86efac", "#fde68a", "#d8b4fe", "#f9a8d4", "#99f6e4", "#d9f99d"],
  vibrant: ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#65a30d", "#e11d48"],
  monochrome: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#f2f2f2"],
}

// 3D material options
export const materialOptions = [
  { label: "Normal", value: "normal" },
  { label: "Wireframe", value: "wireframe" },
  { label: "Points", value: "points" },
]
