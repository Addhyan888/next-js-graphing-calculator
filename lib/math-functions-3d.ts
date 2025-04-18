import type { FunctionConfig } from "./types"
import * as SpecialFunctions from "./special-functions"

// Helper function to safely evaluate 3D mathematical expressions (z = f(x,y))
export function evaluate3DFunction(x: number, y: number, func: FunctionConfig): number {
  try {
    // Create a safe evaluation context
    const context = {
      x,
      y,
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

      // Special functions
      sinc: SpecialFunctions.sinc,
      sign: SpecialFunctions.sign,
      heaviside: SpecialFunctions.heaviside,

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
    }

    // Process the expression
    let processedExpression = func.expression

    // Replace ^ with ** for exponentiation
    processedExpression = processedExpression.replace(/\^/g, "**")

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
    console.error("Error evaluating 3D function:", error)
    return Number.NaN
  }
}

// Generate a grid of 3D points for the function
export function generate3DPoints(
  func: FunctionConfig,
  xRange: { min: number; max: number },
  yRange: { min: number; max: number },
  gridSize: number,
) {
  const points = []
  const xStep = (xRange.max - xRange.min) / gridSize
  const yStep = (yRange.max - yRange.min) / gridSize

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const x = xRange.min + i * xStep
      const y = yRange.min + j * yStep
      try {
        const z = evaluate3DFunction(x, y, func)
        if (!isNaN(z)) {
          points.push({ x, y, z, functionId: func.id })
        }
      } catch (error) {
        // Skip this point if evaluation fails
      }
    }
  }

  return points
}
