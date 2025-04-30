import { useState, useEffect } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { IS_TRACK_FAVORITED } from '@/apollo/queries/favoriteTrackQueries'
import { FAVORITE_TRACK, UNFAVORITE_TRACK } from '@/apollo/mutations/favoriteTrackMutations'
import { gql } from '@apollo/client';

export function useFavorite(trackId: string) {
  const [loading, setLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState<number | undefined>(undefined);
  const apolloClient = useApolloClient();
  
  // Check if current user has favorited the track
  const { data, refetch } = useQuery(IS_TRACK_FAVORITED, {
    variables: { trackId },
    skip: !trackId,
  });

  const isFavorited = data?.isTrackFavorited || false;
  
  // Use count from query if available, otherwise use state
  useEffect(() => {
    if (data?.track?.favoritesCount !== undefined) {
      setFavoritesCount(data.track.favoritesCount);
    }
  }, [data?.track?.favoritesCount]);

  // Get initial favorites count from cache if available
  useEffect(() => {
    if (trackId && favoritesCount === undefined) {
      try {
        // Try to read the track from Apollo cache
        const cacheData = apolloClient.readFragment({
          id: `Track:${trackId}`,
          fragment: gql`
            fragment TrackFavoritesCount on Track {
              favoritesCount
            }
          `
        });
        
        if (cacheData?.favoritesCount !== undefined) {
          setFavoritesCount(cacheData.favoritesCount);
        }
      } catch (error) {
        // If reading from cache fails, that's ok
      }
    }
  }, [trackId, apolloClient, favoritesCount]);
  
  const [favoriteTrackMutation] = useMutation(FAVORITE_TRACK);
  const [unfavoriteTrackMutation] = useMutation(UNFAVORITE_TRACK);
  
  const favoriteTrack = async () => {
    if (loading || isFavorited) return;
    
    // Optimistically update the favorites count
    if (favoritesCount !== undefined) {
      setFavoritesCount(favoritesCount + 1);
    }
    
    setLoading(true);
    try {
      const result = await favoriteTrackMutation({
        variables: { trackId }
      });
      
      if (result.data?.favoriteTrack?.success) {
        // Update the count with the actual value from the server
        if (result.data.favoriteTrack.track?.favoritesCount !== undefined) {
          setFavoritesCount(result.data.favoriteTrack.track.favoritesCount);
        }
        // Refetch the favorite status to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Error favoriting track:', error);
      // Revert optimistic update if there was an error
      if (favoritesCount !== undefined) {
        setFavoritesCount(favoritesCount);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const unfavoriteTrack = async () => {
    if (loading || !isFavorited) return;
    
    // Optimistically update the favorites count
    if (favoritesCount !== undefined && favoritesCount > 0) {
      setFavoritesCount(favoritesCount - 1);
    }
    
    setLoading(true);
    try {
      const result = await unfavoriteTrackMutation({
        variables: { trackId }
      });
      
      if (result.data?.unfavoriteTrack?.success) {
        // Update the count with the actual value from the server
        if (result.data.unfavoriteTrack.track?.favoritesCount !== undefined) {
          setFavoritesCount(result.data.unfavoriteTrack.track.favoritesCount);
        }
        // Refetch the favorite status to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Error unfavoriting track:', error);
      // Revert optimistic update if there was an error
      if (favoritesCount !== undefined) {
        setFavoritesCount(favoritesCount);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFavorite = async () => {
    if (isFavorited) {
      await unfavoriteTrack();
    } else {
      await favoriteTrack();
    }
  };

  return {
    isFavorited,
    loading,
    favoritesCount,
    favoriteTrack,
    unfavoriteTrack,
    toggleFavorite
  };
}