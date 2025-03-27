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
        setIsExpanded(!isExpanded);
    };


    // Select an option from the dropdown menu
    const selectOption = (option: string) => {
        setSelectedAction(option);
        setIsExpanded(false);
    };

    return (
        <vstack gap="small">
            <button onPress={toggleDropdown}>
                {isExpanded ? 'Close Menu' : 'Open Menu'}
            </button>
            {isExpanded && (
                <vstack gap="small" padding="small">
                    <button onPress={() => selectOption('experience')}>
                        Claim Daily Gift
                    </button>
                    <button onPress={() => selectOption('PointsRanking')}>
                        Points Ranking 
                    </button>
                    <button onPress={() => selectOption('TopGuesser')}>
                        TopGuesser
                    </button>
                    <button onPress={() => selectOption('CreatePoll')}>
                        Create Poll
                    </button>
                    <button onPress={() => selectOption('YourPolls')}>
                        YourPolls
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