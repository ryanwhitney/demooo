import { mockData } from "@/apollo/mockData";
import type { StoryObj } from "@storybook/react";
import AudioPlayer from "./AudioPlayer";

const meta = {
  title: "Components/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    track: mockData.tracks[0],
  },
};
