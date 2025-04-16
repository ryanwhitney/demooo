import type { StoryObj } from "@storybook/react";
import AudioPlayer from "./AudioPlayer";
import { mockData } from "@/apollo/mockData";

const meta = {
	title: "Components/AudioPlayer",
	component: AudioPlayer,
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
