"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FunctionControls from "./function-controls"
import GraphDisplay from "./graph-display"
import GraphDisplay3D from "./graph-display-3d"
import AIFunctionGenerator from "./ai-function-generator"
import type { FunctionConfig, Point, ViewMode, GraphSettings } from "@/lib/types"
import { evaluateFunction } from "@/lib/math-functions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import FunctionDocumentation from "./function-documentation"
import { colorSchemes } from "@/lib/constants"

export default function FunctionVisualizer() {
  const [functions, setFunctions] = useState<FunctionConfig[]>([
    {
      id: "1",
      type: "polynomial",
      expression: "x^2",
      color: colorSchemes.default[0],
      visible: true,
      lineStyle: "solid",
      is3D: false,
    },
  ])

  const [viewMode, setViewMode] = useState<ViewMode>("2d")
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<GraphSettings>({
    xRange: { min: -10, max: 10 },
    yRange: { min: -10, max: 10 },
    zRange: { min: -10, max: 10 },
    resolution: 200,
    gridSize: 30,
  })

  const handleAddFunction = (newFunction: FunctionConfig) => {
    // Assign a color from the scheme if not explicitly set
    if (newFunction.color === colorSchemes.default[0]) {
      const visibleFunctions = functions.filter((f) => f.visible && f.is3D === newFunction.is3D)
      const colorIndex = visibleFunctions.length % colorSchemes.default.length
      newFunction.color = colorSchemes.default[colorIndex]
    }

    setFunctions([...functions, newFunction])
  }

  const handleAddAIFunction = (expression: string, is3D: boolean) => {
    const newFunction: FunctionConfig = {
      id: Date.now().toString(),
      type: is3D ? "special" : "polynomial",
      expression: expression,
      color: colorSchemes.default[functions.length % colorSchemes.default.length],
      visible: true,
      lineStyle: "solid",
      is3D: is3D,
    }

    setFunctions([...functions, newFunction])

    // Switch to the appropriate view mode
    if (is3D && viewMode !== "3d") {
      setViewMode("3d")
    } else if (!is3D && viewMode !== "2d") {
      setViewMode("2d")
    }
  }

  const handleUpdateFunction = (id: string, updatedFunction: Partial<FunctionConfig>) => {
    setFunctions(functions.map((f) => (f.id === id ? { ...f, ...updatedFunction } : f)))
  }

  const handleRemoveFunction = (id: string) => {
    setFunctions(functions.filter((f) => f.id !== id))
  }

  const handleZoom = (factor: number) => {
    setSettings({
      ...settings,
      xRange: {
        min: settings.xRange.min * factor,
        max: settings.xRange.max * factor,
      },
      yRange: {
        min: settings.yRange.min * factor,
        max: settings.yRange.max * factor,
      },
      zRange: {
        min: (settings.zRange?.min || -10) * factor,
        max: (settings.zRange?.max || 10) * factor,
      },
    })
  }

  const handlePan = (xShift: number, yShift: number) => {
    const xSpan = settings.xRange.max - settings.xRange.min
    const ySpan = settings.yRange.max - settings.yRange.min

    setSettings({
      ...settings,
      xRange: {
        min: settings.xRange.min + xShift * xSpan * 0.1,
        max: settings.xRange.max + xShift * xSpan * 0.1,
      },
      yRange: {
        min: settings.yRange.min + yShift * ySpan * 0.1,
        max: settings.yRange.max + yShift * ySpan * 0.1,
      },
    })
  }

  const handleReset = () => {
    setSettings({
      ...settings,
      xRange: { min: -10, max: 10 },
      yRange: { min: -10, max: 10 },
      zRange: { min: -10, max: 10 },
    })
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const graphData = useMemo(() => {
    setError(null)

    try {
      const data: Point[] = []
      const step = (settings.xRange.max - settings.xRange.min) / settings.resolution

      for (let i = 0; i <= settings.resolution; i++) {
        const x = settings.xRange.min + i * step
        const point: Point = { x }

        functions.forEach((func) => {
          if (func.visible && !func.is3D) {
            try {
              point[func.id] = evaluateFunction(x, func)
            } catch (err) {
              // Skip this point if evaluation fails
            }
          }
        })

        data.push(point)
      }

      return data
    } catch (err) {
      setError("Error generating graph data. Please check your functions.")
      return []
    }
  }, [functions, settings.xRange, settings.resolution])

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="functions">
              <TabsList className="w-full">
                <TabsTrigger value="functions" className="flex-1">
                  Functions
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="docs" className="flex-1">
                  Docs
                </TabsTrigger>
              </TabsList>
              <TabsContent value="functions" className="mt-4">
                <FunctionControls
                  functions={functions}
                  viewMode={viewMode}
                  onAddFunction={handleAddFunction}
                  onUpdateFunction={handleUpdateFunction}
                  onRemoveFunction={handleRemoveFunction}
                  onViewModeChange={handleViewModeChange}
                />
              </TabsContent>
              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">X Range</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        value={settings.xRange.min}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            xRange: { ...settings.xRange, min: Number(e.target.value) },
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      />
                      <span className="flex items-center">to</span>
                      <input
                        type="number"
                        value={settings.xRange.max}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            xRange: { ...settings.xRange, max: Number(e.target.value) },
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Y Range</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        value={settings.yRange.min}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            yRange: { ...settings.yRange, min: Number(e.target.value) },
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      />
                      <span className="flex items-center">to</span>
                      <input
                        type="number"
                        value={settings.yRange.max}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            yRange: { ...settings.yRange, max: Number(e.target.value) },
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      />
                    </div>
                  </div>
                  {viewMode === "3d" && (
                    <div>
                      <label className="text-sm font-medium">Z Range</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="number"
                          value={settings.zRange?.min || -10}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              zRange: {
                                ...(settings.zRange || { min: -10, max: 10 }),
                                min: Number(e.target.value),
                              },
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        />
                        <span className="flex items-center">to</span>
                        <input
                          type="number"
                          value={settings.zRange?.max || 10}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              zRange: {
                                ...(settings.zRange || { min: -10, max: 10 }),
                                max: Number(e.target.value),
                              },
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Resolution</label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={settings.resolution}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          resolution: Number(e.target.value),
                        })
                      }
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">{settings.resolution} points</div>
                  </div>
                  {viewMode === "3d" && (
                    <div>
                      <label className="text-sm font-medium">Grid Size (3D)</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={settings.gridSize || 30}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            gridSize: Number(e.target.value),
                          })
                        }
                        className="w-full mt-1"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {settings.gridSize} × {settings.gridSize} grid
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="docs" className="mt-4">
                <FunctionDocumentation />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AIFunctionGenerator onAddFunction={handleAddAIFunction} />
      </div>

      <Card className="lg:col-span-3">
        <CardContent className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {viewMode === "2d" ? (
            <GraphDisplay
              data={graphData}
              functions={functions}
              xRange={settings.xRange}
              yRange={settings.yRange}
              onZoom={handleZoom}
              onPan={handlePan}
              onReset={handleReset}
            />
          ) : (
            <GraphDisplay3D functions={functions} settings={settings} onResetView={handleReset} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
