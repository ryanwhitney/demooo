import { useState } from 'react'
import { useMutation } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';
import { AUTH_USER } from '../apollo/queries/userQueries'
import { LoginInput } from '../types/auth'
import Button from './button/Button'
import ProgressIndicator from './progressIndicator/ProgressIndicator.tsx'
import TextInput from './textInput/TextInput'

type LoginProps = {
  onSuccess: () => void;
}

function Login({ onSuccess }: LoginProps) {
  const [formData, setFormData] = useState<LoginInput>({
    username: '',
    password: ''
  });

  const { setIsAuthenticated } = useAuth();

  const [authenticateUser, { loading, error }] = useMutation(AUTH_USER, {
    variables: {
      username: formData.username,
      password: formData.password,
    },
    onCompleted: (data) => {
      setFormData({ username: '', password: '' });
      localStorage.setItem('authToken', data.tokenAuth.token)
      setIsAuthenticated(true)
      onSuccess()
    }
  })

  if (error) return `Submission error! ${error.message}`;

  return ( 
    <form onSubmit={e => {
      e.preventDefault();
      authenticateUser();
    }}>
      <TextInput
        label="Email"
        type="email"
        placeholder="sad@bedroomguitar.com"
        value={formData.username}
        onChange={e => setFormData({ ...formData, username: e.target.value })} 
        required
      />
      
      <TextInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })} 
        required
      />
      <br/>
      <Button size='large' style={{width: '100%'}} type="submit">
        {loading ? <ProgressIndicator/> : 'Login'}
      </Button>
    </form>
  )
}

export default Login
