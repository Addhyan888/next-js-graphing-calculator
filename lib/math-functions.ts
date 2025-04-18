import type { FunctionConfig } from "./types"
import * as SpecialFunctions from "./special-functions"

// Helper function to safely evaluate mathematical expressions
export function evaluateFunction(x: number, func: FunctionConfig): number {
  try {
    // Create a safe evaluation context
    const context = {
      x,
      // Standard Math functions
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10,
      log2: Math.log2,
      sqrt: Math.sqrt,
      abs: Math.abs,
      pow: Math.pow,
      PI: Math.PI,
      E: Math.E,

      // Bessel functions
      besselJ0: SpecialFunctions.besselJ0,
      besselJ1: SpecialFunctions.besselJ1,
      besselY0: SpecialFunctions.besselY0,
      besselY1: SpecialFunctions.besselY1,

      // Error functions
      erf: SpecialFunctions.erf,
      erfc: SpecialFunctions.erfc,
      erfcx: SpecialFunctions.erfcx,

      // Gamma functions
      gamma: SpecialFunctions.gamma,
      lngamma: SpecialFunctions.lngamma,
      digamma: SpecialFunctions.digamma,

      // Other special functions
      sinc: SpecialFunctions.sinc,
      sign: SpecialFunctions.sign,
      heaviside: SpecialFunctions.heaviside,
      lambertW: SpecialFunctions.lambertW,
      zeta: SpecialFunctions.zeta,
      factorial: SpecialFunctions.factorial,
      binomial: SpecialFunctions.binomial,
    }

    // Process the expression based on function type
    let processedExpression = func.expression

    // Replace ^ with ** for exponentiation
    processedExpression = processedExpression.replace(/\^/g, "**")

    // Handle special functions based on type
    switch (func.type) {
      case "polynomial":
        // Already handled by the ^ replacement
        break
      case "trigonometric":
        // Already handled by the context
        break
      case "exponential":
        // Replace e^x with Math.exp(x) if not already using exp()
        if (processedExpression.includes("e**") && !processedExpression.includes("exp(")) {
          processedExpression = processedExpression.replace(/e\*\*/g, "Math.exp(")
          // Add closing parentheses if needed
          if (!processedExpression.includes(")")) {
            processedExpression += ")"
          }
        }
        break
      case "logarithmic":
        // Already handled by the context
        break
      case "bessel":
        // Ensure proper function calls for Bessel functions
        break
      case "error":
        // Ensure proper function calls for error functions
        break
      case "gamma":
        // Ensure proper function calls for gamma functions
        break
      case "hyperbolic":
        // Already handled by the context
        break
      case "special":
        // Special functions are handled by the context
        break
    }

    // Create a function from the expression
    const evalFunction = new Function(
      ...Object.keys(context),
      `"use strict"; try { return ${processedExpression}; } catch (e) { return NaN; }`,
    )

    // Call the function with the context values
    const result = evalFunction(...Object.values(context))

    // Check if the result is a valid number
    if (typeof result !== "number" || !isFinite(result)) {
      return Number.NaN
    }

    return result
  } catch (error) {
    console.error("Error evaluating function:", error)
    return Number.NaN
  }
}
