import { useState } from 'react'
import '../App.css'
import { useMutation } from '@apollo/client';
import { useAuth } from './auth/AuthProvider'
import { AUTH_USER } from '../apollo/queries/userQueries'

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setIsAuthenticated } = useAuth();


  const [authenticateUser, { data, loading, error }] = useMutation(AUTH_USER, {
    variables: {
      username: email,
      password: password,
    },
    onCompleted: (data) => {
      setPassword("");
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
          username: <input type="text" name="username" onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          password: <input type="password" name="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Login</button>

    </form>
  )
}

export default Login
