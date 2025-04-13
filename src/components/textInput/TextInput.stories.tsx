import type { Meta, StoryObj } from "@storybook/react";
import TextInput from "./TextInput";

const meta: Meta<typeof TextInput> = {
	title: "Components/TextInput",
	component: TextInput,
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

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
	args: {
		label: "Label",
		placeholder: "Enter text",
	},
};

export const WithValidation: Story = {
	args: {
		label: "Label",
		placeholder: "Enter text",
		validate: (value) => {
			if (value.length < 3) {
				return "C'mon… keep typing…";
			}
			return "";
		},
		helperText: "Must be 3 characters or more",
	},
};

export const Error: Story = {
	args: {
		label: "Label",
		placeholder: "Enter text",
		errorMessage: "It's all gone wrong",
	},
};

export const Success: Story = {
	args: {
		label: "Label",
		placeholder: "Enter text",
		state: "success",
		helperText: "Looks good to me",
	},
};

export const Disabled: Story = {
	args: {
		label: "Label",
		placeholder: "Mouse over me",
		disabled: true,
	},
};
