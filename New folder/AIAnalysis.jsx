import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, Upload, Sparkles, Loader, CheckCircle, AlertCircle, Image, FileText } from 'lucide-react'
import CompassRadarChart from './CompassRadarChart'

const AIAnalysis = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    architect: '',
    year: '',
    description: '',
    website: '',
    plot_area: '',
    floor_area: '',
    building_height: '',
    units: '',
    uph: '',
    far: '',
    green_space_ratio: '',
    densification_type: ''
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState('')
  const [autoDetectedInfo, setAutoDetectedInfo] = useState(null)
  const [projectImages, setProjectImages] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAutoDetect = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a project name first')
      return
    }

    setIsAutoDetecting(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name })
      })

      if (!response.ok) {
        throw new Error('Auto-detection failed')
      }

      const result = await response.json()
      
      if (result.auto_detected) {
        // Update form with detected information
        setFormData(prev => ({
          ...prev,
          ...result.project
        }))
        
        setAutoDetectedInfo(result.project)
        setProjectImages(result.project.images || [])
        setAnalysisResult(result.analysis)
        
        // Show success message
        setError('')
      } else {
        setError('Project not found in database. Please fill in the details manually.')
      }
    } catch (err) {
      setError('Auto-detection failed. Please try again or fill in manually.')
      console.error('Auto-detection error:', err)
    } finally {
      setIsAutoDetecting(false)
    }
  }

  const handleAnalyze = async () => {
    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    setIsAnalyzing(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result.analysis)
      setProjectImages(result.project?.images || [])
    } catch (err) {
      setError('Analysis failed. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      architect: '',
      year: '',
      description: '',
      website: '',
      plot_area: '',
      floor_area: '',
      building_height: '',
      units: '',
      uph: '',
      far: '',
      green_space_ratio: '',
      densification_type: ''
    })
    setAnalysisResult(null)
    setError('')
    setAutoDetectedInfo(null)
    setProjectImages([])
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={onBack}
            className="btn-secondary mr-4 p-3"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="heading-secondary">AI Project Analysis</h1>
            <p className="text-muted">Comprehensive AUG framework evaluation</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Project Information</h2>
              {autoDetectedInfo && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle size={16} className="mr-1" />
                  Auto-detected
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center"
              >
                <AlertCircle size={16} className="mr-2" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Project Name with Auto-Detect */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    className="form-input flex-1"
                  />
                  <button
                    onClick={handleAutoDetect}
                    disabled={isAutoDetecting || !formData.name.trim()}
                    className="btn-primary px-4 py-2 flex items-center space-x-2"
                    title="Auto-detect project information"
                  >
                    {isAutoDetecting ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Architect</label>
                  <input
                    type="text"
                    name="architect"
                    value={formData.architect}
                    onChange={handleInputChange}
                    placeholder="Architect name"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the project, its features, and sustainability aspects..."
                  className="form-textarea"
                  rows={4}
                />
              </div>

              {/* Technical Specifications */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plot Area (m²)</label>
                    <input
                      type="number"
                      name="plot_area"
                      value={formData.plot_area}
                      onChange={handleInputChange}
                      placeholder="10000"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Floor Area (m²)</label>
                    <input
                      type="number"
                      name="floor_area"
                      value={formData.floor_area}
                      onChange={handleInputChange}
                      placeholder="15000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Building Height (m)</label>
                    <input
                      type="number"
                      name="building_height"
                      value={formData.building_height}
                      onChange={handleInputChange}
                      placeholder="50"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Units</label>
                    <input
                      type="number"
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      placeholder="100"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">UPH (Units/Hectare)</label>
                    <input
                      type="number"
                      name="uph"
                      value={formData.uph}
                      onChange={handleInputChange}
                      placeholder="150"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">FAR (Floor Area Ratio)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="far"
                      value={formData.far}
                      onChange={handleInputChange}
                      placeholder="1.5"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Green Space Ratio (%)</label>
                    <input
                      type="number"
                      name="green_space_ratio"
                      value={formData.green_space_ratio}
                      onChange={handleInputChange}
                      placeholder="30"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Densification Type</label>
                    <select
                      name="densification_type"
                      value={formData.densification_type}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select densification strategy</option>
                      <option value="Vertical Densification">Vertical Densification</option>
                      <option value="Horizontal Densification">Horizontal Densification</option>
                      <option value="Mixed Densification">Mixed Densification</option>
                      <option value="Infill Development">Infill Development</option>
                      <option value="Redevelopment">Redevelopment</option>
                      <option value="Brownfield Development">Brownfield Development</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !formData.name.trim()}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      <span>Analyze Project</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetForm}
                  className="btn-secondary px-6"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Project Images */}
            {projectImages.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Image size={20} className="mr-2" />
                  Project Images
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {projectImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${formData.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Results */}
            <AnimatePresence>
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-semibold mb-6">Analysis Results</h3>
                  
                  {/* Compass Radar Chart */}
                  <div className="mb-8">
                    <CompassRadarChart 
                      data={analysisResult} 
                      size={350}
                      theme={document.body.className.includes('dark') ? 'dark' : 'light'}
                    />
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-4">
                    {Object.entries(analysisResult.categories || {}).map(([category, data]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold capitalize">{category}</h4>
                          <span className="text-lg font-bold text-blue-600">
                            {data.score}/120
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {data.criteria?.map((criterion, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{criterion.name}</span>
                              <span className="font-medium">{criterion.score}/20</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {analysisResult.recommendations && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {analysisResult.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority}
                            </span>
                            <span>{rec.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {(isAnalyzing || isAutoDetecting) && !analysisResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 text-center"
              >
                <Loader size={32} className="animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-muted">
                  {isAutoDetecting ? 'Detecting project information...' : 'Analyzing project...'}
                </p>
              </motion.div>
            )}

            {/* Empty State */}
            {!analysisResult && !isAnalyzing && !isAutoDetecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 text-center"
              >
                <Brain size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-muted">
                  Enter project information and click "Analyze Project" to get started
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysis

