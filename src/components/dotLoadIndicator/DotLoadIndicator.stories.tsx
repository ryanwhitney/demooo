import type { Meta, StoryObj } from "@storybook/react";
import DotLoadIndicator from "./DotLoadIndicator";

const meta: Meta<typeof DotLoadIndicator> = {
  title: "Components/DotLoadIndicator",
  component: DotLoadIndicator,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DotLoadIndicator>;

export const Default: Story = {};
