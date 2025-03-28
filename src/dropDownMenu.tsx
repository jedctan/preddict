import { Devvit, useState, Context } from '@devvit/public-api';
import DailyClaim from './DailyClaim.js';
import PointsRanking from './PointsRanking.js';
import GuessingRanking from './GuessRanking.js';
import PollForm from './PollCreate.js';
import YourPolls from './YourPolls.js';

// DropdownMenu component
const DropdownMenu = (context: Context) => {
    // State for the dropdown menu
    const [isExpanded, setIsExpanded] = useState(false);
    // State for the selected action
    const [selectedAction, setSelectedAction] = useState<string | null>(null);


    // Toggle the dropdown menu
    const toggleDropdown = () => {
        if (isExpanded) {
            setSelectedAction(null); // Reset the selected action when closing the menu
        } else {
            setSelectedAction(null); // Reset the selected action when reopening the menu
        }
        setIsExpanded(!isExpanded); // Toggle the menu's visibility
    };


    // Select an option from the dropdown menu
    const selectOption = (option: string) => {
        setSelectedAction(option);
        setIsExpanded(false);
    };

    return (
        <vstack gap="small">
            <button onPress={toggleDropdown}>
                {isExpanded ? 'Close Menu' : '☰'}
            </button>
            {isExpanded && (
                <vstack gap="small" padding="small">
                <button onPress={() => selectOption('experience')} appearance="secondary">
                    🎁 Claim Daily Gift
                </button>
                <button onPress={() => selectOption('PointsRanking')} appearance="secondary">
                    📊 Points Ranking
                </button>
                <button onPress={() => selectOption('TopGuesser')} appearance="secondary">
                    🏆 Top Guesser
                </button>
                <button onPress={() => selectOption('CreatePoll')} appearance="secondary">
                    🗳️ Create Preddict
                </button>
                <button onPress={() => selectOption('YourPolls')} appearance="secondary">
                    📌 Your Polls
                </button>
                </vstack>
            )}
            {selectedAction === 'experience' && <DailyClaim {...context} />}
            {selectedAction === 'PointsRanking' && <PointsRanking {...context} />}
            {selectedAction === 'TopGuesser' && <GuessingRanking {...context} />}
            {selectedAction === 'CreatePoll' && <PollForm {...context} />}
            {selectedAction === 'YourPolls' && <YourPolls {...context} />}

        </vstack>
    );
};

export default DropdownMenu;