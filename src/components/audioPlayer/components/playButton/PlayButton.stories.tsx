import type { StoryObj } from "@storybook/react";
import PlayButton from "./PlayButton";

const meta = {
  title: "Components/PlayButton",
  component: PlayButton,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isPlaying: false,
  },
};
