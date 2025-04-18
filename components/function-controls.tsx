"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { FunctionConfig, ViewMode } from "@/lib/types"
import { Trash2, Plus, HelpCircle, Info, CuboidIcon as Cube } from "lucide-react"
import { functionTypes, lineStyles, functionExamples, function3DExamples, colorSchemes } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"

interface FunctionControlsProps {
  functions: FunctionConfig[]
  viewMode: ViewMode
  onAddFunction: (func: FunctionConfig) => void
  onUpdateFunction: (id: string, func: Partial<FunctionConfig>) => void
  onRemoveFunction: (id: string) => void
  onViewModeChange: (mode: ViewMode) => void
}

export default function FunctionControls({
  functions,
  viewMode,
  onAddFunction,
  onUpdateFunction,
  onRemoveFunction,
  onViewModeChange,
}: FunctionControlsProps) {
  const [newExpression, setNewExpression] = useState("")
  const [newType, setNewType] = useState("polynomial")
  const [newColor, setNewColor] = useState(colorSchemes.default[0])
  const [activeTab, setActiveTab] = useState<"2d" | "3d">("2d")

  const handleAddFunction = () => {
    if (!newExpression.trim()) return

    const newFunction: FunctionConfig = {
      id: Date.now().toString(),
      type: newType as any,
      expression: newExpression,
      color: newColor,
      visible: true,
      lineStyle: "solid",
      is3D: activeTab === "3d",
    }

    onAddFunction(newFunction)
    setNewExpression("")
  }

  const handleExampleClick = (example: string) => {
    setNewExpression(example)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "2d" | "3d")
    onViewModeChange(value as ViewMode)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="2d" className="flex items-center gap-1">
            <span>2D Functions</span>
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center gap-1">
            <Cube className="h-4 w-4" />
            <span>3D Functions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2d" className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Function Type" />
                </SelectTrigger>
                <SelectContent>
                  {functionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 p-1 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter function expression"
                value={newExpression}
                onChange={(e) => setNewExpression(e.target.value)}
              />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button size="icon" onClick={handleAddFunction}>
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Examples:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 px-2">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Show Examples
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    {Object.entries(functionExamples).map(([type, examples]) => (
                      <div key={type} className="space-y-1">
                        <h4 className="text-sm font-medium capitalize">{type}</h4>
                        <div className="flex flex-wrap gap-1">
                          {examples.map((example) => (
                            <Button
                              key={example}
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleExampleClick(example)}
                            >
                              {example}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {functions
                .filter((f) => !f.is3D)
                .map((func) => (
                  <motion.div
                    key={func.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.3 }}
                    className="p-3 border rounded-md space-y-2"
                    style={{
                      borderLeft: `4px solid ${func.color}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={func.visible}
                          onCheckedChange={(checked) => onUpdateFunction(func.id, { visible: checked })}
                          id={`visible-${func.id}`}
                        />
                        <Label htmlFor={`visible-${func.id}`} className="font-medium">
                          {func.expression}
                        </Label>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="ghost" size="icon" onClick={() => onRemoveFunction(func.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`type-${func.id}`} className="text-xs">
                          Type
                        </Label>
                        <Select
                          value={func.type}
                          onValueChange={(value) => onUpdateFunction(func.id, { type: value as any })}
                        >
                          <SelectTrigger id={`type-${func.id}`} className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {functionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`style-${func.id}`} className="text-xs">
                          Line Style
                        </Label>
                        <Select
                          value={func.lineStyle}
                          onValueChange={(value) => onUpdateFunction(func.id, { lineStyle: value as any })}
                        >
                          <SelectTrigger id={`style-${func.id}`} className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lineStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`expression-${func.id}`} className="text-xs">
                        Expression
                      </Label>
                      <Input
                        id={`expression-${func.id}`}
                        value={func.expression}
                        onChange={(e) => onUpdateFunction(func.id, { expression: e.target.value })}
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`color-${func.id}`} className="text-xs">
                        Color
                      </Label>
                      <Input
                        id={`color-${func.id}`}
                        type="color"
                        value={func.color}
                        onChange={(e) => onUpdateFunction(func.id, { color: e.target.value })}
                        className="h-8 p-1"
                      />
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="3d" className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 p-1 h-9"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">For 3D functions, enter an expression in terms of x and y variables</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter z = f(x,y) expression"
                value={newExpression}
                onChange={(e) => setNewExpression(e.target.value)}
              />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button size="icon" onClick={handleAddFunction}>
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Examples:</p>
              <div className="flex flex-wrap gap-1">
                {function3DExamples.map((example) => (
                  <motion.div key={example.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleExampleClick(example.value)}
                    >
                      {example.label}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {functions
                .filter((f) => f.is3D)
                .map((func) => (
                  <motion.div
                    key={func.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.3 }}
                    className="p-3 border rounded-md space-y-2"
                    style={{
                      borderLeft: `4px solid ${func.color}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={func.visible}
                          onCheckedChange={(checked) => onUpdateFunction(func.id, { visible: checked })}
                          id={`visible-${func.id}`}
                        />
                        <Label htmlFor={`visible-${func.id}`} className="font-medium">
                          z = {func.expression}
                        </Label>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="ghost" size="icon" onClick={() => onRemoveFunction(func.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>

                    <div>
                      <Label htmlFor={`expression-${func.id}`} className="text-xs">
                        Expression
                      </Label>
                      <Input
                        id={`expression-${func.id}`}
                        value={func.expression}
                        onChange={(e) => onUpdateFunction(func.id, { expression: e.target.value })}
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`color-${func.id}`} className="text-xs">
                        Color
                      </Label>
                      <Input
                        id={`color-${func.id}`}
                        type="color"
                        value={func.color}
                        onChange={(e) => onUpdateFunction(func.id, { color: e.target.value })}
                        className="h-8 p-1"
                      />
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
