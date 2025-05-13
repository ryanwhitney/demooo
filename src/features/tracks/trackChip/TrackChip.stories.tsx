import { mockData } from "@/apollo/mockData";
import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router";
import TrackChip from "./TrackChip";

const meta: Meta<typeof TrackChip> = {
  title: "Components/TrackChip",
  component: TrackChip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "black",
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TrackChip>;

export const Default: Story = {
  args: {
    track: mockData.tracks[0],
  },
};
