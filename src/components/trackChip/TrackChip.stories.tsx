import { Meta, StoryObj } from '@storybook/react';
import TrackChip from './TrackChip';

const meta: Meta<typeof TrackChip> = {
  title: 'Components/TrackChip',
  component: TrackChip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { 
      default: 'black'  // This should override the global default
    },
  },
};

export default meta;

type Story = StoryObj<typeof TrackChip>;

export const Default: Story = {
  args: {
    track: {
      id: '1',
      title: 'Song Title',
      artist: 'Artist Name',
      albumArt: 'https://picsum.photos/300/300',
      duration: 180,
      createdAt: new Date(),
      recordedAt: new Date('2023-01-01'),
      tags: 'synth, electronic, op-1',
    },
  },
};