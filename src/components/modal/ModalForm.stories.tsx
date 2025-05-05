import type { StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import ModalForm from "./ModalForm";

const meta = {
	title: "Components/Modal",
	component: ModalForm,
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: <div>This is a modal with some content</div>,
		onClose: fn(),
	},
};

export const WithTitle: Story = {
	args: {
		title: "Login",
		description: "Please enter your credentials",
		children: (
			<form>
				<div>
					<label htmlFor="username">Username:</label>
					<input id="username" name="username" type="text" />
				</div>
				<div>
					<label htmlFor="pass">Password:</label>
					<input id="pass" name="pass" type="password" />
				</div>
				<button type="submit">Submit</button>
			</form>
		),
		onClose: () => console.log("Modal closed"),
	},
};

export const WithTitleAndDescription: Story = {
	args: {
		title: "Long Content",
		description: "This modal contains a lot of text",
		children: (
			<div>
				<p>This is a paragraph of text.</p>
				<p>This is another paragraph of text.</p>
				<p>This is yet another paragraph of text.</p>
				<p>This is the last paragraph of text.</p>
			</div>
		),
		onClose: () => console.log("Modal closed"),
	},
};
