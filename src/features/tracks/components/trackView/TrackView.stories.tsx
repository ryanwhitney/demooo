import { mockData } from "@/apollo/mockData";
import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router";
import TrackView from "./TrackView";

const meta: Meta<typeof TrackView> = {
	title: "Components/TrackView",
	component: TrackView,
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

type Story = StoryObj<typeof TrackView>;

export const Default: Story = {
	args: {
		track: mockData.tracks[0],
	},
};
