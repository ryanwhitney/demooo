import type { Meta, StoryObj } from "@storybook/react";
import ProgressIndicator from "./ProgressIndicator";

const meta: Meta<typeof ProgressIndicator> = {
	title: "Components/ProgressIndicator",
	component: ProgressIndicator,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof ProgressIndicator>;

export const Default: Story = {};
