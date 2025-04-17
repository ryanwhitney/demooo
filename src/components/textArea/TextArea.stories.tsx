import type { Meta, StoryObj } from "@storybook/react";
import TextArea from "./TextArea";

const meta: Meta<typeof TextArea> = {
	title: "Components/TextArea",
	component: TextArea,
	tags: ["autodocs"],
	parameters: {
		backgrounds: {
			default: "dark",
			values: [
				{ name: "dark", value: "#121212" },
				{ name: "black", value: "#000000" },
			],
		},
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
	args: {
		label: "Description",
		placeholder: "Enter your description here...",
		rows: 4,
	},
};

export const WithValidation: Story = {
	args: {
		label: "Comment",
		placeholder: "Share your thoughts...",
		rows: 3,
		validate: (value) => {
			if (value.length < 10) {
				return "Please provide a more detailed comment (at least 10 characters)";
			}
			return "";
		},
		helperText: "Must be at least 10 characters",
	},
};

export const Error: Story = {
	args: {
		label: "Feedback",
		placeholder: "Tell us what went wrong",
		rows: 3,
		errorMessage: "Feedback submission failed",
	},
};

export const Success: Story = {
	args: {
		label: "Notes",
		placeholder: "Add any additional notes here",
		rows: 3,
		state: "success",
		helperText: "Your notes have been saved",
	},
};

export const Disabled: Story = {
	args: {
		label: "Read-only content",
		placeholder: "This content cannot be edited",
		rows: 3,
		disabled: true,
		value:
			"This is some sample content that cannot be edited because the textarea is disabled.",
	},
};

export const NonResizable: Story = {
	args: {
		label: "Fixed size textarea",
		placeholder: "This textarea cannot be resized",
		rows: 4,
		resizable: false,
	},
};

export const WithMaxHeight: Story = {
	args: {
		label: "Limited height",
		placeholder: "This textarea has a maximum height",
		rows: 3,
		maxHeight: "150px",
		helperText:
			"This textarea will show a scrollbar when content exceeds the max height",
	},
};

export const WithMinHeight: Story = {
	args: {
		label: "Minimum height",
		placeholder: "This textarea has a minimum height",
		rows: 2,
		minHeight: "120px",
		helperText: "This textarea will always be at least 120px tall",
	},
};
