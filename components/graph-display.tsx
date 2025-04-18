"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FunctionConfig, Point } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ZoomIn, ZoomOut, RotateCcw, Grid, Download } from "lucide-react"
import { colorSchemes } from "@/lib/constants"
import { motion } from "framer-motion"

interface GraphDisplayProps {
  data: Point[]
  functions: FunctionConfig[]
  xRange: { min: number; max: number }
  yRange: { min: number; max: number }
  onZoom: (factor: number) => void
  onPan: (xShift: number, yShift: number) => void
  onReset: () => void
}

export default function GraphDisplay({ data, functions, xRange, yRange, onZoom, onPan, onReset }: GraphDisplayProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [colorScheme, setColorScheme] = useState("default")
  const [gridOpacity, setGridOpacity] = useState(0.2)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Animation effect when data changes
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [data, functions])

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
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
            <Label htmlFor="show-grid">Grid</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-tooltip" checked={showTooltip} onCheckedChange={setShowTooltip} />
            <Label htmlFor="show-tooltip">Tooltip</Label>
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
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="monochrome">Monochrome</SelectItem>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={gridOpacity} />}
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[xRange.min, xRange.max]}
                  tickCount={10}
                  label={{ value: "x", position: "insideBottomRight", offset: -10 }}
                />
                <YAxis
                  domain={[yRange.min, yRange.max]}
                  tickCount={10}
                  label={{ value: "y", angle: -90, position: "insideLeft" }}
                />
                {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
                <ReferenceLine x={0} stroke="#666" />
                <ReferenceLine y={0} stroke="#666" />
                <Legend />

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

                  // Use color from selected scheme if not explicitly set
                  const color =
                    func.color === colorSchemes.default[0]
                      ? colorSchemes[colorScheme as keyof typeof colorSchemes][
                          index % colorSchemes[colorScheme as keyof typeof colorSchemes].length
                        ]
                      : func.color

                  return (
                    <Line
                      key={func.id}
                      type="monotone"
                      dataKey={func.id}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
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
          </ChartContainer>
        </div>
      </motion.div>
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
    </div>
  )
}
