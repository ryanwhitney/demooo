import { useState } from 'react'
import '../App.css'
import { gql, useMutation } from '@apollo/client';

function CreateAccount() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      user {
        id
        username
        email
      }
    }
  }
    `

  const [createAccount, { data, loading, error }] = useMutation(CREATE_USER, {
    variables: {
      email: email,
      password: password,
      username: username,
    },
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
