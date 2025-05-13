import type { Meta, StoryObj } from "@storybook/react";
import SpinnerLoadIndicator from "./SpinnerLoadIndicator";

const meta: Meta<typeof SpinnerLoadIndicator> = {
  title: "Components/SpinnerLoadIndicator",
  component: SpinnerLoadIndicator,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SpinnerLoadIndicator>;

export const Default: Story = {};
