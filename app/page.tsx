import FunctionVisualizer from "@/components/function-visualizer"
import { ThemeProvider } from "@/components/theme-provider"
import LinkedListSignature from "@/components/linked-list-signature"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
              Mathematical Function Visualizer
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore and visualize mathematical functions in both 2D and 3D. Customize parameters, compare multiple
              functions, and interact with dynamic graphs.
            </p>
          </header>
          <FunctionVisualizer />
        </div>
        <LinkedListSignature />
      </main>
    </ThemeProvider>
  )
}
