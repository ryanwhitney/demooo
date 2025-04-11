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
    firstName: '',
    lastName: ''
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
      password: formData.password,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName
    },
    onCompleted: (data) => {
      console.log("Account created successfully:", data);
      authenticateUser({
        variables: {
          username: formData.username, 
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
        username: <input 
          type="text" 
          name="username" 
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })} 
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
      <label>
        First Name: <input 
          type="text" 
          name="firstName" 
          value={formData.firstName}
          onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
        />
      </label>
      <label>
        Last Name: <input 
          type="text" 
          name="lastName" 
          value={formData.lastName}
          onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
        />
      </label>
      <button type="submit">Create Account</button>
    </form>
  )
}

export default CreateAccount
