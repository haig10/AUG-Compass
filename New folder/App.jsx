import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Upload, BarChart3, Sparkles, Sun, Moon } from 'lucide-react'
import AIAnalysis from './components/AIAnalysis'
import ProjectList from './components/ProjectList'
import ProjectProfile from './components/ProjectProfile'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedProject, setSelectedProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [particles, setParticles] = useState([])
  const [theme, setTheme] = useState('light')

  // Initialize theme from localStorage or default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.body.className = `${savedTheme}-theme`
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.className = `${newTheme}-theme`
  }

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          duration: Math.random() * 20 + 10
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  const handleViewChange = (view, project = null) => {
    setCurrentView(view)
    if (project) {
      setSelectedProject(project)
    }
  }

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onViewChange={handleViewChange} />
      case 'create':
        return <AIAnalysis onBack={() => setCurrentView('home')} />
      case 'browse':
        return <ProjectList onBack={() => setCurrentView('home')} onSelectProject={handleViewChange} />
      case 'profile':
        return <ProjectProfile project={selectedProject} onBack={() => setCurrentView('browse')} />
      default:
        return <HomePage onViewChange={handleViewChange} />
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: theme === 'light' ? '#3b82f6' : '#60a5fa',
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{
            background: theme === 'light' 
              ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' 
              : 'linear-gradient(135deg, #1e40af, #3b82f6)'
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{
            background: theme === 'light' 
              ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' 
              : 'linear-gradient(135deg, #6d28d9, #8b5cf6)'
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-screen"
            >
              <div className="glass-card p-8 rounded-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="loading-spinner mx-auto"
                />
                <p className="text-muted mt-4 text-center font-medium">Loading...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentView}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              {renderCurrentView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const HomePage = ({ onViewChange }) => {
  const cardVariants = {
    hover: { 
      scale: 1.05, 
      y: -10,
      transition: { type: "spring", stiffness: 300 }
    },
    tap: { scale: 0.95 }
  }

  const iconVariants = {
    hover: { 
      rotate: 360,
      scale: 1.2,
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center glass-card">
            <Brain className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="heading-primary"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          AUG Analysis Platform
        </motion.h1>
        
        <motion.p 
          className="text-subtitle mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Sustainable City Housing Design Framework
        </motion.p>
        
        <motion.p 
          className="text-muted max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Harness the power of AI to analyze architectural projects based on Architectural, Urban, and Green criteria. 
          Get instant insights and comprehensive sustainability assessments.
        </motion.p>
      </motion.div>

      {/* Action Cards */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          className="feature-card group"
          onClick={() => onViewChange('create')}
        >
          <motion.div variants={iconVariants} className="icon-container green">
            <Upload className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-3">Create Project</h3>
          <p className="text-muted text-sm leading-relaxed mb-4">Add a new architectural project for comprehensive analysis</p>
          <motion.div 
            className="px-4 py-2 bg-green-500/20 rounded-lg text-green-600 text-sm font-medium inline-block"
            whileHover={{ scale: 1.05 }}
          >
            New Project
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          className="feature-card group"
          onClick={() => onViewChange('browse')}
        >
          <motion.div variants={iconVariants} className="icon-container blue">
            <BarChart3 className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-3">View Projects</h3>
          <p className="text-muted text-sm leading-relaxed mb-4">Browse and analyze your existing architectural projects</p>
          <motion.div 
            className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-600 text-sm font-medium inline-block"
            whileHover={{ scale: 1.05 }}
          >
            Browse Projects
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          className="feature-card group"
          onClick={() => onViewChange('manual')}
        >
          <motion.div variants={iconVariants} className="icon-container orange">
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-3">Manual Analysis</h3>
          <p className="text-muted text-sm leading-relaxed mb-4">Perform detailed manual scoring and analysis</p>
          <motion.div 
            className="px-4 py-2 bg-orange-500/20 rounded-lg text-orange-600 text-sm font-medium inline-block"
            whileHover={{ scale: 1.05 }}
          >
            Start Analysis
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          className="feature-card group relative"
          onClick={() => onViewChange('create')}
        >
          <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            NEW
          </div>
          <motion.div variants={iconVariants} className="icon-container purple">
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
          <p className="text-muted text-sm leading-relaxed mb-4">Let AI automatically analyze and score your projects</p>
          <motion.div 
            className="px-4 py-2 bg-purple-500/20 rounded-lg text-purple-600 text-sm font-medium inline-block"
            whileHover={{ scale: 1.05 }}
          >
            AI Analysis
          </motion.div>
        </motion.div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="glass-card p-12 rounded-3xl"
      >
        <h2 className="heading-secondary text-center mb-8">About the AUG Framework</h2>
        <p className="text-muted text-center mb-12 max-w-3xl mx-auto">
          A comprehensive methodology for evaluating sustainable housing design across three key dimensions
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <h3 className="text-xl font-semibold mb-4">Architectural (A)</h3>
            <ul className="text-muted text-sm space-y-2">
              <li>Compactness & Efficiency</li>
              <li>Shared Spaces & Community</li>
              <li>Flexibility & Adaptability</li>
              <li>Identity & Functionality</li>
            </ul>
          </motion.div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <h3 className="text-xl font-semibold mb-4">Urban (U)</h3>
            <ul className="text-muted text-sm space-y-2">
              <li>Open Spaces & Mixed Use</li>
              <li>Context & Human Scale</li>
              <li>Walkability & Access</li>
              <li>Neighborhood Benefits</li>
            </ul>
          </motion.div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              G
            </div>
            <h3 className="text-xl font-semibold mb-4">Green (G)</h3>
            <ul className="text-muted text-sm space-y-2">
              <li>Daylight & Air Quality</li>
              <li>Energy Efficiency</li>
              <li>Biophilia & Nature</li>
              <li>Special Solutions</li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="text-center mt-12 pt-8 border-t border-gray-200/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="flex justify-center items-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">360°</div>
              <div className="text-muted">Comprehensive Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">18</div>
              <div className="text-muted">Criteria</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">72</div>
              <div className="text-muted">Sub-criteria</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App

