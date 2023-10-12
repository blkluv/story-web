import {
  ActivityType,
  GridView,
  UiTheme,
  UserActivityData,
} from '@getstoryteller/storyteller-sdk-javascript';
import '@getstoryteller/storyteller-sdk-javascript/dist/storyteller.min.css';
import { useEffect, useRef } from 'react';
import useStoryteller from '@/hooks/useStoryteller';
import TitleAndMoreButton from '@/components/TitleAndMoreButton';
import { useAmplitudeTracker } from '@/hooks/useAmplitudeTracker';

const FOUR_COLUMNS_LAYOUT = {
  lists: {
    grid: {
      columns: 4,
    },
  },
};

const StorytellerStoriesGridView = ({
  categories,
  title,
  displayLimit,
  moreButtonTitle,
}: StorytellerStoriesGridViewProps) => {
  const urlSafeCategories = categories.join('-');
  const id = 'storyteller-stories-grid-view-' + urlSafeCategories;
  const storyGrid = useRef<GridView>();
  const { isStorytellerInitialized } = useStoryteller();
  const { logUserActivityToAmplitude } = useAmplitudeTracker();
  useEffect(() => {
    if (!isStorytellerInitialized) {
      return;
    }
    storyGrid.current = new GridView(id, categories);
    storyGrid.current.displayLimit = displayLimit;
    storyGrid.current.theme = new UiTheme({
      light: FOUR_COLUMNS_LAYOUT,
      dark: FOUR_COLUMNS_LAYOUT,
    });
    storyGrid.current.delegate = {
      getAdConfig: (stories: Story[]) => {
        // Define custom targeting here
        const customTargeting = {
          key1: 'value1',
          key2: 'value2',
          // Add other custom targeting options as needed
        };

        return {
          slot: '/33813572/qa-ads',
          customTargeting, // Include custom targeting
        };
      },
      onUserActivityOccurred: (type: ActivityType, data: UserActivityData) => {
        logUserActivityToAmplitude(type, data);
      },
      onShareButtonClicked: (text: string, title: string, url: string) => {
        const shareUrl = new URL(url);
        shareUrl.searchParams.append('utm_source', 'storyteller');
        shareUrl.searchParams.append('utm_medium', 'share');
        shareUrl.searchParams.append('utm_campaign', 'storyteller');
        navigator.share({
          text: text,
          title: title,
          url: shareUrl.toString(),
        });
      },
    };
  }, [id, categories, displayLimit, logUserActivityToAmplitude, isStorytellerInitialized]);

  return (
    <>
      <TitleAndMoreButton
        title={title}
        moreButtonTitle={moreButtonTitle}
        category={urlSafeCategories}
      />
      <div id={id} data-base-url={urlSafeCategories} />
    </>
  );
};

