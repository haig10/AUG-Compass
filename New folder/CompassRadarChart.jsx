import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const CompassRadarChart = ({ data, size = 400, theme = 'light' }) => {
  const svgRef = useRef(null)
  
  // Default data structure if none provided
  const defaultData = {
    categories: {
      architectural: { score: 85, criteria: [] },
      urban: { score: 90, criteria: [] },
      green: { score: 82, criteria: [] }
    }
  }
  
  const chartData = data || defaultData
  
  // Extract scores
  const scores = {
    architectural: chartData.categories?.architectural?.score || 0,
    urban: chartData.categories?.urban?.score || 0,
    green: chartData.categories?.green?.score || 0
  }
  
  // Convert scores to percentages (max 120 per category)
  const percentages = {
    architectural: (scores.architectural / 120) * 100,
    urban: (scores.urban / 120) * 100,
    green: (scores.green / 120) * 100
  }
  
  // Color scheme based on theme
  const colors = {
    light: {
      background: '#ffffff',
      border: '#e2e8f0',
      text: '#1e293b',
      textMuted: '#64748b',
      architectural: '#10b981',
      urban: '#3b82f6',
      green: '#059669',
      grid: '#f1f5f9',
      accent: '#6366f1'
    },
    dark: {
      background: '#1e293b',
      border: '#475569',
      text: '#f1f5f9',
      textMuted: '#cbd5e1',
      architectural: '#34d399',
      urban: '#60a5fa',
      green: '#10b981',
      grid: '#334155',
      accent: '#8b5cf6'
    }
  }
  
  const currentColors = colors[theme]
  
  useEffect(() => {
    if (!svgRef.current) return
    
    const svg = svgRef.current
    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = (size * 0.35)
    
    // Clear previous content
    svg.innerHTML = ''
    
    // Create compass background
    const createCompassBackground = () => {
      // Outer circle
      const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      outerCircle.setAttribute('cx', centerX)
      outerCircle.setAttribute('cy', centerY)
      outerCircle.setAttribute('r', maxRadius)
      outerCircle.setAttribute('fill', 'none')
      outerCircle.setAttribute('stroke', currentColors.border)
      outerCircle.setAttribute('stroke-width', '2')
      svg.appendChild(outerCircle)
      
      // Grid circles (25%, 50%, 75%, 100%)
      for (let i = 1; i <= 4; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', centerX)
        circle.setAttribute('cy', centerY)
        circle.setAttribute('r', (maxRadius * i) / 4)
        circle.setAttribute('fill', 'none')
        circle.setAttribute('stroke', currentColors.grid)
        circle.setAttribute('stroke-width', '1')
        circle.setAttribute('opacity', '0.5')
        svg.appendChild(circle)
      }
      
      // Compass lines (120° apart for A, U, G)
      const angles = [0, 120, 240] // degrees
      angles.forEach((angle, index) => {
        const radian = (angle - 90) * (Math.PI / 180) // -90 to start from top
        const x2 = centerX + maxRadius * Math.cos(radian)
        const y2 = centerY + maxRadius * Math.sin(radian)
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', centerX)
        line.setAttribute('y1', centerY)
        line.setAttribute('x2', x2)
        line.setAttribute('y2', y2)
        line.setAttribute('stroke', currentColors.grid)
        line.setAttribute('stroke-width', '1')
        line.setAttribute('opacity', '0.7')
        svg.appendChild(line)
      })
    }
    
    // Create data visualization
    const createDataVisualization = () => {
      const angles = [0, 120, 240] // A, U, G positions
      const categoryKeys = ['architectural', 'urban', 'green']
      const categoryColors = [currentColors.architectural, currentColors.urban, currentColors.green]
      
      // Create the main triangle shape
      const points = angles.map((angle, index) => {
        const radian = (angle - 90) * (Math.PI / 180)
        const percentage = percentages[categoryKeys[index]] / 100
        const radius = maxRadius * percentage
        const x = centerX + radius * Math.cos(radian)
        const y = centerY + radius * Math.sin(radian)
        return `${x},${y}`
      }).join(' ')
      
      // Main data polygon
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      polygon.setAttribute('points', points)
      polygon.setAttribute('fill', currentColors.accent)
      polygon.setAttribute('fill-opacity', '0.2')
      polygon.setAttribute('stroke', currentColors.accent)
      polygon.setAttribute('stroke-width', '2')
      svg.appendChild(polygon)
      
      // Data points and labels
      angles.forEach((angle, index) => {
        const radian = (angle - 90) * (Math.PI / 180)
        const percentage = percentages[categoryKeys[index]] / 100
        const radius = maxRadius * percentage
        const x = centerX + radius * Math.cos(radian)
        const y = centerY + radius * Math.sin(radian)
        
        // Data point
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        circle.setAttribute('r', '6')
        circle.setAttribute('fill', categoryColors[index])
        circle.setAttribute('stroke', currentColors.background)
        circle.setAttribute('stroke-width', '2')
        svg.appendChild(circle)
        
        // Label position (outside the circle)
        const labelRadius = maxRadius + 30
        const labelX = centerX + labelRadius * Math.cos(radian)
        const labelY = centerY + labelRadius * Math.sin(radian)
        
        // Category letter (A, U, G)
        const categoryLetter = categoryKeys[index].charAt(0).toUpperCase()
        const letterText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        letterText.setAttribute('x', labelX)
        letterText.setAttribute('y', labelY - 10)
        letterText.setAttribute('text-anchor', 'middle')
        letterText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif')
        letterText.setAttribute('font-size', '24')
        letterText.setAttribute('font-weight', 'bold')
        letterText.setAttribute('fill', categoryColors[index])
        letterText.textContent = categoryLetter
        svg.appendChild(letterText)
        
        // Score text
        const scoreText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        scoreText.setAttribute('x', labelX)
        scoreText.setAttribute('y', labelY + 8)
        scoreText.setAttribute('text-anchor', 'middle')
        scoreText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif')
        scoreText.setAttribute('font-size', '14')
        scoreText.setAttribute('font-weight', '600')
        scoreText.setAttribute('fill', currentColors.text)
        scoreText.textContent = `${scores[categoryKeys[index]]}/120`
        svg.appendChild(scoreText)
        
        // Category name
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        nameText.setAttribute('x', labelX)
        nameText.setAttribute('y', labelY + 24)
        nameText.setAttribute('text-anchor', 'middle')
        nameText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif')
        nameText.setAttribute('font-size', '12')
        nameText.setAttribute('fill', currentColors.textMuted)
        nameText.textContent = categoryKeys[index].charAt(0).toUpperCase() + categoryKeys[index].slice(1)
        svg.appendChild(nameText)
      })
    }
    
    // Create compass decorations
    const createCompassDecorations = () => {
      // Center point
      const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      centerDot.setAttribute('cx', centerX)
      centerDot.setAttribute('cy', centerY)
      centerDot.setAttribute('r', '4')
      centerDot.setAttribute('fill', currentColors.accent)
      svg.appendChild(centerDot)
      
      // Percentage labels on grid circles
      for (let i = 1; i <= 4; i++) {
        const percentage = (i * 25)
        const radius = (maxRadius * i) / 4
        const labelY = centerY - radius - 8
        
        const percentText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        percentText.setAttribute('x', centerX)
        percentText.setAttribute('y', labelY)
        percentText.setAttribute('text-anchor', 'middle')
        percentText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif')
        percentText.setAttribute('font-size', '10')
        percentText.setAttribute('fill', currentColors.textMuted)
        percentText.setAttribute('opacity', '0.7')
        percentText.textContent = `${percentage}%`
        svg.appendChild(percentText)
      }
    }
    
    // Build the chart
    createCompassBackground()
    createDataVisualization()
    createCompassDecorations()
    
  }, [data, size, theme, percentages, scores, currentColors])
  
  // Calculate overall score
  const totalScore = scores.architectural + scores.urban + scores.green
  const maxTotalScore = 360
  const overallPercentage = Math.round((totalScore / maxTotalScore) * 100)
  
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Chart Title */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-2" style={{ color: currentColors.text }}>
          AUG Analysis Compass
        </h3>
        <p className="text-sm" style={{ color: currentColors.textMuted }}>
          Architectural • Urban • Green Framework
        </p>
      </motion.div>
      
      {/* SVG Chart */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
      >
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="drop-shadow-lg"
          style={{ 
            background: currentColors.background,
            borderRadius: '50%',
            border: `2px solid ${currentColors.border}`
          }}
        />
      </motion.div>
      
      {/* Overall Score */}
      <motion.div 
        className="text-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="text-3xl font-bold mb-1" style={{ color: currentColors.accent }}>
          {overallPercentage}%
        </div>
        <div className="text-sm" style={{ color: currentColors.textMuted }}>
          Overall Sustainability Score
        </div>
        <div className="text-xs mt-1" style={{ color: currentColors.textMuted }}>
          {totalScore}/{maxTotalScore} points
        </div>
      </motion.div>
      
      {/* Legend */}
      <motion.div 
        className="flex justify-center space-x-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {[
          { key: 'architectural', label: 'Architectural', color: currentColors.architectural },
          { key: 'urban', label: 'Urban', color: currentColors.urban },
          { key: 'green', label: 'Green', color: currentColors.green }
        ].map((item) => (
          <div key={item.key} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium" style={{ color: currentColors.text }}>
              {item.label}
            </span>
            <span className="text-sm" style={{ color: currentColors.textMuted }}>
              ({scores[item.key]})
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default CompassRadarChart

