import { useState } from 'react'
import '../App.css'
import { gql, useMutation } from '@apollo/client';
import { useAuth } from './auth/AuthProvider'
import { AUTH_USER, CREATE_USER } from '../apollo/queries/userQueries'

function CreateAccount() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setIsAuthenticated } = useAuth();

  const [authenticateUser] = useMutation(AUTH_USER, {
    onCompleted: (data) => {
      setPassword("")
      localStorage.setItem('authToken', data.tokenAuth.token)
      setIsAuthenticated(true)
    },
    onError: (error) => {
      setPassword("");
      console.error("Authentication error after signup:", error)
      // temp handling
      alert("Account created but couldn't log in automatically. Please try logging in manually.")
    }
  });

  const [createAccount, { data, loading, error }] = useMutation(CREATE_USER, {
    variables: {
      email: email,
      password: password,
      username: username,
    },
    onCompleted: (data) => {
      console.log("Account created successfully:", data);
        authenticateUser({
          variables: {
            username: username, 
            password: password,
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
          email: <input type="text" name="email" onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          password: <input type="password" name="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <label>
          username: <input type="text" name="username" onChange={e => setUsername(e.target.value)} />
        </label>
        <button type="submit">Create Account</button>

    </form>
  )
}

export default CreateAccount
