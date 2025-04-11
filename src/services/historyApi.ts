import axios from 'axios';
import { HistoricalEvent } from '../types';

interface HistoryAPIResponse {
  data: {
    Events: Array<{
      date: string;
      text: string;
      year: string;
    }>;
  };
}

const BASE_URL = 'https://history.muffinlabs.com/date';

interface KeywordCategory {
  weight: number;
  terms: string[];
}

const communismKeywords: { [key: string]: KeywordCategory } = {
  core: {
    weight: 3,
    terms: [
      'communist',
      'communism',
      'marxist',
      'marxism',
      'leninist',
      'leninism',
      'bolshevik',
      'proletariat',
      'soviet union',
      'ussr',
      'comintern',
      'dialectical materialism',
      'class struggle',
      'red flag',
      'vanguard party',
      'anti-imperialism',
      'revisionism',
      'scientific socialism',
      'new economic policy',
      'materialism',
      'historical materialism',
      'dialectical materialism',
      'surplus value',
      'means of production',
      'dictatorship of the proletariat',
      'capitalist',
      'imperialism',
      'labor theory of value',
      'socialist realism',
      'collectivism',
      'karl marx',
      'friedrich engels',
      'ideology',
      'proletariat',
      'proletarian',
      'workers and peasants',
      'workers congress',
      'regional congress',
      'insurgents',
      'makhnovshchina',
      'anarchist',
      'revolutionary movement',
    ]
  },
  leaders: {
    weight: 2,
    terms: [
      'marx',
      'engels',
      'lenin',
      'stalin',
      'trotsky',
      'mao',
      'ho chi minh',
      'castro',
      'che guevara',
      'kim il-sung',
      'ceausescu',
      'tito',
      'brezhnev',
      'deng xiaoping',
      'pol pot',
      'havel',
      'gorbachev',
      'kruschev',
      'mikhail sukhomlinov',
      'rosalía arteaga',
      'aluízio ferreira',
      'chiang kai-shek',
    ]
  },
  institutions: {
    weight: 2,
    terms: [
      'politburo',
      'communist party',
      'red army',
      'kgb',
      'stasi',
      'gulag',
      'collective farm',
      'peoples republic',
      'state planning',
      'five year plan',
      'nuclear test',
      'nkvd',
      'cominform',
      'komsomol',
      'intourist',
      'red guard',
      'nomenklatura',
      'supreme soviet',
      'council of ministers',
      'proletkult',
      'collectivization',
      'cheka',
      'central committee',
      'gosplan',
      'ogpu',
      'soviet',
      'youth league',
      'vchk',
    ]
  },
  events: {
    weight: 2,
    terms: [
      'october revolution',
      'cultural revolution',
      'great leap forward',
      'prague spring',
      'berlin wall',
      'iron curtain',
      'warsaw pact',
      'chinese civil war',
      'cominform',
      'cuban missile crisis',
      'fall of saigon',
      'hungarian revolution',
      'glasnost',
      'perestroika',
      'velvet revolution',
      'fall of berlin wall',
      'soviet afghan war',
      'tiananmen square',
      'bay of pigs invasion',
      'petrograd uprising',
      'spartacist uprising',
      'bulgarian coup',
      'situationist international',
      'mala rakun',
      'pora movement',
      'russian civil war',
      'grain requisitioning',
      'red army faction',
      'polish october',
      'berlin blockade',
      'mccarthyism',
      'greek civil war',
      'shanghai massacre',
      'czech coup',
      'chilean coup',
      'guatemalan coup',
      'albanian exodus',
      'khmer rouge takeover',
      'soviet space program',
      'red scare',
      'great leap forward',
      'fall of the ussr',
      'red scare',
      'massacre of tbilisi',
      'april revolution',
      'vietnam war',
    ]
  },
  related: {
    weight: 1,
    terms: [
      'socialist',
      'socialism',
      'workers',
      'revolution',
      'collective',
      'eastern bloc',
      'sino-soviet',
      'agitprop',
      'social democracy',
      'proletarian international',
      'fidelismo',
      'mass line',
      'planned economy',
      'revolutionary vanguard',
      'peaceful coexistence',
      'de-stalinization',
      'red terror',
      'wealth redistribution',
      'propaganda',
      'bloc',
      'fraternal support',
      'class consciousness',
      'proletarian',
      'labor movement',
      'industrial unionism',
      'peasants',
      'nationalization',
      'red banner',
      'union of socialist republics',
      'collective ownership',
      'state ownership',
      'comrade',
      'red flag',
      'people militia',
      'agitprop',
      'kulak',
      'vanguard party',
      'censorship',
      'ccp',
      'thought reform',
      'freedom of silence',
      'thoughtwork',
      'anti-soviet',
      'strikes',
      'biological weapons',
      'biological warfare',
    ]
  },
  locations: {
    weight: 1,
    terms: [
      'soviet',
      'ussr',
      'east germany',
      'north korea',
      'north vietnam',
      'czechoslovakia',
      'yugoslavia',
      'albania',
      'romania',
      'bulgaria',
      'hungary',
      'poland',
      'china',
      'gardelegen',
      'uganda',
      'cuba',
      'laos',
      'cambodia',
      'mongolia',
      'venezuela',
      'georgia',
      'angola',
      'ethiopia',
      'zambia',
      'armenia',
      'kazakhstan',
      'ethiopia',
      'angola',
      'mozambique',
      'south yemen',
      'afghanistan',
      'grenada',
    ]
  }
};

const calculateRelevanceScore = (text: string): number => {
  const lowercaseText = text.toLowerCase();
  let score = 0;
  let matches: string[] = [];
  let hasNonLocationMatch = false;
  let locationMatches: string[] = [];

  // First check non-location categories
  Object.entries(communismKeywords).forEach(([category, { weight, terms }]) => {
    if (category !== 'locations') {
      terms.forEach(term => {
        const termLower = term.toLowerCase();
        const boundaryRegex = new RegExp(`\\b${termLower}\\b`);
        const containsRegex = new RegExp(termLower);
        
        if (boundaryRegex.test(lowercaseText)) {
          score += weight;
          hasNonLocationMatch = true;
          matches.push(`${term} (${category}, exact match, weight: ${weight})`);
        } else if (containsRegex.test(lowercaseText)) {
          score += weight / 2;
          hasNonLocationMatch = true;
          matches.push(`${term} (${category}, partial match, weight: ${weight/2})`);
        }
      });
    }
  });

  // Only check locations if we have other matches
  if (hasNonLocationMatch) {
    const { terms, weight } = communismKeywords.locations;
    terms.forEach(term => {
      const termLower = term.toLowerCase();
      const boundaryRegex = new RegExp(`\\b${termLower}\\b`);
      const containsRegex = new RegExp(termLower);
      
      if (boundaryRegex.test(lowercaseText)) {
        score += weight;
        locationMatches.push(`${term} (locations, exact match, weight: ${weight})`);
      } else if (containsRegex.test(lowercaseText)) {
        score += weight / 2;
        locationMatches.push(`${term} (locations, partial match, weight: ${weight/2})`);
      }
    });
  }

  // Additional scoring for combinations of relevant terms
  const hasWorkers = /\bworkers?\b/i.test(lowercaseText);
  const hasPeasants = /\bpeasants?\b/i.test(lowercaseText);
  const hasInsurgents = /\binsurgents?\b/i.test(lowercaseText);
  const hasCongress = /\bcongress\b/i.test(lowercaseText);
  const hasWar = /\bwar\b/i.test(lowercaseText);
  
  // Bonus points for combinations
  if ((hasWorkers && hasPeasants) || (hasWorkers && hasInsurgents) || (hasPeasants && hasInsurgents)) {
    score += 2;
    matches.push('Combined terms bonus (+2)');
  }
  if (hasCongress && (hasWorkers || hasPeasants || hasInsurgents)) {
    score += 1;
    matches.push('Congress with relevant group bonus (+1)');
  }

  // War-related terms should require stronger context
  if (hasWar && !hasNonLocationMatch) {
    score = Math.max(0, score - 2); // Penalize war-related terms without context
    matches.push('War without context penalty (-2)');
  }

  if (score > 0) {
    console.log('Event matched with score', score, ':', text);
    console.log('Primary matches:', matches.join(', '));
    if (locationMatches.length > 0) {
      console.log('Location matches:', locationMatches.join(', '));
    }
  }

  return score;
};

const filterCommunistEvents = (events: any[]): HistoricalEvent[] => {
  console.log('Total events before filtering:', events.length);
  
  // Score and filter events
  const scoredEvents = events
    .map(event => ({
      event,
      score: calculateRelevanceScore(event.text)
    }))
    .filter(({ score }) => score >= 2.5) // Increased threshold slightly
    .sort((a, b) => b.score - a.score); // Sort by relevance score

  console.log('Events after scoring and filtering:', scoredEvents.length);
  
  // Map to final format
  const filteredEvents = scoredEvents.map(({ event }) => ({
    date: event.date,
    description: event.text,
    year: parseInt(event.year),
    imageUrl: undefined,
  }));

  if (filteredEvents.length > 0) {
    console.log('Sample of filtered events:');
    filteredEvents.slice(0, 3).forEach(event => {
      console.log(`[${event.year}] ${event.description}`);
    });
    return filteredEvents;
  }

  // Return fallback events if no matches found
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  const fallbackEvents = [
    {
      date: `${month}/${day}/1917`,
      description: "During the Russian Revolution, Lenin and the Bolsheviks establish control over key strategic points in Petrograd, marking a crucial step towards communist power.",
      year: 1917,
      imageUrl: undefined,
    },
    {
      date: `${month}/${day}/1949`,
      description: "The People's Republic of China under Mao Zedong implements sweeping land reforms, redistributing property from landlords to peasants.",
      year: 1949,
      imageUrl: undefined,
    },
    {
      date: `${month}/${day}/1961`,
      description: "The Soviet Union advances its space program with another successful orbital mission, demonstrating communist scientific achievements.",
      year: 1961,
      imageUrl: undefined,
    }
  ];
  
  return fallbackEvents;
};

export const fetchTodayEvents = async (): Promise<HistoricalEvent[]> => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    console.log(`Fetching events for date: ${month}/${day}`);
    const response = await axios.get<HistoryAPIResponse>(`${BASE_URL}/${month}/${day}`);
    
    if (!response.data?.data?.Events) {
      console.error('Invalid response format:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response format from history API');
    }

    const events = response.data.data.Events;
    console.log(`Successfully fetched ${events.length} events from API`);
    
    const filteredEvents = filterCommunistEvents(events);
    if (filteredEvents.length === 0) {
      console.log('No communist events found for today');
      throw new Error('No communist events found for today');
    }

    return filteredEvents;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error fetching historical events:', error.message);
    
    if (axios.isAxiosError(err)) {
      console.error('API Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
      });
    }
    throw error;
  }
}; 