class AUGAnalyzer:
    """
    AUG (Architectural, Urban, Green) Analysis Engine
    Analyzes architectural projects based on the sustainable housing design framework
    """
    
    def __init__(self):
        self.architectural_criteria = {
            'compactness': ['site_coverage_ratio', 'floor_area_ratio', 'building_footprint_efficiency', 'verticality_horizontal_spread'],
            'shared_spaces': ['proportion_shared_area', 'accessibility_shared_spaces', 'diversity_shared_functions', 'management_maintenance_plan'],
            'new_forms_living': ['adaptability_multi_generational', 'integration_live_work', 'support_community_interaction', 'technological_integration'],
            'flexibility': ['spatial_reconfigurability', 'functional_adaptability', 'structural_modifiability', 'material_system_interchangeability'],
            'identity': ['contextual_responsiveness', 'distinctive_features', 'resident_personalization', 'public_perception'],
            'functionality_access': ['universal_design', 'circulation_efficiency', 'proximity_services', 'safety_security']
        }
        
        self.urban_criteria = {
            'open_spaces': ['quantity_open_space', 'quality_open_space', 'accessibility_open_space', 'integration_urban_fabric'],
            'mixed_use': ['diversity_functions', 'integration_uses', 'activity_throughout_day', 'economic_viability'],
            'variation_context': ['respect_urban_grain', 'material_architectural_palette', 'adaptability_topography', 'preservation_heritage'],
            'densification_human_scale': ['density_achieved', 'pedestrian_experience', 'building_height_massing', 'permeability_connectivity'],
            'walkability': ['pedestrian_network_quality', 'proximity_amenities', 'streetscape_design', 'traffic_calming'],
            'neighborhood_benefits': ['local_economic_contribution', 'social_cohesion', 'access_public_services', 'environmental_improvement']
        }
        
        self.green_criteria = {
            'daylight': ['daylight_autonomy', 'glare_control', 'view_quality', 'uniformity_daylight'],
            'wind_air_quality': ['natural_ventilation_potential', 'cross_ventilation_effectiveness', 'indoor_air_pollutant_control', 'outdoor_air_quality_impact'],
            'energy_efficiency': ['building_envelope_performance', 'renewable_energy_integration', 'efficient_hvac_systems', 'smart_energy_management'],
            'costs_affordability': ['initial_construction_cost', 'lifecycle_cost_analysis', 'affordability_target_demographics', 'financial_incentives'],
            'biophilia': ['connection_nature_buildings', 'access_green_spaces', 'use_natural_materials', 'biodiversity_enhancement'],
            'special_solutions': ['water_harvesting_reuse', 'waste_management_recycling', 'resilience_climate_change', 'innovative_technologies']
        }
    
    def analyze_architectural(self, responses):
        """
        Analyze architectural criteria based on user responses
        Each sub-criterion is scored 0-5 points
        """
        scores = {}
        for criterion, sub_criteria in self.architectural_criteria.items():
            scores[criterion] = {}
            for sub_criterion in sub_criteria:
                # Get score from responses, default to 0 if not provided
                score = responses.get(f"{criterion}_{sub_criterion}", 0)
                scores[criterion][sub_criterion] = min(max(int(score), 0), 5)  # Ensure score is between 0-5
        return scores
    
    def analyze_urban(self, responses):
        """
        Analyze urban criteria based on user responses
        Each sub-criterion is scored 0-5 points
        """
        scores = {}
        for criterion, sub_criteria in self.urban_criteria.items():
            scores[criterion] = {}
            for sub_criterion in sub_criteria:
                score = responses.get(f"{criterion}_{sub_criterion}", 0)
                scores[criterion][sub_criterion] = min(max(int(score), 0), 5)
        return scores
    
    def analyze_green(self, responses):
        """
        Analyze green criteria based on user responses
        Each sub-criterion is scored 0-5 points
        """
        scores = {}
        for criterion, sub_criteria in self.green_criteria.items():
            scores[criterion] = {}
            for sub_criterion in sub_criteria:
                score = responses.get(f"{criterion}_{sub_criterion}", 0)
                scores[criterion][sub_criterion] = min(max(int(score), 0), 5)
        return scores
    
    def calculate_total_scores(self, architectural_scores, urban_scores, green_scores):
        """
        Calculate total scores for each main criterion (out of 20 points each)
        """
        totals = {}
        
        # Calculate architectural totals
        for criterion, sub_scores in architectural_scores.items():
            totals[f"arch_{criterion}"] = sum(sub_scores.values())
        
        # Calculate urban totals
        for criterion, sub_scores in urban_scores.items():
            totals[f"urban_{criterion}"] = sum(sub_scores.values())
        
        # Calculate green totals
        for criterion, sub_scores in green_scores.items():
            totals[f"green_{criterion}"] = sum(sub_scores.values())
        
        return totals
    
    def get_criteria_definitions(self):
        """
        Return the complete criteria definitions for the frontend
        """
        return {
            'architectural': self.architectural_criteria,
            'urban': self.urban_criteria,
            'green': self.green_criteria
        }

