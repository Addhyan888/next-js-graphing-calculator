"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FunctionConfig, Point } from "@/lib/types"
import { ChartContainer } from "@/components/ui/chart"
import { ZoomIn, ZoomOut, RotateCcw, Grid, Download, RefreshCw } from "lucide-react"
import { colorSchemes } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"

interface GraphDisplayProps {
  data: Point[]
  functions: FunctionConfig[]
  xRange: { min: number; max: number }
  yRange: { min: number; max: number }
  onZoom: (factor: number) => void
  onPan: (xShift: number, yShift: number) => void
  onReset: () => void
}

// Accessible color schemes that work well for color vision deficiencies
const accessibleColorSchemes = {
  default: ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#56B4E9", "#D55E00", "#F0E442", "#999999"],
  contrast: ["#000000", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"],
  pastel: ["#66C2A5", "#FC8D62", "#8DA0CB", "#E78AC3", "#A6D854", "#FFD92F", "#E5C494", "#B3B3B3"],
  vibrant: ["#0077BB", "#EE7733", "#33BBEE", "#EE3377", "#009988", "#BBBBBB", "#000000"],
}

export default function GraphDisplay({ data, functions, xRange, yRange, onZoom, onPan, onReset }: GraphDisplayProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [colorScheme, setColorScheme] = useState("default")
  const [gridOpacity, setGridOpacity] = useState(0.2)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [showAxisLabels, setShowAxisLabels] = useState(true)
  const [lineThickness, setLineThickness] = useState(2)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Animation effect when data changes
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [data, functions])

  // Refresh animation for the graph
  const refreshGraph = useCallback(() => {
    setIsRefreshing(true)
    setAnimationKey((prev) => prev + 1)
    setTimeout(() => setIsRefreshing(false), 800)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastPosition.x
    const deltaY = e.clientY - lastPosition.y

    // Invert Y direction for intuitive panning
    onPan(-deltaX / 50, deltaY / 50)
    setLastPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Export chart as PNG
  const exportChart = () => {
    if (!chartRef.current) return

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const rect = chartRef.current.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Draw the chart on canvas using html2canvas
    import("html2canvas").then((html2canvas) => {
      html2canvas.default(chartRef.current!).then((canvas) => {
        // Create download link
        const link = document.createElement("a")
        link.download = "function-graph.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
      })
    })
  }

  // Create a config object for the ChartContainer
  const chartConfig = functions.reduce(
    (acc, func) => {
      if (func.visible && !func.is3D) {
        acc[func.id] = {
          label: func.expression,
          color: func.color,
        }
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  // Custom tooltip formatter for better readability
  const tooltipFormatter = (value: number) => {
    // Format the number to avoid too many decimal places
    return value.toFixed(4)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => onZoom(0.8)} title="Zoom In">
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom In
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => onZoom(1.25)} title="Zoom Out">
              <ZoomOut className="h-4 w-4 mr-1" />
              Zoom Out
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={onReset} title="Reset View">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={exportChart} title="Export Chart">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={refreshGraph} title="Refresh Animation">
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Animate
            </Button>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
            <Label htmlFor="show-grid">Grid</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-tooltip" checked={showTooltip} onCheckedChange={setShowTooltip} />
            <Label htmlFor="show-tooltip">Tooltip</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-axis-labels" checked={showAxisLabels} onCheckedChange={setShowAxisLabels} />
            <Label htmlFor="show-axis-labels">Axis Labels</Label>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="color-scheme" className="text-sm">
              Theme:
            </Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger id="color-scheme" className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="contrast">High Contrast</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <motion.div
        ref={containerRef}
        className="border rounded-md overflow-hidden cursor-move bg-gradient-to-br from-background to-muted/30"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div ref={chartRef} className={isAnimating ? "transition-all duration-500 ease-in-out" : ""}>
          <ChartContainer config={chartConfig} className="h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={gridOpacity} />}
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[xRange.min, xRange.max]}
                      tickCount={10}
                      label={
                        showAxisLabels
                          ? { value: "x", position: "insideBottomRight", offset: -10, fill: "#888" }
                          : undefined
                      }
                      tick={{ fill: "#888" }}
                    />
                    <YAxis
                      domain={[yRange.min, yRange.max]}
                      tickCount={10}
                      label={
                        showAxisLabels ? { value: "y", angle: -90, position: "insideLeft", fill: "#888" } : undefined
                      }
                      tick={{ fill: "#888" }}
                    />
                    {showTooltip && (
                      <Tooltip
                        formatter={tooltipFormatter}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    )}
                    <ReferenceLine x={0} stroke="#666" strokeWidth={1.5} />
                    <ReferenceLine y={0} stroke="#666" strokeWidth={1.5} />
                    <Legend
                      wrapperStyle={{ paddingTop: "10px" }}
                      formatter={(value) => <span style={{ color: "#666" }}>{value}</span>}
                    />

                    {functions.map((func, index) => {
                      if (!func.visible || func.is3D) return null

                      let strokeDasharray
                      switch (func.lineStyle) {
                        case "dashed":
                          strokeDasharray = "5 5"
                          break
                        case "dotted":
                          strokeDasharray = "1 5"
                          break
                        default:
                          strokeDasharray = "0"
                      }

                      // Use color from selected accessible scheme if not explicitly set
                      const color =
                        func.color === colorSchemes.default[0]
                          ? accessibleColorSchemes[colorScheme as keyof typeof accessibleColorSchemes][
                              index % accessibleColorSchemes[colorScheme as keyof typeof accessibleColorSchemes].length
                            ]
                          : func.color

                      return (
                        <Line
                          key={func.id}
                          type="monotone"
                          dataKey={func.id}
                          stroke={color}
                          strokeWidth={lineThickness}
                          dot={false}
                          activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
                          name={func.expression}
                          strokeDasharray={strokeDasharray}
                          isAnimationActive={true}
                          animationDuration={1000}
                          animationEasing="ease-in-out"
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </ChartContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Grid className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="grid-opacity" className="text-sm text-muted-foreground">
            Grid Opacity:
          </Label>
          <Slider
            id="grid-opacity"
            min={0}
            max={1}
            step={0.1}
            value={[gridOpacity]}
            onValueChange={([value]) => setGridOpacity(value)}
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="line-thickness" className="text-sm text-muted-foreground">
            Line Thickness:
          </Label>
          <Slider
            id="line-thickness"
            min={1}
            max={5}
            step={0.5}
            value={[lineThickness]}
            onValueChange={([value]) => setLineThickness(value)}
            className="w-32"
          />
        </div>
      </div>
    </div>
  )
}
