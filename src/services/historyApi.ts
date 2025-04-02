import axios from 'axios';
import { HistoricalEvent } from '../types';

const BASE_URL = 'https://history.muffinlabs.com/date';

const communismKeywords = [
  'communist',
  'communism',
  'soviet',
  'ussr',
  'marx',
  'lenin',
  'stalin',
  'mao',
  'revolution',
  'red army',
  'bolshevik',
  'socialist',
  'socialism',
  'proletariat',
  'workers',
  'collective',
  'politburo',
  'kgb',
  'gulag',
  'trotsky',
  'china',
  'russia',
  'eastern bloc',
  'iron curtain',
];

const filterCommunistEvents = (events: any[]): HistoricalEvent[] => {
  console.log('Total events before filtering:', events.length);
  console.log('Sample of first event:', JSON.stringify(events[0], null, 2));
  
  const filteredEvents = events.filter(event => {
    const description = event.text.toLowerCase();
    const matches = communismKeywords.some(keyword => {
      const hasMatch = description.includes(keyword.toLowerCase());
      if (hasMatch) {
        console.log(`Matched keyword "${keyword}" in event:`, event.text);
      }
      return hasMatch;
    });
    return matches;
  }).map(event => ({
    date: event.date,
    description: event.text,
    year: parseInt(event.year),
    imageUrl: undefined,
  }));
  
  console.log('Total communist events found:', filteredEvents.length);
  if (filteredEvents.length > 0) {
    console.log('First communist event:', JSON.stringify(filteredEvents[0], null, 2));
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
    
    console.log('Response status:', response.status);
    console.log('Response data structure:', Object.keys(response.data));
    
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
  } catch (error) {
    console.error('Error fetching historical events:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
    }
    throw error;
  }
}; 