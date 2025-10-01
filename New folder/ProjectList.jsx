import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ArrowLeft, Eye, BarChart3 } from 'lucide-react'

const ProjectList = ({ onBack, onSelectProject }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasScores = (project) => {
    return Object.keys(project.architectural_scores || {}).length > 0 ||
           Object.keys(project.urban_scores || {}).length > 0 ||
           Object.keys(project.green_scores || {}).length > 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Browse and analyze your architectural projects</p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">No projects found</p>
              <p className="text-gray-500">Create your first project to get started with AUG analysis</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {project.location && `${project.location} • `}
                        {project.year && project.year}
                      </CardDescription>
                    </div>
                    {hasScores(project) && (
                      <div className="ml-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" title="Analysis completed"></div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {project.image_url && (
                    <div className="mb-4">
                      <img 
                        src={project.image_url} 
                        alt={project.name}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  
                  {project.architect && (
                    <p className="text-sm text-gray-500 mb-4">
                      Architect: {project.architect}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onSelectProject(project.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {hasScores(project) ? (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => onSelectProject(project.id)}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          // TODO: Navigate to analysis page for this project
                          alert('Analysis feature coming soon!')
                        }}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analyze
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectList

