"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Grid, Html, useHelper } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { FunctionConfig, Point3D, GraphSettings } from "@/lib/types"
import { generate3DPoints } from "@/lib/math-functions-3d"
import { materialOptions } from "@/lib/constants"
import { RotateCcw, ZoomIn, ZoomOut, GridIcon, Eye, EyeOff, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { DirectionalLightHelper } from "three"
import type * as THREE from "three"

// Define the GraphDisplay3DProps type
interface GraphDisplay3DProps {
  functions: FunctionConfig[]
  settings: GraphSettings
  onResetView: () => void
}

// Accessible color palette for 3D visualization
const accessibleColors = [
  "#0072B2", // Blue
  "#E69F00", // Orange
  "#009E73", // Green
  "#CC79A7", // Pink
  "#56B4E9", // Light blue
  "#D55E00", // Red
  "#F0E442", // Yellow
  "#999999", // Grey
]

// Camera controller component to handle zoom and animations
function CameraController({ zoomLevel, autoRotate }: { zoomLevel: number; autoRotate: boolean }) {
  const { camera } = useThree()
  const prevZoomRef = useRef(zoomLevel)

  useFrame(() => {
    // Smooth zoom animation
    if (prevZoomRef.current !== zoomLevel) {
      const step = (zoomLevel - prevZoomRef.current) * 0.1
      if (Math.abs(step) < 0.01) {
        prevZoomRef.current = zoomLevel
      } else {
        prevZoomRef.current += step
      }
      camera.position.setLength(prevZoomRef.current)
      camera.updateProjectionMatrix()
    }
  })

  return null
}

// Lighting setup with helpers for better visualization
function SceneLighting({ showHelpers }: { showHelpers: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null)

  // Show light helper when enabled
  useHelper(showHelpers && lightRef, DirectionalLightHelper, 1, "#ff0000")

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight ref={lightRef} position={[10, 10, 10]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />
      <hemisphereLight args={["#ffffff", "#ddddff", 0.3]} />
    </>
  )
}

function Surface({
  points,
  color,
  materialType,
  opacity,
  animated,
}: {
  points: Point3D[]
  color: string
  materialType: string
  opacity: number
  animated: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  // Animation effect
  useEffect(() => {
    if (animated) {
      setAnimationProgress(0)
      const interval = setInterval(() => {
        setAnimationProgress((prev) => {
          const newValue = prev + 0.05
          if (newValue >= 1) {
            clearInterval(interval)
            return 1
          }
          return newValue
        })
      }, 20)
      return () => clearInterval(interval)
    } else {
      setAnimationProgress(1)
    }
  }, [animated, points])

  const positions = new Float32Array(points.length * 3)
  const colors = new Float32Array(points.length * 3)
  const indices: number[] = []

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16) / 255,
          g: Number.parseInt(result[2], 16) / 255,
          b: Number.parseInt(result[3], 16) / 255,
        }
      : { r: 1, g: 0, b: 0 }
  }

  const rgb = hexToRgb(color)

  // Fill positions and colors arrays with animation
  points.forEach((point, i) => {
    // Apply animation to z-coordinate
    const animatedZ = point.z * animationProgress

    positions[i * 3] = point.x
    positions[i * 3 + 1] = animatedZ // Animated height
    positions[i * 3 + 2] = point.y

    colors[i * 3] = rgb.r
    colors[i * 3 + 1] = rgb.g
    colors[i * 3 + 2] = rgb.b
  })

  // Create indices for triangles
  const gridSize = Math.sqrt(points.length)
  if (gridSize % 1 === 0) {
    // Check if it's a perfect square
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const a = i * gridSize + j
        const b = i * gridSize + j + 1
        const c = (i + 1) * gridSize + j
        const d = (i + 1) * gridSize + j + 1

        // First triangle
        indices.push(a, b, c)
        // Second triangle
        indices.push(b, d, c)
      }
    }
  }

  // Subtle animation for the surface
  useFrame(() => {
    if (meshRef.current && materialType === "normal") {
      meshRef.current.rotation.y += 0.001
    }
  })

  return (
    <>
      {materialType === "wireframe" && (
        <lineSegments>
          <edgesGeometry attach="geometry">
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={positions}
                count={positions.length / 3}
                itemSize={3}
              />
              <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
              <bufferAttribute attach="index" array={new Uint16Array(indices)} count={indices.length} itemSize={1} />
            </bufferGeometry>
          </edgesGeometry>
          <lineBasicMaterial attach="material" color={color} vertexColors opacity={opacity} transparent={opacity < 1} />
        </lineSegments>
      )}

      {materialType === "points" && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
            <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            attach="material"
            size={0.15}
            vertexColors
            opacity={opacity}
            transparent={opacity < 1}
            sizeAttenuation
          />
        </points>
      )}

      {materialType === "normal" && (
        <mesh ref={meshRef} castShadow receiveShadow>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
            <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
            <bufferAttribute attach="index" array={new Uint16Array(indices)} count={indices.length} itemSize={1} />
          </bufferGeometry>
          <meshPhysicalMaterial
            attach="material"
            color={color}
            side={2} // Double-sided
            flatShading
            transparent
            opacity={opacity}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      )}
    </>
  )
}

export default function GraphDisplay3D({ functions, settings, onResetView }: GraphDisplay3DProps) {
  const [showAxes, setShowAxes] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [materialType, setMaterialType] = useState("normal")
  const [autoRotate, setAutoRotate] = useState(false)
  const [gridOpacity, setGridOpacity] = useState(0.2)
  const [surfaceOpacity, setSurfaceOpacity] = useState(0.8)
  const [allPoints, setAllPoints] = useState<Point3D[][]>([])
  const [zoomLevel, setZoomLevel] = useState(25) // Initial zoom level
  const [showLightHelpers, setShowLightHelpers] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLegend, setShowLegend] = useState(true)

  const controlsRef = useRef<any>(null)

  // Generate 3D points for each function
  useEffect(() => {
    const newAllPoints = functions
      .filter((func) => func.visible)
      .map((func) => generate3DPoints(func, settings.xRange, settings.yRange, settings.gridSize || 30))
    setAllPoints(newAllPoints)
  }, [functions, settings])

  const handleResetCamera = useCallback(() => {
    setZoomLevel(25) // Reset zoom to initial value
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    onResetView()
  }, [onResetView])

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.max(5, prev * 0.8)) // Zoom in by reducing distance
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.min(100, prev * 1.2)) // Zoom out by increasing distance
  }, [])

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={handleResetCamera} title="Reset View">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={triggerAnimation} title="Animate">
              <RefreshCw className="h-4 w-4 mr-1" />
              Animate
            </Button>
          </motion.div>

          <div className="flex items-center space-x-2">
            <Switch id="show-axes" checked={showAxes} onCheckedChange={setShowAxes} />
            <Label htmlFor="show-axes">Axes</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
            <Label htmlFor="show-grid">Grid</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="auto-rotate" checked={autoRotate} onCheckedChange={setAutoRotate} />
            <Label htmlFor="auto-rotate">Rotate</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-legend" checked={showLegend} onCheckedChange={setShowLegend} />
            <Label htmlFor="show-legend">Legend</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="material-type" className="text-sm">
            Style:
          </Label>
          <Select value={materialType} onValueChange={setMaterialType}>
            <SelectTrigger id="material-type" className="h-8 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {materialOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        className="relative h-[500px] border rounded-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Canvas
          camera={{ position: [15, 15, 15], fov: 50 }}
          shadows
          dpr={[1, 2]} // Responsive rendering for different pixel ratios
        >
          <CameraController zoomLevel={zoomLevel} autoRotate={autoRotate} />
          <SceneLighting showHelpers={showLightHelpers} />

          {/* Coordinate system */}
          {showAxes && (
            <>
              {/* X-axis */}
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) => {
                    const max = Math.max(Math.abs(settings.xRange.min), Math.abs(settings.xRange.max))
                    self.setFromPoints([
                      { x: -max * 1.2, y: 0, z: 0 },
                      { x: max * 1.2, y: 0, z: 0 },
                    ])
                  }}
                />
                <lineBasicMaterial attach="material" color="red" />
              </line>
              <Text position={[settings.xRange.max * 1.3, 0, 0]} fontSize={0.8} color="red">
                X
              </Text>

              {/* Y-axis */}
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) => {
                    const max = Math.max(Math.abs(settings.yRange.min), Math.abs(settings.yRange.max))
                    self.setFromPoints([
                      { x: 0, y: 0, z: -max * 1.2 },
                      { x: 0, y: 0, z: max * 1.2 },
                    ])
                  }}
                />
                <lineBasicMaterial attach="material" color="green" />
              </line>
              <Text position={[0, 0, settings.yRange.max * 1.3]} fontSize={0.8} color="green">
                Y
              </Text>

              {/* Z-axis */}
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) => {
                    const max = settings.zRange
                      ? Math.max(Math.abs(settings.zRange.min), Math.abs(settings.zRange.max))
                      : 10
                    self.setFromPoints([
                      { x: 0, y: -max * 1.2, z: 0 },
                      { x: 0, y: max * 1.2, z: 0 },
                    ])
                  }}
                />
                <lineBasicMaterial attach="material" color="blue" />
              </line>
              <Text
                position={[0, settings.zRange?.max ? settings.zRange.max * 1.3 : 12, 0]}
                fontSize={0.8}
                color="blue"
              >
                Z
              </Text>
            </>
          )}

          {/* Grid */}
          {showGrid && (
            <>
              <Grid
                position={[0, 0, 0]}
                args={[40, 40]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#6b7280"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#4b5563"
                fadeDistance={40}
                fadeStrength={1}
                followCamera={false}
                infiniteGrid={true}
                visible={true}
                opacity={gridOpacity}
              />
            </>
          )}

          {/* Function surfaces */}
          {allPoints.map((points, index) => {
            const func = functions.filter((f) => f.visible)[index]
            if (!func || !points.length) return null

            // Use accessible colors if using default color
            const color = func.color === "#3b82f6" ? accessibleColors[index % accessibleColors.length] : func.color

            return (
              <Surface
                key={func.id}
                points={points}
                color={color}
                materialType={materialType}
                opacity={surfaceOpacity}
                animated={isAnimating}
              />
            )
          })}

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={100}
          />

          {/* Legend */}
          {showLegend && (
            <Html position={[-15, 10, 0]} distanceFactor={15} transform>
              <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-md">
                {functions
                  .filter((f) => f.visible)
                  .map((func, index) => {
                    // Use accessible colors if using default color
                    const color =
                      func.color === "#3b82f6" ? accessibleColors[index % accessibleColors.length] : func.color

                    return (
                      <div key={func.id} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span>{func.expression}</span>
                      </div>
                    )
                  })}
              </div>
            </Html>
          )}
        </Canvas>

        {/* Overlay controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowLightHelpers(!showLightHelpers)}
            title="Toggle light helpers"
          >
            {showLightHelpers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <GridIcon className="h-4 w-4 text-muted-foreground" />
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
          <Label htmlFor="surface-opacity" className="text-sm text-muted-foreground">
            Surface Opacity:
          </Label>
          <Slider
            id="surface-opacity"
            min={0.1}
            max={1}
            step={0.1}
            value={[surfaceOpacity]}
            onValueChange={([value]) => setSurfaceOpacity(value)}
            className="w-32"
          />
        </div>
      </div>
    </div>
  )
}
