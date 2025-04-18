// Bessel Functions
export function besselJ0(x: number): number {
  // Approximation of Bessel function of the first kind, order 0
  if (x === 0) return 1

  const ax = Math.abs(x)
  let ans1, ans2

  if (ax < 8.0) {
    const y = x * x
    ans1 =
      57568490574.0 +
      y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))))
    ans2 = 57568490411.0 + y * (1029532985.0 + y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y * 1.0))))
    return ans1 / ans2
  } else {
    const z = 8.0 / ax
    const y = z * z
    const xx = ax - 0.785398164
    ans1 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)))
    ans2 =
      -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)))
    return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2)
  }
}

export function besselJ1(x: number): number {
  // Approximation of Bessel function of the first kind, order 1
  if (x === 0) return 0

  const ax = Math.abs(x)
  let ans1, ans2

  if (ax < 8.0) {
    const y = x * x
    ans1 =
      x *
      (72362614232.0 +
        y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))))
    ans2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y * 1.0))))
    return ans1 / ans2
  } else {
    const z = 8.0 / ax
    const y = z * z
    const xx = ax - 2.356194491
    ans1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)))
    ans2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)))
    const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2)
    return x < 0.0 ? -ans : ans
  }
}

export function besselY0(x: number): number {
  // Approximation of Bessel function of the second kind, order 0
  if (x <= 0) return Number.NaN // Domain error

  let ans1, ans2

  if (x < 8.0) {
    const y = x * x
    ans1 =
      -2957821389.0 + y * (7062834065.0 + y * (-512359803.6 + y * (10879881.29 + y * (-86327.92757 + y * 228.4622733))))
    ans2 = 40076544269.0 + y * (745249964.8 + y * (7189466.438 + y * (47447.2647 + y * (226.1030244 + y * 1.0))))
    return ans1 / ans2 + 0.636619772 * besselJ0(x) * Math.log(x)
  } else {
    const z = 8.0 / x
    const y = z * z
    const xx = x - 0.785398164
    ans1 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)))
    ans2 =
      -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 + y * -0.934945152e-7)))
    return Math.sqrt(0.636619772 / x) * (Math.sin(xx) * ans1 + z * Math.cos(xx) * ans2)
  }
}

export function besselY1(x: number): number {
  // Approximation of Bessel function of the second kind, order 1
  if (x <= 0) return Number.NaN // Domain error

  let ans1, ans2

  if (x < 8.0) {
    const y = x * x
    ans1 =
      x *
      (-0.4900604943e13 +
        y *
          (0.127527439e13 + y * (-0.5153438139e11 + y * (0.7349264551e9 + y * (-0.4237922726e7 + y * 0.8511937935e4)))))
    ans2 =
      0.249958057e14 +
      y *
        (0.4244419664e12 +
          y * (0.3733650367e10 + y * (0.2245904002e8 + y * (0.102042605e6 + y * (0.3549632885e3 + y)))))
    return ans1 / ans2 + 0.636619772 * (besselJ1(x) * Math.log(x) - 1.0 / x)
  } else {
    const z = 8.0 / x
    const y = z * z
    const xx = x - 2.356194491
    ans1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)))
    ans2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)))
    return Math.sqrt(0.636619772 / x) * (Math.sin(xx) * ans1 + z * Math.cos(xx) * ans2)
  }
}

// Error Functions
export function erf(x: number): number {
  // Error function
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)

  // Constants
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  // Abramowitz and Stegun formula 7.1.26
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y
}

export function erfc(x: number): number {
  // Complementary error function
  return 1.0 - erf(x)
}

export function erfcx(x: number): number {
  // Scaled complementary error function
  return Math.exp(x * x) * erfc(x)
}

// Gamma Functions
export function gamma(x: number): number {
  // Gamma function using Lanczos approximation
  if (x <= 0) {
    if (Math.floor(x) === x) {
      return Number.NaN // Gamma is undefined for non-positive integers
    }
    // Reflection formula
    return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x))
  }

  // Lanczos approximation coefficients
  const p = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]

  if (x < 0.5) {
    return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x))
  }

  x -= 1
  let a = 0.99999999999980993
  for (let i = 0; i < p.length; i++) {
    a += p[i] / (x + i + 1)
  }

  const t = x + p.length - 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a
}

export function lngamma(x: number): number {
  // Natural logarithm of the gamma function
  return Math.log(Math.abs(gamma(x)))
}

export function digamma(x: number): number {
  // Digamma function (derivative of ln(gamma))
  // Approximation based on series expansion
  if (x <= 0 && Math.floor(x) === x) {
    return Number.NaN // Undefined for non-positive integers
  }

  // For negative x, use reflection formula
  if (x < 0) {
    return digamma(1 - x) - Math.PI / Math.tan(Math.PI * x)
  }

  // For small x, use recurrence relation to increase x
  let result = 0
  while (x < 10) {
    result -= 1 / x
    x += 1
  }

  // Asymptotic expansion for large x
  let r = 1 / x
  result += Math.log(x) - 0.5 * r
  r *= r
  result -= r * (1 / 12 - r * (1 / 120 - r * (1 / 252 - r * (1 / 240 - r * (1 / 132 - (r * 691) / 32760)))))

  return result
}

// Other Special Functions
export function sinc(x: number): number {
  // Sinc function: sin(x)/x
  return x === 0 ? 1 : Math.sin(x) / x
}

export function sign(x: number): number {
  // Sign function
  return x > 0 ? 1 : x < 0 ? -1 : 0
}

export function heaviside(x: number): number {
  // Heaviside step function
  return x > 0 ? 1 : x < 0 ? 0 : 0.5
}

export function lambertW(x: number): number {
  // Lambert W function (principal branch)
  // W(x) is the solution to W * e^W = x
  if (x < -0.36787944117144232159) {
    return Number.NaN // Domain error
  }

  // Initial guess
  let w
  if (x < 1) {
    w = x
  } else {
    w = Math.log(x)
  }

  // Halley's method
  for (let i = 0; i < 10; i++) {
    const ew = Math.exp(w)
    const wew = w * ew
    const wewx = wew - x
    const w1 = w + 1
    const delta = wewx / (ew * w1 - ((w + 2) * wewx) / (2 * w1))
    w -= delta
    if (Math.abs(delta) < 1e-10) break
  }

  return w
}

export function zeta(x: number): number {
  // Riemann zeta function (approximation for x > 1)
  if (x <= 1) return Number.NaN // Diverges for x <= 1 except at x = 0

  // Use the Dirichlet eta function and the relation zeta(s) = eta(s)/(1-2^(1-s))
  let sum = 0
  const maxTerms = 1000

  for (let n = 1; n < maxTerms; n++) {
    const term = Math.pow(-1, n + 1) / Math.pow(n, x)
    sum += term
    if (Math.abs(term) < 1e-10) break
  }

  return sum / (1 - Math.pow(2, 1 - x))
}

export function factorial(n: number): number {
  // Factorial function for non-negative integers
  if (n < 0 || Math.floor(n) !== n) return Number.NaN
  if (n === 0 || n === 1) return 1

  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

export function binomial(n: number, k: number): number {
  // Binomial coefficient (n choose k)
  if (k < 0 || n < 0 || Math.floor(n) !== n || Math.floor(k) !== k) return 0
  if (k > n) return 0
  if (k === 0 || k === n) return 1

  // Use symmetry to reduce calculations
  if (k > n - k) {
    k = n - k
  }

  let result = 1
  for (let i = 1; i <= k; i++) {
    result *= n - (k - i)
    result /= i
  }

  return result
}
