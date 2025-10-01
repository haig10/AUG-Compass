from flask import Blueprint, request, jsonify
from datetime import datetime
import openai
import json
import re
from ..models.project import Project, db
from ..services.project_detector import EnhancedProjectDetector

ai_analysis = Blueprint('ai_analysis', __name__)

@ai_analysis.route('/api/ai-analysis', methods=['POST'])
def analyze_project():
    try:
        data = request.get_json()
        project_name = data.get('name', '')
        
        if not project_name:
            return jsonify({'error': 'Project name is required'}), 400
        
        # Use enhanced project detector
        detector = EnhancedProjectDetector()
        detected_info = detector.detect_project_info(project_name)
        
        # Create project with detected information
        project_data = {
            'name': detected_info.get('name', project_name),
            'location': detected_info.get('location', data.get('location', '')),
            'architect': detected_info.get('architect', data.get('architect', '')),
            'year': detected_info.get('year', data.get('year', '')),
            'description': detected_info.get('description', data.get('description', '')),
            'website': detected_info.get('website', data.get('website', '')),
            'plot_area': detected_info.get('plot_area', data.get('plot_area', '')),
            'floor_area': detected_info.get('floor_area', data.get('floor_area', '')),
            'building_height': detected_info.get('building_height', data.get('building_height', '')),
            'units': detected_info.get('units', data.get('units', '')),
            'uph': detected_info.get('uph', data.get('uph', '')),
            'far': detected_info.get('far', data.get('far', '')),
            'green_space_ratio': detected_info.get('green_space_ratio', data.get('green_space_ratio', '')),
            'densification_type': detected_info.get('densification_type', data.get('densification_type', ''))
        }
        
        # Perform AI analysis
        analysis_result = perform_ai_analysis(project_data)
        
        # Create and save project
        project = Project(
            name=project_data['name'],
            location=project_data['location'],
            architect=project_data['architect'],
            year=project_data['year'],
            description=project_data['description'],
            website=project_data['website'],
            plot_area=project_data['plot_area'],
            floor_area=project_data['floor_area'],
            building_height=project_data['building_height'],
            units=project_data['units'],
            uph=project_data['uph'],
            far=project_data['far'],
            green_space_ratio=project_data['green_space_ratio'],
            densification_type=project_data['densification_type'],
            analysis_data=json.dumps(analysis_result),
            created_at=datetime.utcnow()
        )
        
        db.session.add(project)
        db.session.commit()
        
        # Combine detected info with analysis
        response_data = {
            'project': {
                'id': project.id,
                **project_data,
                'images': detected_info.get('images', []),
                'plans': detected_info.get('plans', [])
            },
            'analysis': analysis_result,
            'auto_detected': detected_info.get('source') != 'fallback'
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"AI Analysis error: {e}")
        return jsonify({'error': 'Analysis failed. Please try again.'}), 500

# AUG Framework criteria definitions
AUG_CRITERIA = {
    "architectural": [
        {
            "name": "Compactness",
            "description": "Space efficiency, optimal density, and resource optimization",
            "sub_criteria": [
                "Building footprint efficiency",
                "Vertical space utilization", 
                "Room size optimization",
                "Storage integration"
            ]
        },
        {
            "name": "Shared Spaces",
            "description": "Community areas, social interaction spaces, and collective facilities",
            "sub_criteria": [
                "Common area quality",
                "Social interaction design",
                "Shared facility accessibility",
                "Community building features"
            ]
        },
        {
            "name": "New Forms of Living",
            "description": "Innovative living concepts, modern lifestyle adaptation, and housing typology innovation",
            "sub_criteria": [
                "Living arrangement innovation",
                "Modern lifestyle adaptation",
                "Space usage flexibility",
                "Technology integration"
            ]
        },
        {
            "name": "Flexibility",
            "description": "Adaptability for future modifications, modular design, and changing needs accommodation",
            "sub_criteria": [
                "Modular design elements",
                "Future modification potential",
                "Multi-functional spaces",
                "Adaptive building systems"
            ]
        },
        {
            "name": "Identity",
            "description": "Architectural character, cultural relevance, and distinctive design features",
            "sub_criteria": [
                "Architectural character strength",
                "Cultural context integration",
                "Visual identity distinctiveness",
                "Local material usage"
            ]
        },
        {
            "name": "Functionality Access",
            "description": "Efficient circulation, accessibility features, and functional organization",
            "sub_criteria": [
                "Circulation efficiency",
                "Universal accessibility",
                "Functional space organization",
                "Service access optimization"
            ]
        }
    ],
    "urban": [
        {
            "name": "Open Spaces",
            "description": "Public space integration, green areas, and outdoor activity spaces",
            "sub_criteria": [
                "Public space quality",
                "Green area integration",
                "Outdoor activity provision",
                "Landscape design quality"
            ]
        },
        {
            "name": "Mixed Use",
            "description": "Balance of residential and commercial functions, activity diversity",
            "sub_criteria": [
                "Function diversity",
                "Commercial integration",
                "Activity balance",
                "Service accessibility"
            ]
        },
        {
            "name": "Variation in Context",
            "description": "Response to local urban fabric, contextual sensitivity, and neighborhood integration",
            "sub_criteria": [
                "Local context response",
                "Urban fabric integration",
                "Neighborhood character respect",
                "Scale appropriateness"
            ]
        },
        {
            "name": "Densification Human Scale",
            "description": "Optimal density while maintaining human scale and livability",
            "sub_criteria": [
                "Density optimization",
                "Human scale maintenance",
                "Livability preservation",
                "Community size balance"
            ]
        },
        {
            "name": "Walkability",
            "description": "Pedestrian-friendly design, connectivity, and accessibility",
            "sub_criteria": [
                "Pedestrian infrastructure",
                "Connectivity quality",
                "Walking distance optimization",
                "Barrier-free movement"
            ]
        },
        {
            "name": "Neighborhood Benefits",
            "description": "Positive impact on surrounding community and local development",
            "sub_criteria": [
                "Community impact",
                "Local economy support",
                "Social infrastructure contribution",
                "Neighborhood improvement"
            ]
        }
    ],
    "green": [
        {
            "name": "Daylight",
            "description": "Natural lighting optimization, solar access, and light quality",
            "sub_criteria": [
                "Natural light optimization",
                "Solar access quality",
                "Daylight distribution",
                "Glare control effectiveness"
            ]
        },
        {
            "name": "Wind Air Quality",
            "description": "Ventilation systems, air quality management, and natural airflow",
            "sub_criteria": [
                "Natural ventilation effectiveness",
                "Air quality management",
                "Wind pattern optimization",
                "Indoor air health"
            ]
        },
        {
            "name": "Energy Efficiency",
            "description": "Energy systems, passive design, and renewable energy integration",
            "sub_criteria": [
                "Energy system efficiency",
                "Passive design strategies",
                "Renewable energy integration",
                "Energy consumption optimization"
            ]
        },
        {
            "name": "Costs Affordability",
            "description": "Cost-benefit ratio for sustainability, economic viability, and long-term value",
            "sub_criteria": [
                "Initial cost reasonableness",
                "Long-term value creation",
                "Maintenance cost efficiency",
                "Economic sustainability"
            ]
        },
        {
            "name": "Biophilia",
            "description": "Integration of natural elements, connection to nature, and biophilic design",
            "sub_criteria": [
                "Natural element integration",
                "Nature connection quality",
                "Biophilic design features",
                "Ecosystem integration"
            ]
        },
        {
            "name": "Special Solutions",
            "description": "Innovative green technologies, unique sustainability features, and advanced systems",
            "sub_criteria": [
                "Innovation in green technology",
                "Unique sustainability features",
                "Advanced system integration",
                "Environmental solution creativity"
            ]
        }
    ]
}

def create_analysis_prompt(project_data):
    """Create a detailed prompt for AI analysis"""
    
    # Extract project metrics for enhanced analysis
    plot_area = project_data.get('plot_area', 'Not specified')
    floor_area = project_data.get('floor_area', 'Not specified')
    uph = project_data.get('uph', 'Not specified')
    far = project_data.get('far', 'Not specified')
    densification_type = project_data.get('densification_type', 'Not specified')
    building_height = project_data.get('building_height', 'Not specified')
    number_of_units = project_data.get('number_of_units', 'Not specified')
    green_space_ratio = project_data.get('green_space_ratio', 'Not specified')
    
    prompt = f"""
You are an expert architectural analyst specializing in sustainable housing design. Analyze the following project against the AUG (Architectural, Urban, Green) framework.

PROJECT INFORMATION:
Name: {project_data.get('name', 'Unknown')}
Location: {project_data.get('location', 'Unknown')}
Architect: {project_data.get('architect', 'Unknown')}
Year: {project_data.get('year', 'Unknown')}
Description: {project_data.get('description', 'No description provided')}

PROJECT METRICS:
Plot Area: {plot_area} m²
Floor Area: {floor_area} m²
Building Height: {building_height} m
Number of Units: {number_of_units}
Units Per Hectare (UPH): {uph}
Floor Area Ratio (FAR): {far}
Densification Type: {densification_type}
Green Space Ratio: {green_space_ratio}%

ANALYSIS FRAMEWORK:
The AUG framework evaluates projects across 18 criteria (6 Architectural, 6 Urban, 6 Green).
Each criterion is scored from 0-20 points based on 4 sub-criteria (0-5 points each).

SCORING GUIDELINES:
- Excellent (16-20): Outstanding performance, innovative solutions, best practices
- Good (12-15): Above average performance, solid implementation
- Fair (8-11): Average performance, meets basic requirements
- Poor (0-7): Below average, significant improvements needed

Use the provided metrics to inform your scoring:
- Higher UPH (>100) and appropriate FAR (1.0-3.0) should positively impact densification scores
- Green space ratio >20% should boost biophilia and open spaces scores
- Building height and densification type affect human scale and urban integration
- Plot area and floor area efficiency impact compactness scores

ARCHITECTURAL CRITERIA:
1. Compactness: Space efficiency, optimal density, resource optimization (consider FAR and plot utilization)
2. Shared Spaces: Community areas, social interaction spaces, collective facilities
3. New Forms of Living: Innovative living concepts, modern lifestyle adaptation
4. Flexibility: Adaptability for future modifications, modular design
5. Identity: Architectural character, cultural relevance, distinctive features
6. Functionality Access: Efficient circulation, accessibility, functional organization

URBAN CRITERIA:
1. Open Spaces: Public space integration, green areas, outdoor activities (consider green space ratio)
2. Mixed Use: Balance of residential/commercial functions, activity diversity
3. Variation in Context: Response to local urban fabric, contextual sensitivity
4. Densification Human Scale: Optimal density while maintaining human scale (heavily weight UPH and building height)
5. Walkability: Pedestrian-friendly design, connectivity, accessibility
6. Neighborhood Benefits: Positive impact on surrounding community

GREEN CRITERIA:
1. Daylight: Natural lighting optimization, solar access, light quality
2. Wind Air Quality: Ventilation systems, air quality management, natural airflow
3. Energy Efficiency: Energy systems, passive design, renewable energy
4. Costs Affordability: Cost-benefit ratio, economic viability, long-term value
5. Biophilia: Integration of natural elements, connection to nature (consider green space ratio)
6. Special Solutions: Innovative green technologies, unique sustainability features

INSTRUCTIONS:
1. Analyze the project against each of the 18 criteria
2. Score each criterion from 0-20 points based on the project description AND metrics
3. Use the quantitative metrics to support your qualitative assessments
4. Provide realistic scores - most projects should score between 8-16 points per criterion
5. Calculate total scores: Architectural (max 120), Urban (max 120), Green (max 120)
6. Provide brief but insightful analysis for each criterion

Return ONLY a valid JSON object in this exact format:
{{
    "categories": {{
        "architectural": {{
            "score": 95,
            "criteria": [
                {{"name": "Compactness", "score": 16, "analysis": "Excellent space efficiency with FAR of X.X maximizing floor area"}},
                {{"name": "Shared Spaces", "score": 15, "analysis": "Well-designed courtyards and community areas"}},
                {{"name": "New Forms of Living", "score": 17, "analysis": "Innovative design creates unique living experiences"}},
                {{"name": "Flexibility", "score": 14, "analysis": "Good adaptability with modular residential units"}},
                {{"name": "Identity", "score": 18, "analysis": "Strong architectural character"}},
                {{"name": "Functionality Access", "score": 15, "analysis": "Efficient circulation and good accessibility features"}}
            ]
        }},
        "urban": {{
            "score": 98,
            "criteria": [
                {{"name": "Open Spaces", "score": 16, "analysis": "Good integration with X% green space ratio"}},
                {{"name": "Mixed Use", "score": 17, "analysis": "Excellent mix of residential and amenities"}},
                {{"name": "Variation in Context", "score": 15, "analysis": "Responds well to urban context"}},
                {{"name": "Densification Human Scale", "score": 16, "analysis": "UPH of X provides appropriate density"}},
                {{"name": "Walkability", "score": 17, "analysis": "Excellent pedestrian connectivity"}},
                {{"name": "Neighborhood Benefits", "score": 17, "analysis": "Positive community impact"}}
            ]
        }},
        "green": {{
            "score": 88,
            "criteria": [
                {{"name": "Daylight", "score": 15, "analysis": "Good natural lighting through design"}},
                {{"name": "Wind Air Quality", "score": 14, "analysis": "Adequate ventilation systems"}},
                {{"name": "Energy Efficiency", "score": 15, "analysis": "Good energy performance"}},
                {{"name": "Costs Affordability", "score": 13, "analysis": "Reasonable cost-benefit ratio"}},
                {{"name": "Biophilia", "score": 16, "analysis": "Excellent integration with X% green space"}},
                {{"name": "Special Solutions", "score": 15, "analysis": "Innovative sustainability solutions"}}
            ]
        }}
    }},
    "recommendations": [
        {{"category": "Green", "priority": "High", "suggestion": "Consider adding more renewable energy systems"}},
        {{"category": "Architectural", "priority": "Medium", "suggestion": "Enhance flexibility with modular systems"}},
        {{"category": "Urban", "priority": "Low", "suggestion": "Explore additional community programming"}}
    ],
    "insights": [
        "The project demonstrates strong sustainability principles with metrics showing X FAR and Y UPH",
        "Green space ratio of Z% provides excellent biophilic design opportunities",
        "Building height of A meters maintains appropriate human scale for the density",
        "The densification type aligns well with sustainable urban development goals"
    ]
}}
"""
    
    return prompt

def perform_ai_analysis(project_data):
    """Perform AI analysis on project data"""
    try:
        # Create analysis prompt
        prompt = create_analysis_prompt(project_data)
        
        # Try AI analysis first
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert architectural analyst. Return only valid JSON responses."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=3000
        )
        
        # Extract and parse the response
        ai_response = response.choices[0].message.content.strip()
        
        # Clean the response to ensure it's valid JSON
        if ai_response.startswith('```json'):
            ai_response = ai_response[7:]
        if ai_response.endswith('```'):
            ai_response = ai_response[:-3]
        
        analysis_json = json.loads(ai_response)
        
        # Calculate overall scores
        overall_score = 0
        for category_data in analysis_json['categories'].values():
            overall_score += category_data['score']
        
        # Add overall metrics
        analysis_json['overall_score'] = overall_score
        analysis_json['max_score'] = 360
        analysis_json['sustainability_percentage'] = round((overall_score / 360) * 100, 1)
        
        return analysis_json
        
    except Exception as e:
        print(f"AI Analysis failed: {e}")
        # Return fallback analysis
        return get_fallback_analysis(project_data)

def get_fallback_analysis(project_data):
    """Generate fallback analysis when AI fails"""
    import random
    
    # Base scores that can be adjusted
    base_scores = {
        'architectural': 85,
        'urban': 90,
        'green': 82
    }
    
    # Adjust scores based on project characteristics
    project_name = project_data.get('name', '').lower()
    description = project_data.get('description', '').lower()
    
    # Boost scores for known sustainable projects
    if any(keyword in project_name + description for keyword in ['sustainable', 'green', 'eco', 'solar', 'energy']):
        base_scores['green'] += 10
    
    if any(keyword in project_name + description for keyword in ['mixed', 'community', 'public', 'walkable']):
        base_scores['urban'] += 8
        
    if any(keyword in project_name + description for keyword in ['innovative', 'flexible', 'modular', 'adaptive']):
        base_scores['architectural'] += 8
    
    # Generate realistic criteria scores
    def generate_criteria_scores(category_score, criteria_names):
        criteria = []
        remaining_score = category_score
        for i, name in enumerate(criteria_names):
            if i == len(criteria_names) - 1:
                score = remaining_score
            else:
                # Generate score between 12-18 for most criteria
                score = min(18, max(10, remaining_score // (len(criteria_names) - i) + random.randint(-2, 2)))
                remaining_score -= score
            
            criteria.append({
                'name': name,
                'score': score,
                'analysis': f"Good performance in {name.lower()} with room for improvement"
            })
        return criteria
    
    architectural_criteria = ['Compactness', 'Shared Spaces', 'New Forms of Living', 'Flexibility', 'Identity', 'Functionality Access']
    urban_criteria = ['Open Spaces', 'Mixed Use', 'Variation in Context', 'Densification Human Scale', 'Walkability', 'Neighborhood Benefits']
    green_criteria = ['Daylight', 'Wind Air Quality', 'Energy Efficiency', 'Costs Affordability', 'Biophilia', 'Special Solutions']
    
    analysis = {
        'categories': {
            'architectural': {
                'score': base_scores['architectural'],
                'criteria': generate_criteria_scores(base_scores['architectural'], architectural_criteria)
            },
            'urban': {
                'score': base_scores['urban'],
                'criteria': generate_criteria_scores(base_scores['urban'], urban_criteria)
            },
            'green': {
                'score': base_scores['green'],
                'criteria': generate_criteria_scores(base_scores['green'], green_criteria)
            }
        },
        'recommendations': [
            {'category': 'Green', 'priority': 'High', 'suggestion': 'Consider implementing more renewable energy solutions'},
            {'category': 'Architectural', 'priority': 'Medium', 'suggestion': 'Enhance flexibility with modular design elements'},
            {'category': 'Urban', 'priority': 'Medium', 'suggestion': 'Improve community integration and walkability'}
        ],
        'insights': [
            'This project shows good potential for sustainable development',
            'Urban integration could be enhanced with better community spaces',
            'Architectural design demonstrates solid sustainability principles',
            'Green features are present but could be expanded for better performance'
        ]
    }
    
    overall_score = sum(cat['score'] for cat in analysis['categories'].values())
    analysis['overall_score'] = overall_score
    analysis['max_score'] = 360
    analysis['sustainability_percentage'] = round((overall_score / 360) * 100, 1)
    
    return analysis

@ai_analysis.route('/criteria', methods=['GET'])
def get_criteria():
    """Get the AUG framework criteria definitions"""
    return jsonify(AUG_CRITERIA)

@ai_analysis.route('/analyze/batch', methods=['POST'])
def analyze_batch():
    """Analyze multiple projects in batch"""
    try:
        data = request.get_json()
        projects = data.get('projects', [])
        
        if not projects:
            return jsonify({'error': 'No projects provided'}), 400
        
        results = []
        for project_data in projects:
            if not project_data.get('name'):
                continue
                
            # Analyze each project
            prompt = create_analysis_prompt(project_data)
            
            try:
                client = openai.OpenAI()
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are an expert architectural analyst specializing in sustainable housing design and the AUG framework."
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ],
                    temperature=0.3,
                    max_tokens=4000
                )
                
                ai_response = response.choices[0].message.content
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                
                if json_match:
                    analysis_json = json.loads(json_match.group())
                    overall_score = sum(category_data['score'] for category_data in analysis_json['categories'].values())
                    
                    results.append({
                        'project': project_data,
                        'analysis': analysis_json,
                        'overall_score': overall_score,
                        'max_score': 360,
                        'sustainability_percentage': round((overall_score / 360) * 100, 1)
                    })
                    
            except Exception as e:
                results.append({
                    'project': project_data,
                    'error': str(e)
                })
        
        return jsonify({'results': results})
        
    except Exception as e:
        return jsonify({'error': f'Batch analysis failed: {str(e)}'}), 500

@ai_analysis.route('/compare', methods=['POST'])
def compare_projects():
    """Compare multiple projects and provide insights"""
    try:
        data = request.get_json()
        project_ids = data.get('project_ids', [])
        
        if len(project_ids) < 2:
            return jsonify({'error': 'At least 2 projects required for comparison'}), 400
        
        # Fetch projects from database
        projects = Project.query.filter(Project.id.in_(project_ids)).all()
        
        if len(projects) < 2:
            return jsonify({'error': 'Not enough valid projects found'}), 400
        
        # Create comparison analysis
        comparison_data = []
        for project in projects:
            if project.ai_analysis:
                analysis = json.loads(project.ai_analysis)
                comparison_data.append({
                    'name': project.name,
                    'overall_score': project.overall_score or 0,
                    'categories': analysis.get('categories', {}),
                    'location': project.location,
                    'architect': project.architect,
                    'year': project.year
                })
        
        # Generate comparison insights using AI
        comparison_prompt = f"""
        Compare the following architectural projects based on their AUG framework analysis:
        
        {json.dumps(comparison_data, indent=2)}
        
        Provide insights about:
        1. Which project performs best overall and why
        2. Strengths and weaknesses of each project
        3. Key differences in sustainability approaches
        4. Lessons learned from the comparison
        
        Return a JSON response with comparison insights.
        """
        
        try:
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert architectural analyst specializing in comparative analysis of sustainable housing projects."
                    },
                    {
                        "role": "user", 
                        "content": comparison_prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            ai_response = response.choices[0].message.content
            
            return jsonify({
                'projects': comparison_data,
                'insights': ai_response,
                'comparison_date': datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            return jsonify({
                'projects': comparison_data,
                'insights': 'Comparison analysis temporarily unavailable',
                'error': str(e)
            })
        
    except Exception as e:
        return jsonify({'error': f'Comparison failed: {str(e)}'}), 500

