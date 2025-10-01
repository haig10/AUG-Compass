import requests
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import quote, urljoin
import time
import openai
from typing import Dict, List, Optional

class ProjectDetector:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def detect_project_info(self, project_name: str) -> Dict:
        """
        Detect comprehensive project information from multiple sources
        """
        try:
            # Initialize result structure
            result = {
                'name': project_name,
                'location': '',
                'architect': '',
                'year': '',
                'description': '',
                'website': '',
                'plot_area': '',
                'floor_area': '',
                'building_height': '',
                'units': '',
                'uph': '',
                'far': '',
                'green_space_ratio': '',
                'densification_type': '',
                'images': [],
                'plans': [],
                'source': 'auto-detected'
            }
            
            # Try different detection methods
            info_sources = []
            
            # 1. Try Wikipedia
            wiki_info = self._search_wikipedia(project_name)
            if wiki_info:
                info_sources.append(('Wikipedia', wiki_info))
            
            # 2. Try ArchDaily search
            archdaily_info = self._search_archdaily(project_name)
            if archdaily_info:
                info_sources.append(('ArchDaily', archdaily_info))
            
            # 3. Try general web search
            web_info = self._search_web(project_name)
            if web_info:
                info_sources.append(('Web Search', web_info))
            
            # 4. Use AI to synthesize information
            if info_sources:
                synthesized_info = self._synthesize_with_ai(project_name, info_sources)
                result.update(synthesized_info)
            
            # 5. Search for images
            images = self._search_images(project_name)
            result['images'] = images[:6]  # Limit to 6 images
            
            return result
            
        except Exception as e:
            print(f"Error in project detection: {e}")
            return self._get_fallback_info(project_name)
    
    def _search_wikipedia(self, project_name: str) -> Optional[Dict]:
        """Search Wikipedia for project information"""
        try:
            # Search Wikipedia API
            search_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(project_name)}"
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'description': data.get('extract', ''),
                    'website': data.get('content_urls', {}).get('desktop', {}).get('page', ''),
                    'source': 'Wikipedia'
                }
        except Exception as e:
            print(f"Wikipedia search error: {e}")
        
        return None
    
    def _search_archdaily(self, project_name: str) -> Optional[Dict]:
        """Search ArchDaily for project information"""
        try:
            # Search ArchDaily (simplified approach)
            search_query = f"site:archdaily.com {project_name}"
            search_results = self._google_search(search_query)
            
            if search_results:
                # Try to extract info from the first result
                first_result = search_results[0]
                return {
                    'description': first_result.get('snippet', ''),
                    'website': first_result.get('link', ''),
                    'source': 'ArchDaily'
                }
        except Exception as e:
            print(f"ArchDaily search error: {e}")
        
        return None
    
    def _search_web(self, project_name: str) -> Optional[Dict]:
        """General web search for project information"""
        try:
            # Search for architectural project information
            search_query = f'"{project_name}" architecture building project'
            search_results = self._google_search(search_query)
            
            if search_results:
                return {
                    'search_results': search_results[:3],  # Top 3 results
                    'source': 'Web Search'
                }
        except Exception as e:
            print(f"Web search error: {e}")
        
        return None
    
    def _google_search(self, query: str) -> List[Dict]:
        """Simulate Google search results (in real implementation, use Google Custom Search API)"""
        # This is a simplified version - in production, use Google Custom Search API
        try:
            # For now, return mock data based on common architectural projects
            mock_results = self._get_mock_search_results(query)
            return mock_results
        except Exception as e:
            print(f"Google search error: {e}")
            return []
    
    def _get_mock_search_results(self, query: str) -> List[Dict]:
        """Get mock search results for common architectural projects"""
        query_lower = query.lower()
        
        # Database of famous architectural projects
        projects_db = {
            'bosco verticale': {
                'title': 'Bosco Verticale - Vertical Forest',
                'link': 'https://www.stefanoboeriarchitetti.net/en/project/vertical-forest/',
                'snippet': 'Bosco Verticale is a pair of residential towers in Milan, Italy, designed by Stefano Boeri Architetti. Completed in 2014, the towers feature over 900 trees and 20,000 plants.'
            },
            'via 57 west': {
                'title': 'VIA 57 West - BIG Architects',
                'link': 'https://big.dk/#projects-via',
                'snippet': 'VIA 57 West is a residential building in New York designed by BIG - Bjarke Ingels Group. Completed in 2016, it features a unique pyramid shape and courtyard design.'
            },
            'marina bay sands': {
                'title': 'Marina Bay Sands - Moshe Safdie',
                'link': 'https://www.marinabaysands.com/',
                'snippet': 'Marina Bay Sands is an integrated resort in Singapore designed by Moshe Safdie. Opened in 2010, it features three towers topped by a sky park.'
            },
            'burj khalifa': {
                'title': 'Burj Khalifa - Adrian Smith + Gordon Gill',
                'link': 'https://www.burjkhalifa.ae/',
                'snippet': 'Burj Khalifa is a supertall skyscraper in Dubai, UAE, designed by Adrian Smith of Skidmore, Owings & Merrill. Completed in 2010, it is the tallest building in the world.'
            }
        }
        
        # Find matching project
        for key, data in projects_db.items():
            if key in query_lower:
                return [data]
        
        # Return generic result if no match
        return [{
            'title': f'Search results for {query}',
            'link': 'https://example.com',
            'snippet': f'Information about {query} architectural project.'
        }]
    
    def _synthesize_with_ai(self, project_name: str, info_sources: List) -> Dict:
        """Use AI to synthesize information from multiple sources"""
        try:
            # Prepare prompt for AI
            sources_text = ""
            for source_name, source_data in info_sources:
                sources_text += f"\n{source_name}: {json.dumps(source_data, indent=2)}\n"
            
            prompt = f"""
            Based on the following information sources about the architectural project "{project_name}", 
            extract and synthesize the key details. Provide realistic estimates for missing technical data.
            
            Sources:
            {sources_text}
            
            Please provide a JSON response with the following structure:
            {{
                "location": "City, Country",
                "architect": "Architect name",
                "year": "Year completed",
                "description": "Detailed description",
                "website": "Official website URL",
                "plot_area": "Plot area in m² (estimate if not available)",
                "floor_area": "Floor area in m² (estimate if not available)",
                "building_height": "Height in meters (estimate if not available)",
                "units": "Number of units (estimate if residential)",
                "uph": "Units per hectare (calculate if possible)",
                "far": "Floor area ratio (estimate)",
                "green_space_ratio": "Green space percentage (estimate)",
                "densification_type": "Type of densification strategy"
            }}
            
            Make reasonable estimates for missing data based on the project type and scale.
            """
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an architectural data analyst. Provide accurate information and reasonable estimates."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
        except Exception as e:
            print(f"AI synthesis error: {e}")
        
        return {}
    
    def _search_images(self, project_name: str) -> List[str]:
        """Search for project images"""
        try:
            # In a real implementation, use Google Images API or similar
            # For now, return mock image URLs
            mock_images = [
                f"https://example.com/images/{project_name.replace(' ', '_')}_1.jpg",
                f"https://example.com/images/{project_name.replace(' ', '_')}_2.jpg",
                f"https://example.com/images/{project_name.replace(' ', '_')}_3.jpg",
                f"https://example.com/images/{project_name.replace(' ', '_')}_plan.jpg",
                f"https://example.com/images/{project_name.replace(' ', '_')}_section.jpg",
                f"https://example.com/images/{project_name.replace(' ', '_')}_elevation.jpg"
            ]
            return mock_images
        except Exception as e:
            print(f"Image search error: {e}")
            return []
    
    def _get_fallback_info(self, project_name: str) -> Dict:
        """Get fallback information when detection fails"""
        return {
            'name': project_name,
            'location': 'Location not detected',
            'architect': 'Architect not detected',
            'year': 'Year not detected',
            'description': f'Auto-detection attempted for {project_name}. Please provide additional information manually.',
            'website': '',
            'plot_area': '',
            'floor_area': '',
            'building_height': '',
            'units': '',
            'uph': '',
            'far': '',
            'green_space_ratio': '',
            'densification_type': '',
            'images': [],
            'plans': [],
            'source': 'fallback'
        }

# Enhanced project detection with specific project database
class EnhancedProjectDetector(ProjectDetector):
    def __init__(self):
        super().__init__()
        self.projects_database = {
            'bosco verticale': {
                'name': 'Bosco Verticale',
                'location': 'Milan, Italy',
                'architect': 'Stefano Boeri Architetti',
                'year': '2014',
                'description': 'Bosco Verticale (Vertical Forest) is a pair of residential towers in the Porta Nuova district of Milan, Italy. The towers host 900 trees and over 20,000 plants from a wide range of shrubs and floral plants distributed according to the building\'s sun exposure and microclimate.',
                'website': 'https://www.stefanoboeriarchitetti.net/en/project/vertical-forest/',
                'plot_area': '3000',
                'floor_area': '40000',
                'building_height': '116',
                'units': '113',
                'uph': '377',
                'far': '13.3',
                'green_space_ratio': '75',
                'densification_type': 'Vertical Densification',
                'images': [
                    'https://images.adsttc.com/media/images/5038/0e2e/28ba/0d59/9b00/0985/large_jpg/stringio.jpg',
                    'https://images.adsttc.com/media/images/5038/0e40/28ba/0d59/9b00/0987/large_jpg/stringio.jpg'
                ]
            },
            'via 57 west': {
                'name': 'VIA 57 West',
                'location': 'New York, USA',
                'architect': 'BIG - Bjarke Ingels Group',
                'year': '2016',
                'description': 'VIA 57 West is a residential building located on the West Side of Manhattan. The building features a unique pyramid shape that creates a large central courtyard while maximizing views of the Hudson River.',
                'website': 'https://big.dk/#projects-via',
                'plot_area': '2800',
                'floor_area': '45000',
                'building_height': '142',
                'units': '709',
                'uph': '2532',
                'far': '16.1',
                'green_space_ratio': '25',
                'densification_type': 'Vertical Densification',
                'images': [
                    'https://images.adsttc.com/media/images/559b/0b5e/e58e/ce5a/0700/0199/large_jpg/VIA_57_WEST_-_EXTERIOR_-_PHOTO_BY_IWAN_BAAN_-_23.jpg'
                ]
            },
            'marina bay sands': {
                'name': 'Marina Bay Sands',
                'location': 'Singapore',
                'architect': 'Moshe Safdie',
                'year': '2010',
                'description': 'Marina Bay Sands is an integrated resort fronting Marina Bay in Singapore. The resort features three 55-story towers topped by a sky park with an infinity pool, observation deck, and restaurants.',
                'website': 'https://www.marinabaysands.com/',
                'plot_area': '15600',
                'floor_area': '518000',
                'building_height': '200',
                'units': '2561',
                'uph': '1642',
                'far': '33.2',
                'green_space_ratio': '15',
                'densification_type': 'Mixed Densification',
                'images': []
            }
        }
    
    def detect_project_info(self, project_name: str) -> Dict:
        """Enhanced detection with database lookup"""
        project_key = project_name.lower().strip()
        
        # First, check our database
        if project_key in self.projects_database:
            return self.projects_database[project_key].copy()
        
        # If not in database, use parent class method
        return super().detect_project_info(project_name)

