export interface HistoricalEvent {
  date: string;
  description: string;
  year: number;
  imageUrl?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Detail: { event: HistoricalEvent };
}; 