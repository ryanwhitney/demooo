import type { StoryObj } from "@storybook/react";
import Button from "./Button";

const meta = {
	title: "Components/Button",
	component: Button,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["primary", "secondary", "nav", "icon"],
			description: "The visual style of the button",
		},
		disabled: {
			control: "boolean",
			description: "Whether the button is disabled",
		},
		onClick: { action: "clicked" },
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		variant: "primary",
		children: "Primary Button",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Secondary Button",
	},
};

export const Nav: Story = {
	args: {
		variant: "nav",
		children: "nav Button",
	},
};

// Icon button story
export const IconButton: Story = {
	args: {
		variant: "icon",
		children: "✕",
		"aria-label": "Close",
	},
};

// Story showing all variants
export const AllVariants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
			<Button variant="primary">Small Primary</Button>
			<Button variant="secondary">Medium Primary</Button>
			<Button variant="nav">Log in</Button>
			<Button variant="icon">✕</Button>
			<Button variant="primary" disabled>
				Small Primary
			</Button>
			<Button variant="secondary" disabled>
				Medium Primary
			</Button>
			<Button variant="nav" disabled>
				Log in
			</Button>

			<Button variant="icon" disabled>
				✕
			</Button>
		</div>
	),
};

// Story showing focus state (use Tab to see it)
export const FocusState: Story = {
	parameters: {
		docs: {
			description: {
				story: "Press the Tab key to see the focus state of the button.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: "12px" }}>
			<Button>Tab to Focus</Button>
		</div>
	),
};
