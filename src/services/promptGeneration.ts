import { HistoricalEvent } from '../types';

interface StabilityPrompt {
  prompt: string;
  negative_prompt: string;
}

interface SceneContext {
  subjects: string[];
  actions: string[];
  locations: string[];
  time_period: string;
  atmosphere: string[];
}

interface HistoricalContext {
  era: string;
  style: string;
  atmosphere: string;
  location: string;
  subjects: string[];
  technicalDetails: string[];
}

function determineHistoricalContext(year: number, description: string): HistoricalContext {
  // Determine historical era and appropriate style
  let era = '';
  let style = '';
  
  if (year < 1839) {
    era = 'pre-photography era';
    style = 'oil painting, historical artwork, detailed illustration';
  } else if (year < 1880) {
    era = 'early photography';
    style = 'daguerreotype, sepia toned, vintage photograph';
  } else if (year < 1900) {
    era = 'Victorian era photography';
    style = 'black and white photograph, cabinet card style, formal composition';
  } else if (year < 1930) {
    era = 'early 20th century';
    style = 'vintage photograph, silver gelatin print style';
  } else if (year < 1950) {
    era = 'mid-20th century';
    style = 'documentary photography, press photo style';
  } else if (year < 1970) {
    era = 'post-war era';
    style = 'journalistic photography, film grain, high contrast';
  } else if (year < 1990) {
    era = 'late 20th century';
    style = 'photojournalism, 35mm film look';
  } else {
    era = 'modern era';
    style = 'digital photography, high resolution';
  }

  // Extract location context
  const locationKeywords = [
    'palace', 'battlefield', 'city', 'street', 'parliament', 'square', 'factory',
    'rural', 'urban', 'industrial', 'government building', 'protest site'
  ];
  const location = locationKeywords.find(keyword => 
    description.toLowerCase().includes(keyword.toLowerCase())
  ) || 'historical setting';

  // Identify key subjects
  const subjects: string[] = [];
  if (description.toLowerCase().includes('war') || description.toLowerCase().includes('battle')) {
    subjects.push('soldiers', 'military equipment', 'battlefield scenes');
  }
  if (description.toLowerCase().includes('protest') || description.toLowerCase().includes('revolution')) {
    subjects.push('protesters', 'crowds', 'banners', 'revolutionary symbols');
  }
  if (description.toLowerCase().includes('leader') || description.toLowerCase().includes('minister')) {
    subjects.push('political figures', 'officials', 'formal attire');
  }
  if (description.toLowerCase().includes('worker') || description.toLowerCase().includes('labor')) {
    subjects.push('workers', 'industrial equipment', 'factory settings');
  }
  if (subjects.length === 0) {
    subjects.push('historical figures', 'period-appropriate clothing');
  }

  // Determine atmosphere based on event description
  let atmosphere = '';
  if (description.toLowerCase().includes('victory') || description.toLowerCase().includes('celebration')) {
    atmosphere = 'triumphant, energetic';
  } else if (description.toLowerCase().includes('defeat') || description.toLowerCase().includes('death')) {
    atmosphere = 'somber, dramatic';
  } else if (description.toLowerCase().includes('protest') || description.toLowerCase().includes('uprising')) {
    atmosphere = 'tense, dramatic, revolutionary';
  } else if (description.toLowerCase().includes('meeting') || description.toLowerCase().includes('conference')) {
    atmosphere = 'formal, serious, diplomatic';
  } else {
    atmosphere = 'historical, documentary';
  }

  // Technical details for image quality
  const technicalDetails = [
    'highly detailed',
    'sharp focus',
    'historical accuracy',
    'period-appropriate lighting',
    'authentic details',
    'masterful composition'
  ];

  return {
    era,
    style,
    atmosphere,
    location,
    subjects,
    technicalDetails
  };
}

export function generateOptimizedPrompt(description: string, year: number): StabilityPrompt {
  const context = determineHistoricalContext(year, description);
  
  // Construct the main prompt
  const mainPrompt = [
    `${context.era} depicting ${description}`,
    `Style: ${context.style}`,
    `Setting: ${context.location}`,
    `Featuring: ${context.subjects.join(', ')}`,
    `Atmosphere: ${context.atmosphere}`,
    `Technical requirements: ${context.technicalDetails.join(', ')}`
  ].join('. ');

  // Add negative prompt to avoid anachronisms and maintain quality
  const negativePrompt = [
    'no anachronistic elements',
    'no modern technology or clothing',
    'no artificial poses',
    'no digital artifacts',
    'no watermarks',
    'no text overlays',
    'no color in pre-color photography eras',
    'historically accurate'
  ].join(', ');

  return {
    prompt: mainPrompt,
    negative_prompt: negativePrompt
  };
}

const extractSceneContext = (event: HistoricalEvent): SceneContext => {
  const description = event.description.toLowerCase();
  const year = event.year;

  // Define key elements for scene context
  const subjects = [
    'soldiers', 'workers', 'protesters', 'leaders',
    'civilians', 'military', 'politicians', 'revolutionaries',
    'crowd', 'people', 'army', 'officials', 'troops',
    'men', 'women', 'children', 'citizens'
  ];

  const actions = [
    'marching', 'protesting', 'speaking', 'fighting',
    'gathering', 'celebrating', 'meeting', 'signing',
    'demonstrating', 'assembling', 'standing', 'walking',
    'killed', 'massacred', 'attacking', 'defending',
    'fleeing', 'resisting', 'confronting', 'debating'
  ];

  const locations = [
    'soviet union', 'russia', 'moscow', 'kremlin',
    'china', 'beijing', 'eastern europe', 'berlin',
    'street', 'square', 'building', 'palace', 'romania',
    'city', 'town', 'village', 'countryside', 'battlefield'
  ];

  const atmospheres = [
    'historical', 'dramatic', 'tense', 'tragic',
    'powerful', 'solemn', 'dark', 'momentous',
    'significant', 'important', 'serious', 'grim',
    'authentic', 'raw', 'emotional', 'intense'
  ];

  // Extract matching elements
  const foundSubjects = subjects.filter(s => description.includes(s));
  const foundActions = actions.filter(a => description.includes(a));
  const foundLocations = locations.filter(l => description.includes(l));
  const foundAtmosphere = atmospheres.filter(a => description.includes(a));

  // Determine time period style based on year
  const timePeriod = year < 1900 
    ? 'vintage sepia-toned photograph from the 19th century, historical documentation' 
    : year < 1950 
      ? 'black and white historical photograph from the early 20th century, documentary style' 
      : 'historical documentary photograph, photojournalistic style';

  return {
    subjects: foundSubjects,
    actions: foundActions,
    locations: foundLocations,
    time_period: timePeriod,
    atmosphere: foundAtmosphere,
  };
};

export const generateStabilityPrompt = (event: HistoricalEvent): StabilityPrompt => {
  const context = extractSceneContext(event);
  
  // Build a descriptive prompt optimized for SDXL
  const promptParts = [
    // Core scene description with time period
    `${context.time_period}, showing a historical scene from ${event.year}`,
    
    // Location and setting if available
    context.locations.length > 0 ? `set in ${context.locations.join(' and ')}` : null,
    
    // Main subjects and their actions
    context.subjects.length > 0 ? `depicting ${context.subjects.join(', ')}` : 'depicting people',
    context.actions.length > 0 ? `who are ${context.actions.join(' and ')}` : null,
    
    // Atmosphere and mood
    context.atmosphere.length > 0 ? `conveying a ${context.atmosphere.join(', ')} atmosphere` : null,
    
    // Technical quality requirements for SDXL
    'ultra detailed photograph',
    'masterful composition',
    '8k resolution',
    'professional lighting',
    'historically accurate details',
    'cinematic quality',
    'award-winning photojournalism',
    'dramatic lighting',
    'high contrast',
    'film grain',
    'shot on Leica'
  ].filter(Boolean);

  return {
    prompt: promptParts.join(', '),
    negative_prompt: ''
  };
}; 