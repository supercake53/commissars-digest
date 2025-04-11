export interface HistoricalEvent {
  date: string;
  description: string;
  year: number;
  imageUrl?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Detail: { event: HistoricalEvent };
}; 