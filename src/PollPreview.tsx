import { Devvit } from '@devvit/public-api';

interface PollPreviewProps {
  question: string;
  options: string[];
}

const PollPreview = ({ question, options }: PollPreviewProps): JSX.Element => {
  return (
    <blocks height="tall">
      <vstack alignment="center middle">
        <text style="heading">{question}</text>
        <spacer height="8px" />
      </vstack>
    </blocks>
  );
};

export default PollPreview;
