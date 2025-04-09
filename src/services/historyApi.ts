import type { AxiosError } from 'axios';
import axios from 'axios';
import { HistoricalEvent } from '../types';

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
      'gulag',
      'nuclear test',
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
    ]
  }
};

const calculateRelevanceScore = (text: string): number => {
  const lowercaseText = text.toLowerCase();
  let score = 0;
  let matches: string[] = [];

  // Check each category of keywords
  Object.entries(communismKeywords).forEach(([category, { weight, terms }]) => {
    terms.forEach(term => {
      if (lowercaseText.includes(term.toLowerCase())) {
        score += weight;
        matches.push(`${term} (${category}, weight: ${weight})`);
      }
    });
  });

  if (score > 0) {
    console.log('Event matched with score', score, ':', text);
    console.log('Matching terms:', matches.join(', '));
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
    .filter(({ score }) => score >= 2) // Require at least two matches or one core match
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
  }

  return filteredEvents;
};

export const fetchTodayEvents = async (): Promise<HistoricalEvent[]> => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    console.log(`Fetching events for date: ${month}/${day}`);
    const response = await axios.get(`${BASE_URL}/${month}/${day}`);
    
    if (!response.data || !response.data.data || !response.data.data.Events) {
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
  } catch (error: unknown) {
    console.error('Error fetching historical events:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('API Error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message,
        url: axiosError.config?.url,
      });
    }
    throw error;
  }
}; 