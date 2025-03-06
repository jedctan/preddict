import { Devvit, useState, Context } from '@devvit/public-api';
import ExperiencePost from './ExperiencePost.js';
import RankingSystem from './rankingSystem.js';


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
                    <button onPress={() => selectOption('ranking')}>
                        View Ranking 
                    </button>
                </vstack>
            )}
            {selectedAction === 'experience' && <ExperiencePost {...context} />}
            {selectedAction === 'ranking' && <RankingSystem {...context} />}
        </vstack>
    );
};

export default DropdownMenu;