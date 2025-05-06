import type { Meta, StoryFn } from "@storybook/react";
import type { ReactNode } from "react";
import ModalForm from "./ModalForm";
import { useState } from "react";

const meta = {
	title: "Components/ModalForm",
	component: ModalForm,
	tags: ["autodocs"],
} satisfies Meta<typeof ModalForm>;

export default meta;

type Story = {
	render: StoryFn<typeof ModalForm>;
	parameters?: {
		docs?: {
			story?: {
				inline?: boolean;
			};
		};
	};
};

// Wrapper for stories
const ModalWrapper = ({
	children,
	title,
	description,
	minWidth,
}: {
	children: ReactNode;
	title?: string;
	description?: string;
	minWidth?: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<button type="button" onClick={() => setIsOpen(true)}>
				Open Modal
			</button>
			{isOpen && (
				<ModalForm
					onOpenChange={(isOpen) => setIsOpen(isOpen)}
					title={title}
					description={description}
					minWidth={minWidth}
				>
					{children}
				</ModalForm>
			)}
		</div>
	);
};

export const Default: Story = {
	render: () => (
		<ModalWrapper>
			<div>This is a modal with some content</div>
		</ModalWrapper>
	),
	parameters: {
		docs: {
			story: { inline: true },
		},
	},
};

export const WithTitle: Story = {
	render: () => (
		<ModalWrapper title="Login" description="Please enter your credentials">
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
		</ModalWrapper>
	),
	parameters: {
		docs: {
			story: { inline: true },
		},
	},
};

export const WithTitleAndDescription: Story = {
	render: () => (
		<ModalWrapper
			title="Long Content"
			description="This modal contains a lot of text"
		>
			<div>
				<p>This is a paragraph of text.</p>
				<p>This is another paragraph of text.</p>
				<p>This is yet another paragraph of text.</p>
				<p>This is the last paragraph of text.</p>
			</div>
		</ModalWrapper>
	),
	parameters: {
		docs: {
			story: { inline: true },
		},
	},
};
