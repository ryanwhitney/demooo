import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { IS_FOLLOWING } from '@/apollo/queries/followQueries'
import { FOLLOW_USER, UNFOLLOW_USER } from '@/apollo/mutations/followMutations'


export function useFollow(username: string) {
  const [loading, setLoading] = useState(false);
  
  // Check if current user is following the user
  const { data, refetch } = useQuery(IS_FOLLOWING, {
    variables: { username },
    skip: !username,
  });

  const isFollowing = data?.isFollowing || false;
  
  const [followUserMutation] = useMutation(FOLLOW_USER);
  const [unfollowUserMutation] = useMutation(UNFOLLOW_USER);
  
  const followUser = async () => {
    if (loading || isFollowing) return;
    
    setLoading(true);
    try {
      const result = await followUserMutation({
        variables: { username }
      });
      
      if (result.data?.followUser?.success) {
        // Refetch the follow status to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const unfollowUser = async () => {
    if (loading || !isFollowing) return;
    
    setLoading(true);
    try {
      const result = await unfollowUserMutation({
        variables: { username }
      });
      
      if (result.data?.unfollowUser?.success) {
        // Refetch the follow status to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollowUser();
    } else {
      await followUser();
    }
  };

  return {
    isFollowing,
    loading,
    followUser,
    unfollowUser,
    toggleFollow
  };
}
