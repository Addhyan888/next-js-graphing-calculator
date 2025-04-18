export type FunctionType =
  | "polynomial"
  | "trigonometric"
  | "exponential"
  | "logarithmic"
  | "special"
  | "bessel"
  | "error"
  | "gamma"
  | "hyperbolic"

export type LineStyle = "solid" | "dashed" | "dotted"

export type ViewMode = "2d" | "3d"

export interface FunctionConfig {
  id: string
  type: FunctionType
  expression: string
  color: string
  visible: boolean
  lineStyle: LineStyle
  is3D?: boolean
}

export interface Point {
  x: number
  [key: string]: number | undefined
}

export interface Point3D {
  x: number
  y: number
  z: number
  functionId: string
}

export interface Range {
  min: number
  max: number
}

export interface GraphSettings {
  xRange: Range
  yRange: Range
  zRange?: Range
  resolution: number
  gridSize?: number
}
