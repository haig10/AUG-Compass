import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ArrowLeft, Download } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

const ProjectProfile = ({ project: projectProp, onBack }) => {
  const [project, setProject] = useState(projectProp)
  const [profileData, setProfileData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectProp) {
      // If project is passed as prop, use it directly
      setProject(projectProp)
      fetchProjectProfile(projectProp)
    } else if (typeof projectProp === 'number' || typeof projectProp === 'string') {
      // If projectProp is an ID, fetch the project
      fetchProjectById(projectProp)
    }
  }, [projectProp])

  const fetchProjectById = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        fetchProjectProfile(data)
      } else {
        console.error('Failed to fetch project')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const fetchProjectProfile = async (projectData) => {
    try {
      const response = await fetch(`/api/projects/${projectData.id}/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfileData(data.profile)
      } else {
        console.error('Failed to fetch project profile')
      }
    } catch (error) {
      console.error('Error fetching project profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Architectural': return '#10B981' // green
      case 'Urban': return '#3B82F6' // blue
      case 'Green': return '#8B5CF6' // purple
      default: return '#6B7280' // gray
    }
  }

  const formatCriterionName = (name) => {
    // Shorten long names for better display
    const shortNames = {
      'Densification Human Scale': 'Densification',
      'Functionality Access': 'Functionality',
      'Costs Affordability': 'Costs',
      'Wind Air Quality': 'Air Quality',
      'Energy Efficiency': 'Energy',
      'Special Solutions': 'Solutions',
      'Neighborhood Benefits': 'Neighborhood'
    }
    return shortNames[name] || name
  }

  const calculateCategoryTotals = () => {
    const totals = {
      Architectural: 0,
      Urban: 0,
      Green: 0
    }
    
    profileData.forEach(item => {
      totals[item.category] += item.score
    })
    
    return totals
  }

  const categoryTotals = calculateCategoryTotals()
  const maxPossibleScore = 120 // 6 criteria × 20 points each

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading project profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-600">Project not found</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        {/* Project Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl text-gray-900">{project.name}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {project.location && `${project.location} • `}
                  {project.architect && `${project.architect} • `}
                  {project.year && project.year}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          {project.description && (
            <CardContent>
              <p className="text-gray-700">{project.description}</p>
            </CardContent>
          )}
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>AUG Profile</CardTitle>
                <CardDescription>
                  Sustainable Housing Design Analysis (0-20 points per criterion)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={profileData.map(item => ({
                      ...item,
                      criterion: formatCriterionName(item.criterion)
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis 
                        dataKey="criterion" 
                        tick={{ fontSize: 12 }}
                        className="text-xs"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 20]} 
                        tick={{ fontSize: 10 }}
                        tickCount={5}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="space-y-6">
            {/* Category Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Category Scores</CardTitle>
                <CardDescription>Total scores by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryTotals).map(([category, total]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium" style={{ color: getCategoryColor(category) }}>
                        {category}
                      </span>
                      <span className="text-sm font-bold">
                        {total}/{maxPossibleScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(total / maxPossibleScore) * 100}%`,
                          backgroundColor: getCategoryColor(category)
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((total / maxPossibleScore) * 100)}% of maximum
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Score</CardTitle>
                <CardDescription>Total AUG framework score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {Object.values(categoryTotals).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    out of 360 points
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(Object.values(categoryTotals).reduce((a, b) => a + b, 0) / 360) * 100}%`
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {Math.round((Object.values(categoryTotals).reduce((a, b) => a + b, 0) / 360) * 100)}% sustainability score
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Image */}
            {project.image_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={project.image_url} 
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.target.parentElement.style.display = 'none'
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detailed Scores Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detailed Scores</CardTitle>
            <CardDescription>
              Breakdown of scores by criterion and category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Criterion</th>
                    <th className="text-right py-2">Score</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getCategoryColor(item.category) }}
                        />
                        {item.category}
                      </td>
                      <td className="py-2">{item.criterion}</td>
                      <td className="text-right py-2 font-medium">{item.score}/20</td>
                      <td className="text-right py-2 text-gray-600">
                        {Math.round((item.score / 20) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectProfile

