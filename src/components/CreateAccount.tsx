import { useState } from 'react'
import { useMutation } from '@apollo/client';
import { useAuth } from '../hooks/useAuth'
import { AUTH_USER, CREATE_USER } from '../apollo/queries/userQueries'
import { RegisterInput } from '../types/auth'
import Button from './button/Button'
import TextInput from './textInput/TextInput'
import ProgressIndicator from './progressIndicator/ProgressIndicator'

type CreateAccountProps = {
  onSuccess: () => void;
}

function CreateAccount({ onSuccess }: CreateAccountProps) {
  const [formData, setFormData] = useState<RegisterInput>({
    email: '',
    username: '',
    password: '',
  });

  const { setIsAuthenticated } = useAuth();

  const [authenticateUser] = useMutation(AUTH_USER, {
    onCompleted: (data) => {
      setFormData({ ...formData, password: '' });
      localStorage.setItem('authToken', data.tokenAuth.token)
      setIsAuthenticated(true)
      onSuccess()
    },
    onError: (error) => {
      setFormData({ ...formData, password: '' });
      console.error("Authentication error after signup:", error)
      alert("Account created but couldn't log in automatically. Please try logging in manually.")
    }
  });

  const validateEmail = (value: string) => {
    if (!value) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const [createAccount, { data, loading, error }] = useMutation(CREATE_USER, {
    variables: {
      email: formData.email,
      username: formData.email,
      password: formData.password,
    },
    onCompleted: (data) => {
      console.log("Account created successfully:", data);
      authenticateUser({
        variables: {
          username: formData.email, 
          password: formData.password,
        }
      })
    }
  })

  if (error) return `Submission error! ${error.message}`;
  
  return ( 
    <form onSubmit={e => {
      e.preventDefault();
      createAccount();
    }}>
      {JSON.stringify(data)}
      <TextInput
        label="Email"
        type="email"
        placeholder="ryan@sadbedroommusic.com"
        value={formData.username}
        debounceTime={500}
        onChange={e => setFormData({ ...formData, username: e.target.value})}
        validate={validateEmail}
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
        {loading ? <ProgressIndicator/> : 'Joinnnn'}
      </Button>
    </form>
  )
}

export default CreateAccount
