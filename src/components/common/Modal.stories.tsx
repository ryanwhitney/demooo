import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test';
import Modal from './Modal'

const meta = {
  title: 'Common/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div>This is a modal with some content</div>,
    onClose: fn(),
  },
}

export const WithForm: Story = {
  args: {
    children: (
      <form>
        <h2>Login Form</h2>
        <div>
          <label>Username:</label>
          <input type="text" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" />
        </div>
        <button type="submit">Submit</button>
      </form>
    ),
    onClose: () => console.log('Modal closed'),
  },
}

export const WithLongContent: Story = {
  args: {
    children: (
      <div>
        <h2>Long Content Modal</h2>
        <p>This is a paragraph of text.</p>
        <p>This is another paragraph of text.</p>
        <p>This is yet another paragraph of text.</p>
        <p>This is the last paragraph of text.</p>
      </div>
    ),
    onClose: () => console.log('Modal closed'),
  },
} 