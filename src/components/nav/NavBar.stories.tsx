import type { Meta, StoryObj } from '@storybook/react'
import NavBar from './NavBar'
import { GET_ME } from '../../apollo/queries/userQueries'
import { AuthContext } from '../../providers/AuthContext'
import { AuthContextType } from '../../types/auth'
import { MemoryRouter } from 'react-router'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withAuthAndRouter = (value: Partial<AuthContextType>) => (Story: any) => {
  const contextValue: AuthContextType = {
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    user: null,
    logout: () => {},
    refreshLoading: false,
    ...value,
  }

  return (
    <MemoryRouter>
      <AuthContext.Provider value={contextValue}>
        <Story />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

const meta: Meta<typeof NavBar> = {
  title: 'Components/NavBar',
  component: NavBar,
}

export default meta
type Story = StoryObj<typeof NavBar>

export const LoggedOut: Story = {
  decorators: [
    withAuthAndRouter({
      isAuthenticated: false,
      user: null,
    }),
  ],
  parameters: {
    apolloClient: {
      mocks: [
        {
          request: {
            query: GET_ME,
          },
          result: {
            data: {
              me: null,
            },
          },
        },
      ],
    },
  },
}

export const LoggedIn: Story = {
  decorators: [
    withAuthAndRouter({
      isAuthenticated: true,
      user: {
        id: '18',
        username: 'music@man.com',
        email: 'music@man.com',
        firstName: '',
        lastName: '',
      },
      logout: () => console.log('Logout clicked'),
    }),
  ],
  parameters: {
    apolloClient: {
      mocks: [
        {
          request: {
            query: GET_ME,
          },
          result: {
            data: {
              me: {
                id: '18',
                username: 'music@man.com',
                email: 'music@man.com',
                firstName: '',
                lastName: '',
              },
            },
          },
        },
      ],
    },
  },
}
