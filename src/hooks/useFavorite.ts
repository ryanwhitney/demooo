
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { IS_TRACK_FAVORITED } from '@/apollo/queries/favoriteTrackQueries'
import { FAVORITE_TRACK, UNFAVORITE_TRACK } from '@/apollo/mutations/favoriteTrackMutations'


export function useFavorite(trackId: string) {
  const [loading, setLoading] = useState(false);
  
  // Check if  current user has favorited the track
  const { data, refetch } = useQuery(IS_TRACK_FAVORITED, {
    variables: { trackId },
    skip: !trackId,
  });

  const isFavorited = data?.isTrackFavorited || false;
  
  const [favoriteTrackMutation] = useMutation(FAVORITE_TRACK);
    const [unfavoriteTrackMutation] = useMutation(UNFAVORITE_TRACK);
  
  const favoriteTrack = async () => {
    if (loading || isFavorited) return;
    
    setLoading(true);
    try {
      const result = await favoriteTrackMutation({
        variables: { trackId }
      });
      
      if (result.data?.favoriteTrack?.success) {
        // Refetch the favorite status to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Error favoriting track:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const unfavoriteTrack = async () => {
    if (loading || !isFavorited) return;
    
    setLoading(true);
    try {
      const result = await unfavoriteTrackMutation({
        variables: { trackId }
      });
      
      if (result.data?.unfavoriteTrack?.success) {
        // Refetch the favorite status to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Error unfavoriting track:', error);
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
    favoriteTrack,
    unfavoriteTrack,
    toggleFavorite
  };
}