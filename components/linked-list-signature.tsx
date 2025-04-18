"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react/jsx-runtime"

interface Node {
  id: number
  content: string | JSX.Element
}

export default function LinkedListSignature() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, content: "Made" },
    { id: 2, content: "by" },
    { id: 3, content: "α ∂ ∂ ħ γ α η" },
    {
      id: 4,
      content: (
        <div className="flex space-x-2">
          <Link href="https://github.com/addhyan888" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github className="h-4 w-4" />
          </Link>
          <Link href="https://linkedin.com/in/addhyan-awasthi-99a07630a" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </Link>
          <Link href="https://twitter.com/7_addhyan" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ])

  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full py-8 overflow-hidden bg-gradient-to-r from-background via-background/80 to-background"
    >
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl" />
                  <div className="relative z-10 bg-card border border-border/50 rounded-lg shadow-lg px-4 py-2 flex items-center justify-center min-w-[80px] h-[40px]">
                    <div className="text-sm font-medium">{node.content}</div>
                  </div>
                </motion.div>

                {index < nodes.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={isVisible ? { opacity: 1, width: "2rem" } : { opacity: 0, width: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.1 }}
                    className="mx-1 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                )}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: nodes.length * 0.2 }}
            className="mt-4 text-xs text-muted-foreground text-center"
          >
            A mathematical function visualizer with 2D and 3D capabilities
          </motion.div>
        </div>
      </div>
    </div>
  )
}
