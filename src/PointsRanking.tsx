import { Devvit, useAsync } from '@devvit/public-api';
import { fetchTopUsers } from './pointsAPI.js';

const PointsRanking = (context: Devvit.Context) => {
    const { data: topUsers, loading, error } = useAsync(async () => {
        //console.log('Fetching top users with context:', context);
        const users = await fetchTopUsers(context);
        console.log('Fetched users:', users);
        return users;
    });

    if (loading) {
        return <text>Loading...</text>;
    }
    if (error) {
        return <text>Error loading leaderboard</text>;
    }

    //console.log('topUsers:', topUsers);

    return (
        <vstack>
            <text>Points - Leaderboard</text>
            {topUsers && topUsers.length > 0 ? (
                topUsers.map((user, index) => (
                    <text key={`${user?.userName ?? index}`}>
                        {user?.userName ?? "Unknown"} - {user?.points ?? 0} pts
                    </text>
                ))
            ) : (
                <text>No users found.</text>
            )}
        </vstack>
    );
};

export default PointsRanking;