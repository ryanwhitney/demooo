import type { StoryObj } from "@storybook/react";
import { Button } from "./Button";

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
			options: ["primary", "icon"],
			description: "The visual style of the button",
		},
		size: {
			control: { type: "select" },
			options: ["small", "medium", "large"],
			description: "The size of the button",
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

// Basic button story
export const Primary: Story = {
	args: {
		variant: "primary",
		size: "medium",
		children: "Primary Button",
	},
};

// Icon button story
export const IconButton: Story = {
	args: {
		variant: "icon",
		size: "medium",
		children: "✕",
		"aria-label": "Close",
	},
};

// Small button story
export const Small: Story = {
	args: {
		variant: "primary",
		size: "small",
		children: "Small Button",
	},
};

// Large button story
export const Large: Story = {
	args: {
		variant: "primary",
		size: "large",
		children: "Large Button",
	},
};

// Disabled button story
export const Disabled: Story = {
	args: {
		variant: "primary",
		size: "medium",
		children: "Disabled Button",
		disabled: true,
	},
};

// Story showing all variants
export const AllVariants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
			<Button variant="primary" size="small">
				Small Primary
			</Button>
			<Button variant="primary" size="medium">
				Medium Primary
			</Button>
			<Button variant="primary" size="large">
				Large Primary
			</Button>
			<Button variant="icon" size="small">
				✕
			</Button>
			<Button variant="icon" size="medium">
				✕
			</Button>
			<Button variant="icon" size="large">
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
			<Button variant="primary">Tab to Focus</Button>
		</div>
	),
};
