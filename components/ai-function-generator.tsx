"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Bot, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AIFunctionGeneratorProps {
  onAddFunction: (expression: string, is3D: boolean) => void
}

export default function AIFunctionGenerator({ onAddFunction }: AIFunctionGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"groq">("groq")
  const [dimension, setDimension] = useState<"2d" | "3d">("2d")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setResult("")
    setError(null)

    try {
      const response = await fetch("/api/generate-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: activeTab,
          dimension,
        }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      // Try to parse the JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)
        throw new Error("Failed to parse API response")
      }

      if (data.error) {
        setError(data.error)
      }

      if (data.expression) {
        setResult(data.expression)
      } else {
        throw new Error("No expression returned")
      }
    } catch (error) {
      console.error("Error generating function:", error)
      setError(`Error generating function: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Provide a fallback expression based on the dimension
      const fallbackExpression = dimension === "2d" ? "Math.sin(x)" : "Math.sin(x) * Math.cos(y)"
      setResult(fallbackExpression)
    } finally {
      setLoading(false)
    }
  }

  const handleUseFunction = () => {
    if (result) {
      onAddFunction(result, dimension === "3d")
      setResult("")
      setPrompt("")
      setError(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Function Generator
        </CardTitle>
        <CardDescription>
          Describe a mathematical function in natural language and let AI generate it for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value="groq" onValueChange={(value) => setActiveTab(value as "groq")}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <TabsList className="w-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-1 rounded-lg">
              <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="groq" className="w-full">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, ease: "linear", repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
                    >
                      <Bot className="h-4 w-4 text-purple-500" />
                    </motion.div>
                    <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                      Groq AI
                    </span>
                  </div>
                </TabsTrigger>
              </motion.div>
            </TabsList>
          </motion.div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant={dimension === "2d" ? "default" : "outline"} size="sm" onClick={() => setDimension("2d")}>
                2D Function
              </Button>
              <Button variant={dimension === "3d" ? "default" : "outline"} size="sm" onClick={() => setDimension("3d")}>
                3D Function
              </Button>
            </div>

            <Textarea
              placeholder={
                dimension === "2d"
                  ? "Describe a 2D function, e.g., 'a damped sine wave'"
                  : "Describe a 3D function, e.g., 'a mountain-like surface with multiple peaks'"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />

            {error && (
              <Alert variant="warning" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-mono">{result}</p>
                </div>
              </motion.div>
            )}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setPrompt("")
            setResult("")
            setError(null)
          }}
        >
          Clear
        </Button>
        <div className="flex gap-2">
          {result && <Button onClick={handleUseFunction}>Use Function</Button>}
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
