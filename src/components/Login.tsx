import { useState } from 'react'
import { useMutation } from '@apollo/client';
import { useAuth } from './auth/AuthProvider'
import { AUTH_USER } from '../apollo/queries/userQueries'
import { LoginInput } from '../types/auth'
import Button from './common/Button'

function Login() {
  const [formData, setFormData] = useState<LoginInput>({
    username: '',
    password: ''
  });

  const { setIsAuthenticated } = useAuth();

  const [authenticateUser, { data, loading, error }] = useMutation(AUTH_USER, {
    variables: {
      username: formData.username,
      password: formData.password,
    },
    onCompleted: (data) => {
      setFormData({ username: '', password: '' });
      localStorage.setItem('authToken', data.tokenAuth.token)
      setIsAuthenticated(true)
    }
  })

  if (loading) return 'Submitting...';
  if (error) return `Submission error! ${error.message}`;

  return ( 
    <form onSubmit={e => {
      e.preventDefault();
      authenticateUser();
    }}>
      {JSON.stringify(data)}
      <label>
        username: <input 
          type="text" 
          name="email" 
          autoComplete='email'
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })} 
        />
      </label>
      <label>
        password: <input 
          type="password" 
          name="password" 
          autoComplete='current-password'
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })} 
        />
      </label>
      <Button size='small' type="submit">Login</Button>
    </form>
  )
}

export default Login
