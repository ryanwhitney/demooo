import { useState, useEffect } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client';
import { useAuth } from '../hooks/useAuth'
import { AUTH_USER, CREATE_USER, GET_USERNAME,  } from '../apollo/queries/userQueries'
import { RegisterInput } from '../types/auth'
import Button from './button/Button'
import TextInput from './textInput/TextInput'
import ProgressIndicator from './progressIndicator/ProgressIndicator'
import ErrorBox from './errorBox/ErrorBox'

type CreateAccountProps = {
  onSuccess: () => void;
}

const CreateAccount = ({ onSuccess }: CreateAccountProps) => {
  const [usernameError, setUsernameError] = useState('');
  const [formData, setFormData] = useState<RegisterInput>({
    email: '',
    username: '',
    password: '',
  });
  const { setIsAuthenticated } = useAuth();

  const [checkUsername, { loading: checkingUsername }] = useLazyQuery(GET_USERNAME, {
    onCompleted: (data) => {
      if (data.user) {
        setUsernameError('This username is already taken');
      } else {
        setUsernameError('');
      }
    }
  });

  const [createAccount, { loading, error }] = useMutation(CREATE_USER, {
    variables: {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    },
    onCompleted: () => {
      authenticateUser({
        variables: {
          username: formData.username,
          password: formData.password,
        }
      })
    }
  });

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
    }
  });

  const validateUsername = async (value: string) => {
    if (!value) {
      return 'Username is required';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    
    // Only check w server if length is valid
    try {
      const { data } = await checkUsername({ 
        variables: { username: value },
        fetchPolicy: 'network-only'
      });
      
      if (data?.user) {
        return 'This username is already taken';
      }
      return '';
    } catch (error) {
      console.error('Error checking username:', error);
      return 'Error checking username availability';
    }
  }

  function validateEmail(value: string){
    if (!value) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  useEffect(() => {
    if (formData.username.length >= 3) {
      const timer = setTimeout(() => {
        checkUsername({ variables: { username: formData.username } });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.username, checkUsername]);

  
  return (
    <>
      {error && (
        <ErrorBox text={error.message} />
      )}
      <form onSubmit={e => {
        e.preventDefault();
        if (usernameError) return; // Prevent submission if username is taken
        console.log("About to send mutation with:", {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        createAccount();
      }}>
        <TextInput
          label="Username"
          type="text"
          placeholder="ryannn"
          value={formData.username}
          autoComplete='username'
          debounceTime={750}
          onChange={e => setFormData({ ...formData, username: e.target.value})}
          validate={validateUsername}
          required
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="ryan@sadbedroommusic.com"
          value={formData.email}
          autoComplete='email'
          debounceTime={2000}
          onChange={e => setFormData({ ...formData, email: e.target.value})}
          validate={validateEmail}
          required
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete='new-password'
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <br/>
        <Button size='large' style={{width: '100%'}} type="submit" disabled={!!usernameError || checkingUsername}>
          {loading ? <ProgressIndicator/> : 'Joinnnn'}
        </Button>
      </form>
    </>
  )
}

export default CreateAccount