import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { ArrowLeft, Save, BarChart3 } from 'lucide-react'

const ProjectAnalysis = ({ onBack, projectId }) => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [currentCategory, setCurrentCategory] = useState('architectural')
  const [scores, setScores] = useState({
    architectural: {},
    urban: {},
    green: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const criteriaDefinitions = {
    architectural: {
      compactness: {
        title: 'Compactness',
        subcriteria: [
          { key: 'site_coverage_ratio', label: 'Site Coverage Ratio', description: 'Percentage of site covered by building footprint' },
          { key: 'floor_area_ratio', label: 'Floor Area Ratio (FAR)', description: 'Total floor area divided by site area' },
          { key: 'building_footprint_efficiency', label: 'Building Footprint Efficiency', description: 'Ratio of usable internal area to external wall area' },
          { key: 'verticality_horizontal_spread', label: 'Verticality/Horizontal Spread', description: 'Average building height vs. site area' }
        ]
      },
      shared_spaces: {
        title: 'Shared Spaces',
        subcriteria: [
          { key: 'proportion_shared_area', label: 'Proportion of Shared Area', description: 'Percentage of total building area dedicated to shared spaces' },
          { key: 'accessibility_shared_spaces', label: 'Accessibility of Shared Spaces', description: 'Proximity and ease of access to shared spaces for all residents' },
          { key: 'diversity_shared_functions', label: 'Diversity of Shared Functions', description: 'Number and variety of functions supported by shared spaces' },
          { key: 'management_maintenance_plan', label: 'Management and Maintenance Plan', description: 'Presence and clarity of a plan for shared space upkeep' }
        ]
      },
      new_forms_living: {
        title: 'New Forms of Living',
        subcriteria: [
          { key: 'adaptability_multi_generational', label: 'Adaptability for Multi-Generational Living', description: 'Design features supporting cohabitation of different age groups' },
          { key: 'integration_live_work', label: 'Integration of Live-Work Spaces', description: 'Provision for home offices or small business integration' },
          { key: 'support_community_interaction', label: 'Support for Community Interaction', description: 'Design elements encouraging informal social interaction' },
          { key: 'technological_integration', label: 'Technological Integration Readiness', description: 'Infrastructure for smart home technology and future upgrades' }
        ]
      },
      flexibility: {
        title: 'Flexibility',
        subcriteria: [
          { key: 'spatial_reconfigurability', label: 'Spatial Reconfigurability', description: 'Ease and cost of reconfiguring internal layouts' },
          { key: 'functional_adaptability', label: 'Functional Adaptability', description: 'Capacity for spaces to serve multiple functions over time' },
          { key: 'structural_modifiability', label: 'Structural Modifiability', description: 'Design allowing for future vertical or horizontal expansion/contraction' },
          { key: 'material_system_interchangeability', label: 'Material and System Interchangeability', description: 'Use of standardized or easily replaceable components' }
        ]
      },
      identity: {
        title: 'Identity',
        subcriteria: [
          { key: 'contextual_responsiveness', label: 'Contextual Responsiveness', description: 'Degree to which design reflects local culture, history, and architectural traditions' },
          { key: 'distinctive_features', label: 'Distinctive Architectural Features', description: 'Presence of unique design elements contributing to a sense of place' },
          { key: 'resident_personalization', label: 'Resident Personalization Potential', description: 'Opportunities for residents to customize their living spaces' },
          { key: 'public_perception', label: 'Public Perception and Appreciation', description: 'Community feedback and aesthetic appeal to the broader public' }
        ]
      },
      functionality_access: {
        title: 'Functionality and Access',
        subcriteria: [
          { key: 'universal_design', label: 'Universal Design Principles', description: 'Adherence to principles ensuring accessibility for all users' },
          { key: 'circulation_efficiency', label: 'Efficiency of Circulation', description: 'Clarity and directness of pathways within the building' },
          { key: 'proximity_services', label: 'Proximity to Essential Services', description: 'Walking/cycling distance to public transport, shops, schools' },
          { key: 'safety_security', label: 'Safety and Security Measures', description: 'Implementation of design features and systems for resident safety' }
        ]
      }
    },
    urban: {
      open_spaces: {
        title: 'Open Spaces',
        subcriteria: [
          { key: 'quantity_open_space', label: 'Quantity of Open Space', description: 'Percentage of site dedicated to open space' },
          { key: 'quality_open_space', label: 'Quality of Open Space', description: 'Design, landscaping, and amenities of open spaces' },
          { key: 'accessibility_open_space', label: 'Accessibility of Open Space', description: 'Ease of access for residents and public' },
          { key: 'integration_urban_fabric', label: 'Integration with Urban Fabric', description: 'How well open spaces connect with surrounding streets and buildings' }
        ]
      },
      mixed_use: {
        title: 'Mixed Use',
        subcriteria: [
          { key: 'diversity_functions', label: 'Diversity of Functions', description: 'Number and variety of residential, commercial, and public uses' },
          { key: 'integration_uses', label: 'Integration of Uses', description: 'How well different uses are blended vertically and horizontally' },
          { key: 'activity_throughout_day', label: 'Activity Throughout the Day', description: 'Presence of activity across different times of day' },
          { key: 'economic_viability', label: 'Economic Viability of Mixed Use', description: 'Balance of uses supporting economic sustainability' }
        ]
      },
      variation_context: {
        title: 'Variation in Context',
        subcriteria: [
          { key: 'respect_urban_grain', label: 'Respect for Existing Urban Grain', description: 'How new development relates to surrounding buildings' },
          { key: 'material_architectural_palette', label: 'Material and Architectural Palette', description: 'Use of materials and styles that complement local context' },
          { key: 'adaptability_topography', label: 'Adaptability to Site Topography', description: 'How well design responds to natural contours and features' },
          { key: 'preservation_heritage', label: 'Preservation of Heritage and Character', description: 'Efforts to retain and enhance historical features' }
        ]
      },
      densification_human_scale: {
        title: 'Densification and Human Scale',
        subcriteria: [
          { key: 'density_achieved', label: 'Density Achieved', description: 'Dwelling units per hectare/acre' },
          { key: 'pedestrian_experience', label: 'Pedestrian Experience', description: 'Design of streets and public spaces for pedestrian comfort' },
          { key: 'building_height_massing', label: 'Building Height and Massing', description: 'How building heights relate to human scale and context' },
          { key: 'permeability_connectivity', label: 'Permeability and Connectivity', description: 'Number of connections and pathways through the site' }
        ]
      },
      walkability: {
        title: 'Walkability',
        subcriteria: [
          { key: 'pedestrian_network_quality', label: 'Pedestrian Network Quality', description: 'Condition, width, and safety of sidewalks and paths' },
          { key: 'proximity_amenities', label: 'Proximity to Amenities', description: 'Average walking distance to daily necessities' },
          { key: 'streetscape_design', label: 'Streetscape Design', description: 'Presence of street trees, benches, lighting, and other elements' },
          { key: 'traffic_calming', label: 'Traffic Calming Measures', description: 'Implementation of strategies to reduce vehicle speed and volume' }
        ]
      },
      neighborhood_benefits: {
        title: 'Neighborhood Benefits',
        subcriteria: [
          { key: 'local_economic_contribution', label: 'Local Economic Contribution', description: 'Creation of local jobs and support for small businesses' },
          { key: 'social_cohesion', label: 'Social Cohesion and Interaction', description: 'Design elements fostering social interaction and community building' },
          { key: 'access_public_services', label: 'Access to Public Services', description: 'Proximity and quality of access to schools, healthcare, emergency services' },
          { key: 'environmental_improvement', label: 'Environmental Improvement', description: 'Contribution to local environmental quality' }
        ]
      }
    },
    green: {
      daylight: {
        title: 'Daylight',
        subcriteria: [
          { key: 'daylight_autonomy', label: 'Daylight Autonomy', description: 'Percentage of occupied hours when daylight alone meets illumination requirements' },
          { key: 'glare_control', label: 'Glare Control', description: 'Effectiveness of shading devices and window placement in preventing glare' },
          { key: 'view_quality', label: 'View Quality', description: 'Access to outdoor views from interior spaces' },
          { key: 'uniformity_daylight', label: 'Uniformity of Daylight', description: 'Even distribution of daylight throughout interior spaces' }
        ]
      },
      wind_air_quality: {
        title: 'Wind and Air Quality',
        subcriteria: [
          { key: 'natural_ventilation_potential', label: 'Natural Ventilation Potential', description: 'Design features supporting passive cooling and fresh air circulation' },
          { key: 'cross_ventilation_effectiveness', label: 'Cross-Ventilation Effectiveness', description: 'Design allowing for efficient air movement across spaces' },
          { key: 'indoor_air_pollutant_control', label: 'Indoor Air Pollutant Control', description: 'Use of low-VOC materials and effective filtration systems' },
          { key: 'outdoor_air_quality_impact', label: 'Outdoor Air Quality Impact', description: 'Design strategies to mitigate exposure to outdoor pollutants' }
        ]
      },
      energy_efficiency: {
        title: 'Energy Efficiency',
        subcriteria: [
          { key: 'building_envelope_performance', label: 'Building Envelope Performance', description: 'Insulation levels, window U-values, and air tightness' },
          { key: 'renewable_energy_integration', label: 'Renewable Energy Integration', description: 'On-site generation of renewable energy' },
          { key: 'efficient_hvac_systems', label: 'Efficient HVAC Systems', description: 'Use of high-efficiency heating, ventilation, and air conditioning systems' },
          { key: 'smart_energy_management', label: 'Smart Energy Management', description: 'Implementation of building management systems and smart controls' }
        ]
      },
      costs_affordability: {
        title: 'Costs and Affordability',
        subcriteria: [
          { key: 'initial_construction_cost', label: 'Initial Construction Cost', description: 'Per square meter cost of construction' },
          { key: 'lifecycle_cost_analysis', label: 'Lifecycle Cost Analysis', description: 'Long-term operational and maintenance costs' },
          { key: 'affordability_target_demographics', label: 'Affordability for Target Demographics', description: 'Housing prices/rents relative to local income levels' },
          { key: 'financial_incentives', label: 'Financial Incentives and Subsidies', description: 'Utilization of government programs or financial aid' }
        ]
      },
      biophilia: {
        title: 'Biophilia',
        subcriteria: [
          { key: 'connection_nature_buildings', label: 'Connection to Nature within Buildings', description: 'Integration of natural elements, views, and patterns indoors' },
          { key: 'access_green_spaces', label: 'Access to Green Spaces', description: 'Proximity and quality of access to parks, gardens, and natural landscapes' },
          { key: 'use_natural_materials', label: 'Use of Natural Materials', description: 'Incorporation of natural, non-toxic, and sustainably sourced materials' },
          { key: 'biodiversity_enhancement', label: 'Biodiversity Enhancement', description: 'Design features supporting local flora and fauna' }
        ]
      },
      special_solutions: {
        title: 'Special Solutions',
        subcriteria: [
          { key: 'water_harvesting_reuse', label: 'Water Harvesting and Reuse', description: 'Implementation of systems for rainwater collection and greywater recycling' },
          { key: 'waste_management_recycling', label: 'Waste Management and Recycling', description: 'Provision for efficient waste segregation, composting, and recycling' },
          { key: 'resilience_climate_change', label: 'Resilience to Climate Change', description: 'Design strategies to withstand extreme weather events' },
          { key: 'innovative_technologies', label: 'Innovative Technologies/Materials', description: 'Adoption of cutting-edge solutions for sustainability and performance' }
        ]
      }
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        if (projectId) {
          setSelectedProject(projectId)
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleScoreChange = (category, criterion, subcriterion, value) => {
    setScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [`${criterion}_${subcriterion}`]: value[0]
      }
    }))
  }

  const handleSubmit = async () => {
    if (!selectedProject) {
      alert('Please select a project first')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${selectedProject}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          architectural_responses: scores.architectural,
          urban_responses: scores.urban,
          green_responses: scores.green
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Analysis completed successfully!')
        // Navigate to profile view
        window.location.href = `#profile-${selectedProject}`
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to analyze project'}`)
      }
    } catch (error) {
      console.error('Error analyzing project:', error)
      alert('Failed to analyze project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCriteriaForm = (category) => {
    const criteria = criteriaDefinitions[category]
    
    return (
      <div className="space-y-8">
        {Object.entries(criteria).map(([criterionKey, criterion]) => (
          <Card key={criterionKey}>
            <CardHeader>
              <CardTitle className="text-lg">{criterion.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {criterion.subcriteria.map((subcriterion) => {
                  const scoreKey = `${criterionKey}_${subcriterion.key}`
                  const currentScore = scores[category][scoreKey] || 0
                  
                  return (
                    <div key={subcriterion.key} className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">{subcriterion.label}</Label>
                        <p className="text-xs text-gray-600 mt-1">{subcriterion.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 w-8">0</span>
                        <Slider
                          value={[currentScore]}
                          onValueChange={(value) => handleScoreChange(category, criterionKey, subcriterion.key, value)}
                          max={5}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-8">5</span>
                        <span className="text-sm font-medium w-8 text-center">{currentScore}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Project Analysis</h1>
          <p className="text-gray-600 mt-2">Analyze a project using the AUG framework</p>
        </div>

        {/* Project Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} {project.location && `- ${project.location}`}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedProject && (
          <>
            {/* Category Navigation */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex space-x-2">
                  <Button 
                    variant={currentCategory === 'architectural' ? 'default' : 'outline'}
                    onClick={() => setCurrentCategory('architectural')}
                    className="flex-1"
                  >
                    Architectural (A)
                  </Button>
                  <Button 
                    variant={currentCategory === 'urban' ? 'default' : 'outline'}
                    onClick={() => setCurrentCategory('urban')}
                    className="flex-1"
                  >
                    Urban (U)
                  </Button>
                  <Button 
                    variant={currentCategory === 'green' ? 'default' : 'outline'}
                    onClick={() => setCurrentCategory('green')}
                    className="flex-1"
                  >
                    Green (G)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Form */}
            {renderCriteriaForm(currentCategory)}

            {/* Submit Button */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Analyzing...' : 'Complete Analysis'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectAnalysis

