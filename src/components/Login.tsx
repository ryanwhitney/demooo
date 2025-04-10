import { useState } from 'react'
import '../App.css'
import { gql, useMutation } from '@apollo/client';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const AUTH_USER = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      payload
      refreshExpiresIn
    }
  }
    `

  const [authenticateUser, { data, loading, error }] = useMutation(AUTH_USER, {
    variables: {
      username: email,
      password: password,
    },
    onCompleted: (data) => {
      localStorage.setItem('authToken', data.tokenAuth.token)
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
          email: <input type="text" name="email" onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          password: <input type="password" name="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Create Account</button>

    </form>
  )
}

export default Login
