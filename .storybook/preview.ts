
import type { Preview } from '@storybook/react'
import '../src/styles/reset.css'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      values: [
        { name: 'dark', value: '#333' },
        { name: 'light', value: '#F7F9F2' },
        { name: 'black', value: '#000' },
      ],
      default: 'dark',
    },
  },
};

export default preview;