from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.project import Project
from src.analysis.aug_analyzer import AUGAnalyzer

project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    projects = Project.query.all()
    return jsonify([project.to_dict() for project in projects])

@project_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project"""
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())

@project_bp.route('/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Project name is required'}), 400
    
    project = Project(
        name=data['name'],
        description=data.get('description', ''),
        location=data.get('location', ''),
        architect=data.get('architect', ''),
        year=data.get('year'),
        image_url=data.get('image_url', '')
    )
    
    # If scores are provided, set them
    if 'architectural_scores' in data:
        project.set_architectural_scores(data['architectural_scores'])
    if 'urban_scores' in data:
        project.set_urban_scores(data['urban_scores'])
    if 'green_scores' in data:
        project.set_green_scores(data['green_scores'])
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@project_bp.route('/projects/<int:project_id>/analyze', methods=['POST'])
def analyze_project(project_id):
    """Analyze a project and generate AUG scores"""
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Analysis data is required'}), 400
    
    analyzer = AUGAnalyzer()
    
    # Analyze the project based on provided criteria responses
    architectural_scores = analyzer.analyze_architectural(data.get('architectural_responses', {}))
    urban_scores = analyzer.analyze_urban(data.get('urban_responses', {}))
    green_scores = analyzer.analyze_green(data.get('green_responses', {}))
    
    # Update project with scores
    project.set_architectural_scores(architectural_scores)
    project.set_urban_scores(urban_scores)
    project.set_green_scores(green_scores)
    
    db.session.commit()
    
    return jsonify({
        'project': project.to_dict(),
        'analysis': {
            'architectural': architectural_scores,
            'urban': urban_scores,
            'green': green_scores
        }
    })

@project_bp.route('/projects/<int:project_id>/profile', methods=['GET'])
def get_project_profile(project_id):
    """Get the radar chart profile data for a project"""
    project = Project.query.get_or_404(project_id)
    
    architectural_scores = project.get_architectural_scores()
    urban_scores = project.get_urban_scores()
    green_scores = project.get_green_scores()
    
    # Calculate total scores for each main criterion (out of 20 points each)
    profile_data = []
    
    # Architectural criteria
    arch_criteria = ['compactness', 'shared_spaces', 'new_forms_living', 'flexibility', 'identity', 'functionality_access']
    for criterion in arch_criteria:
        total_score = sum(architectural_scores.get(criterion, {}).values())
        profile_data.append({
            'criterion': criterion.replace('_', ' ').title(),
            'score': total_score,
            'category': 'Architectural'
        })
    
    # Urban criteria
    urban_criteria = ['open_spaces', 'mixed_use', 'variation_context', 'densification_human_scale', 'walkability', 'neighborhood_benefits']
    for criterion in urban_criteria:
        total_score = sum(urban_scores.get(criterion, {}).values())
        profile_data.append({
            'criterion': criterion.replace('_', ' ').title(),
            'score': total_score,
            'category': 'Urban'
        })
    
    # Green criteria
    green_criteria = ['daylight', 'wind_air_quality', 'energy_efficiency', 'costs_affordability', 'biophilia', 'special_solutions']
    for criterion in green_criteria:
        total_score = sum(green_scores.get(criterion, {}).values())
        profile_data.append({
            'criterion': criterion.replace('_', ' ').title(),
            'score': total_score,
            'category': 'Green'
        })
    
    return jsonify({
        'project': project.to_dict(),
        'profile': profile_data
    })

