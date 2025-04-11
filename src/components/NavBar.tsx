import { useState } from 'react'
import '../App.css'
import { createPortal } from 'react-dom'
import Modal from './common/Modal'
import CreateAccount from './CreateAccount'
import Login from './Login'
import { useAuth } from './auth/AuthProvider'

function NavBar() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const me = useAuth()

  return ( 
    <>
      <nav>
        <div className='logo'>demooooooo</div>
        <ul>
          {me.isAuthenticated ?
          <>
            <li>{me.user?.username}</li>
            <li><button onClick={me.logout}>Logout</button></li>
          </>
        :
          <>
            <li><button onClick={() => setShowLoginModal(true)}>Log in</button></li>
            <li><button onClick={() => setShowSignUpModal(true)}>Sign up</button></li>
          </>
        }
        </ul>
      </nav>
      {showLoginModal && createPortal(
       <Modal onClose={() => setShowLoginModal(false)}>
        <Login/>
       </Modal>,
        document.body
      )}
      {showSignUpModal && createPortal(
       <Modal onClose={() => setShowSignUpModal(false)}>
        <CreateAccount/>
       </Modal>,
        document.body
      )}
    </>
  )
}

export default NavBar
