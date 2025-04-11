import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  useWindowDimensions,
  Share,
  Clipboard,
} from 'react-native';
import { HistoricalEvent } from '../types';
import { fetchTodayEvents } from '../services/historyApi';
import { generateImage } from '../services/imageGeneration';
import '../styles/scrollbar.css';

interface EventWithImageState extends HistoricalEvent {
  imageUrl?: string;
  imageLoading: boolean;
  imageError?: string;
}

export const HomeScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 600;
  const isMediumScreen = windowWidth >= 600 && windowWidth < 1024;
  
  const [events, setEvents] = useState<EventWithImageState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async (showRefresh = false) => {
    try {
      console.log('Starting to load events...');
      setError(null);
      if (showRefresh) setRefreshing(true);
      
      const todayEvents = await fetchTodayEvents();
      console.log('Fetched events:', todayEvents);

      const initialEvents: EventWithImageState[] = todayEvents.map(event => ({
        ...event,
        imageLoading: false,
      }));

      setEvents(initialEvents);

      // Generate images for each event
      for (let i = 0; i < initialEvents.length; i++) {
        try {
          console.log(`Starting image generation for event ${i}:`, initialEvents[i]);
          
          // Update loading state
          setEvents(current => 
            current.map((e, idx) => 
              idx === i ? { ...e, imageLoading: true, imageError: undefined } : e
            )
          );

          const imageUrl = await generateImage(initialEvents[i].description, initialEvents[i].year);
          console.log(`Image generation result for event ${i}:`, imageUrl ? 'Success' : 'Failed');

          // Update event with image URL
          setEvents(current => 
            current.map((e, idx) => 
              idx === i ? {
                ...e,
                imageUrl,
                imageLoading: false,
                imageError: undefined
              } : e
            )
          );
        } catch (err) {
          console.error(`Error generating image for event ${i}:`, err);
          setEvents(current => 
            current.map((e, idx) => 
              idx === i ? {
                ...e,
                imageLoading: false,
                imageError: err instanceof Error ? err.message : 'Failed to generate image'
              } : e
            )
          );
        }
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  const handleShare = async (event: EventWithImageState) => {
    const shareText = `${event.year}: ${event.description}\n\nShared from Kommissar's Digest`;
    
    if (Platform.OS === 'web' && navigator.share) {
      try {
        await navigator.share({
          title: 'Kommissar\'s Digest - Historical Event',
          text: shareText,
          url: window.location.href,
        });
        console.log('Successfully shared');
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy
        await Clipboard.setString(shareText);
        alert('Copied to clipboard!');
      }
    } else {
      // Fallback for platforms without share capability
      await Clipboard.setString(shareText);
      alert('Copied to clipboard!');
    }
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        await loadEvents();
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  console.log('Current state:', { loading, error, eventsCount: events.length });

  const dynamicStyles = StyleSheet.create({
    content: {
      flex: 1,
      maxWidth: isMediumScreen ? 800 : isSmallScreen ? '100%' : 1200,
      alignSelf: 'center',
      width: '100%',
    },
    scrollContent: {
      padding: isSmallScreen ? 8 : 16,
    },
    header: {
      backgroundColor: '#6a0000',
      padding: isSmallScreen ? 16 : 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
      position: 'relative',
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      zIndex: 1,
    },
    title: {
      fontSize: isSmallScreen ? 32 : 42,
      fontWeight: '900',
      color: '#FFD700',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 4 : 8,
      textTransform: 'uppercase',
      letterSpacing: 4,
      textShadowColor: '#FF0000',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      position: 'relative',
      zIndex: 2,
    },
    eventCard: {
      backgroundColor: '#000000',
      borderRadius: 8,
      marginBottom: isSmallScreen ? 24 : 32,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
      position: 'relative',
      borderWidth: 1,
      borderColor: '#3A3A3A',
    },
    eventCardOverlay: {
      // Remove the red overlay
    },
    image: {
      width: 'auto',
      height: isSmallScreen ? 200 : isMediumScreen ? 300 : 400,
      minWidth: '100%',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    imageContainer: {
      width: '100%',
      height: isSmallScreen ? 200 : isMediumScreen ? 300 : 400,
      backgroundColor: '#1A1A1A',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
      borderBottomWidth: 1,
      borderBottomColor: '#3A3A3A',
    },
    imageLoadingContainer: {
      height: isSmallScreen ? 200 : isMediumScreen ? 300 : 400,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      borderBottomWidth: 2,
      borderBottomColor: '#FF0000',
    },
    imageErrorContainer: {
      height: isSmallScreen ? 200 : isMediumScreen ? 300 : 400,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1A1A1A',
      padding: 16,
      borderBottomWidth: 2,
      borderBottomColor: '#FF0000',
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#000000',
      borderBottomWidth: 1,
      borderBottomColor: '#3A3A3A',
    },
    description: {
      fontSize: 18,
      color: '#FFFFFF',
      lineHeight: 28,
      padding: 16,
      paddingTop: 12,
      fontWeight: '500',
      backgroundColor: '#000000',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerOverlay} />
          <Text style={dynamicStyles.title}>Kommissar's Digest</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          <Text style={styles.subtitle}>Daily historical snippets about communism</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4444" />
          <Text style={styles.loadingText}>Loading historical events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerOverlay} />
          <Text style={dynamicStyles.title}>Kommissar's Digest</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          <Text style={styles.subtitle}>Daily historical snippets about communism</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => loadEvents(true)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerOverlay} />
        <Text style={dynamicStyles.title}>Kommissar's Digest</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        <Text style={styles.subtitle}>Daily historical snippets about communism</Text>
      </View>
      
      <ScrollView 
        style={dynamicStyles.content}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            colors={['#FF0000']}
            tintColor="#FF0000"
          />
        }
      >
        {events.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No historical events found for today.</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => loadEvents(true)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map((event, index) => (
            <View key={index} style={dynamicStyles.eventCard}>
              <View style={dynamicStyles.eventCardOverlay} />
              {event.imageLoading ? (
                <View style={dynamicStyles.imageLoadingContainer}>
                  <ActivityIndicator size={isSmallScreen ? "small" : "large"} color="#FFD700" />
                  <Text style={styles.imageLoadingText}>Generating historical image...</Text>
                </View>
              ) : event.imageError ? (
                <View style={dynamicStyles.imageErrorContainer}>
                  <Text style={styles.imageErrorText}>{event.imageError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      console.log('Retrying image generation for event:', event);
                      setEvents(current => 
                        current.map((e, i) => 
                          i === index ? { ...e, imageLoading: true, imageError: undefined } : e
                        )
                      );
                      generateImage(event.description, event.year)
                        .then(imageUrl => {
                          console.log('Retry image generation result:', imageUrl ? 'Success' : 'Failed');
                          setEvents(current => 
                            current.map((e, i) => 
                              i === index ? {
                                ...e,
                                imageUrl,
                                imageLoading: false,
                                imageError: undefined
                              } : e
                            )
                          );
                        })
                        .catch(err => {
                          console.error('Error retrying image generation:', err);
                          setEvents(current => 
                            current.map((e, i) => 
                              i === index ? {
                                ...e,
                                imageLoading: false,
                                imageError: err instanceof Error ? err.message : 'Failed to generate image'
                              } : e
                            )
                          );
                        });
                    }}
                  >
                    <Text style={styles.retryButtonText}>Retry Image Generation</Text>
                  </TouchableOpacity>
                </View>
              ) : event.imageUrl ? (
                <View style={dynamicStyles.imageContainer}>
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={[
                      dynamicStyles.image,
                      {
                        position: 'relative',
                        transform: [],
                      }
                    ]}
                    resizeMode="contain"
                    onError={(error) => {
                      console.error('Error loading image:', error);
                      setEvents(current =>
                        current.map((e, i) =>
                          i === index ? {
                            ...e,
                            imageError: 'Failed to load image'
                          } : e
                        )
                      );
                    }}
                  />
                </View>
              ) : null}
              <View style={dynamicStyles.eventHeader}>
                <Text style={styles.year}>{event.year}</Text>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={() => handleShare(event)}
                >
                  <Text style={styles.shareButtonText}>Share ⚡</Text>
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.description}>{event.description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a0000',
  },
  date: {
    fontSize: 20,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#FF0000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 200,
  },
  noEventsText: {
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  year: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#FF0000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imageLoadingText: {
    color: '#FFD700',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageErrorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shareButton: {
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 4,
  },
  shareButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 