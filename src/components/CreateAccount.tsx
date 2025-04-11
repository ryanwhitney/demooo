import { useState } from 'react'
import '../App.css'
import { useMutation } from '@apollo/client';
import { useAuth } from './auth/AuthProvider'
import { AUTH_USER, CREATE_USER } from '../apollo/queries/userQueries'
import { RegisterInput } from '../types/auth'

function CreateAccount() {
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
    },
    onError: (error) => {
      setFormData({ ...formData, password: '' });
      console.error("Authentication error after signup:", error)
      alert("Account created but couldn't log in automatically. Please try logging in manually.")
    }
  });

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

  if (loading) return 'Submitting...';
  if (error) return `Submission error! ${error.message}`;

  return ( 
    <form onSubmit={e => {
      e.preventDefault();
      createAccount();
    }}>
      {JSON.stringify(data)}
      <label>
        email: <input 
          type="text" 
          name="email" 
          autoComplete='email'
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })} 
        />
      </label>
      <label>
        password: <input 
          type="password" 
          name="password" 
          autoComplete='new-password'
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })} 
        />
      </label>
      <button type="submit">Create Account</button>
    </form>
  )
}

export default CreateAccount
