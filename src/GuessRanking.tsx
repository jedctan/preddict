import { Devvit, useAsync } from '@devvit/public-api';
import { fetchTopUsers_Guesses } from './pointsAPI.js';

const GuessRanking = (context: Devvit.Context) => {


    //const { data: topUsers, loading, error } = useAsync(async () => {
        //console.log('Fetching top users with context:', context);
    //    const users = await fetchTopUsers_Guesses(context);
     //   console.log('Fetched users:', users);
     //   return users;
    //});

// temp display of topUSers as polling system is not up yet 
    const topUsers = [
        { userName: 'User1', guesses: 100 },
        { userName: 'User2', guesses: 90 },
        { userName: 'User3', guesses: 80 },
        { userName: 'User4', guesses: 70 },
        { userName: 'User5', guesses: 60 }
    ];

    //if (loading) {
    //    return <text>Loading...</text>;
    //}
    //if (error) {
    //    return <text>Error loading leaderboard</text>;
    //}

    console.log('topUsers:', topUsers);

    return (
        <vstack>
            <text>Points - Leaderboard</text>
            {topUsers && topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                    <text key={`${user?.userName ?? index}`}>
                        {user?.userName ?? "Unknown"} - {user?.guesses ?? 0} pts
                    </text>
                ))
            ) : (
                <text>No users found.</text>
            )}
        </vstack>
    );
};

export default GuessRanking;