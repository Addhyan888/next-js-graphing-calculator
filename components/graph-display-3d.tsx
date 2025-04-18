"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Grid, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { FunctionConfig, Point3D, GraphSettings } from "@/lib/types"
import { generate3DPoints } from "@/lib/math-functions-3d"
import { materialOptions } from "@/lib/constants"
import { RotateCcw, ZoomIn, ZoomOut, GridIcon } from "lucide-react"

// Define the GraphDisplay3DProps type
interface GraphDisplay3DProps {
  functions: FunctionConfig[]
  settings: GraphSettings
  onResetView: () => void
}

// Camera controller component to handle zoom
function CameraController({ zoomLevel }: { zoomLevel: number }) {
  const { camera } = useThree()

  useEffect(() => {
    // Update camera position based on zoom level
    camera.position.setLength(zoomLevel)
    camera.updateProjectionMatrix()
  }, [camera, zoomLevel])

  return null
}

function Surface({ points, color, materialType }: { points: Point3D[]; color: string; materialType: string }) {
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

  // Fill positions and colors arrays
  points.forEach((point, i) => {
    positions[i * 3] = point.x
    positions[i * 3 + 1] = point.z // Swap y and z for proper 3D orientation
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
          <lineBasicMaterial attach="material" color={color} vertexColors />
        </lineSegments>
      )}

      {materialType === "points" && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
            <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial attach="material" size={0.1} vertexColors />
        </points>
      )}

      {materialType === "normal" && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
            <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
            <bufferAttribute attach="index" array={new Uint16Array(indices)} count={indices.length} itemSize={1} />
          </bufferGeometry>
          <meshStandardMaterial
            attach="material"
            color={color}
            side={2} // Double-sided
            flatShading
            transparent
            opacity={0.8}
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
  const [allPoints, setAllPoints] = useState<Point3D[][]>([])
  const [zoomLevel, setZoomLevel] = useState(25) // Initial zoom level

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleResetCamera} title="Reset View">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>

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

      <div className="relative h-[500px] border rounded-md overflow-hidden">
        <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
          <CameraController zoomLevel={zoomLevel} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <directionalLight position={[-10, 10, 5]} intensity={0.5} />

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
              />
            </>
          )}

          {/* Function surfaces */}
          {allPoints.map((points, index) => {
            const func = functions.filter((f) => f.visible)[index]
            if (!func || !points.length) return null

            return <Surface key={func.id} points={points} color={func.color} materialType={materialType} />
          })}

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            enableDamping
            dampingFactor={0.05}
          />

          {/* Legend */}
          <Html position={[-15, 10, 0]} distanceFactor={15} transform>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-md">
              {functions
                .filter((f) => f.visible)
                .map((func) => (
                  <div key={func.id} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: func.color }} />
                    <span>{func.expression}</span>
                  </div>
                ))}
            </div>
          </Html>
        </Canvas>

        {/* Overlay controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
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
    </div>
  )
}
