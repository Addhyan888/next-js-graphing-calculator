import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FunctionDocumentation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mathematical Functions Reference</CardTitle>
        <CardDescription>Documentation for available special functions</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="bessel">
            <AccordionTrigger>Bessel Functions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm">
                  Bessel functions are solutions to Bessel's differential equation. They are important in many physical
                  problems, especially those involving cylindrical symmetry.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <code>besselJ0(x)</code>: Bessel function of the first kind, order 0
                  </li>
                  <li>
                    <code>besselJ1(x)</code>: Bessel function of the first kind, order 1
                  </li>
                  <li>
                    <code>besselY0(x)</code>: Bessel function of the second kind, order 0
                  </li>
                  <li>
                    <code>besselY1(x)</code>: Bessel function of the second kind, order 1
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Example: <code>besselJ0(x)</code>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="error">
            <AccordionTrigger>Error Functions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm">
                  Error functions are special functions that occur in probability, statistics, and partial differential
                  equations.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <code>erf(x)</code>: Error function
                  </li>
                  <li>
                    <code>erfc(x)</code>: Complementary error function (1 - erf(x))
                  </li>
                  <li>
                    <code>erfcx(x)</code>: Scaled complementary error function (e^(x²) * erfc(x))
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Example: <code>erf(x)</code>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gamma">
            <AccordionTrigger>Gamma Functions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm">
                  The gamma function extends the factorial function to complex and non-integer numbers.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <code>gamma(x)</code>: Gamma function
                  </li>
                  <li>
                    <code>lngamma(x)</code>: Natural logarithm of the gamma function
                  </li>
                  <li>
                    <code>digamma(x)</code>: Derivative of the natural logarithm of the gamma function
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Example: <code>gamma(x)</code>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="special">
            <AccordionTrigger>Other Special Functions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm">Various other special functions used in mathematics and physics.</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <code>sinc(x)</code>: Sinc function (sin(x)/x)
                  </li>
                  <li>
                    <code>sign(x)</code>: Sign function
                  </li>
                  <li>
                    <code>heaviside(x)</code>: Heaviside step function
                  </li>
                  <li>
                    <code>lambertW(x)</code>: Lambert W function
                  </li>
                  <li>
                    <code>zeta(x)</code>: Riemann zeta function
                  </li>
                  <li>
                    <code>factorial(n)</code>: Factorial function
                  </li>
                  <li>
                    <code>binomial(n, k)</code>: Binomial coefficient
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Example: <code>sinc(x)</code>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
