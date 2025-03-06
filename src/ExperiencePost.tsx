import { Devvit, useAsync, useState } from '@devvit/public-api';
import { fetchUserPoints, updateUserPoints, isNewUser, addNewUser , fetchDailyGiftStatus, updateGiftKey } from './pointsAPI.js';

const ExperiencePost = (context: Devvit.Context) => {
    //Fetches the current user id and name
  const { data: currentUser, loading: userLoading, error: userError } = useAsync(async () => {
    const user = await context.reddit.getCurrentUser();
    return user ? { id: user.id, name: user.username } : null;
  });
  //Checks if the user is new or not
  const { data: userIsNew, loading: newUserLoading, error: newUserError } = useAsync(
    async () => {
      if (!currentUser?.id) return false;
      return await isNewUser(context, currentUser.id);
    },
    { depends: [currentUser?.id ?? null] }
  );

  // If user is new, add them to the database (this useAsync runs when userIsNew is available)
  useAsync(
    async () => {
      if (userIsNew && currentUser?.id) {
        await addNewUser(context, currentUser.id);
        return true;
      }
      return false;
    },
    { depends: [userIsNew, currentUser?.id ?? null] }
  );


  const [refreshCounter, setRefreshCounter] = useState(0);

  //Calls method fetchUserPOints from puclib-api/pointsAPI.ts to get the user points
  const { data: points, loading: pointsLoading, error: pointsError } = useAsync(
    async () => {
      if (!currentUser?.id) return 0;
      return await fetchUserPoints(context, currentUser.id);
    },
    { depends: [currentUser?.id ?? null, refreshCounter] }
  );

  const refreshData = () => {
    setRefreshCounter((prev) => {
      const newValue = prev + 1;
      console.log('Refreshing data, new refreshCounter:', newValue);
      return newValue;
    });
  };
//fetches the status of the given users daily gift status 
  const {
    data: hasClaimed,
    loading: giftLoading,
    error: giftError,
  } = useAsync(
    async () => {
      if (!currentUser?.id) return false;
      return await fetchDailyGiftStatus(context, currentUser.id);
    },
    { depends: [currentUser?.id ?? null, refreshCounter] }
  );


  const claimGift = async () => {
    if (!currentUser?.id) {
      context.ui.showToast('User not found');
      return;
    }
    try {
      // Claim the daily gift: add 1000 points and mark the gift as claimed
      await updateGiftKey(context, currentUser.id);
      // Then, update the user's points by adding 1000.
      await updateUserPoints(context, currentUser.id, 1000);
      context.ui.showToast('Daily Gift Claimed: 1000 points added!');
      // Refresh both points and daily gift status so the UI updates.
      refreshData();
    } catch (error) {
      console.error('Error claiming daily gift:', error);
      context.ui.showToast('Failed to claim daily gift');
    }
  };



  const test = async () => {
    if (!currentUser?.id) {
        context.ui.showToast('User not found');
        return;
      }
      try {
        await updateUserPoints(context, currentUser.id, 1);
        refreshData();
        context.ui.showToast('Point added!');
      } catch (error) {
        console.error('Error updating user points:', error);
        context.ui.showToast('Failed to update points');
      }

  }




  // Show error if any errors occurred
  if (userError || pointsError || giftError) {
    return <text>Error loading user data</text>;
  }

  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      <text size="large">{`Welcome ${currentUser?.name}! Your Points: ${points}`}</text>
      <button appearance="primary" disabled={hasClaimed ?? false} onPress={claimGift}>
        {hasClaimed ? 'Daily Gift Claimed' : 'Daily Gift (1000)'}
      </button>
      <button appearance="primary" onPress={test}>
        Earn a Point!
      </button>
    </vstack>
  );
};


export default ExperiencePost;