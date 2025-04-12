import { useState } from 'react'
import { createPortal } from 'react-dom'
import Modal from '../modal/Modal'
import CreateAccount from '../CreateAccount'
import Login from '../Login'
import { useAuth } from '../../hooks/useAuth'
import { logo, nav, navItemsList } from './NavBar.css'
import Button from '../button/Button'
import demoSvg from '../../assets/demoooooooooooooooo.svg'
import { Link } from 'react-router'

function NavBar() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const me = useAuth()

  return ( 
    <>
      <nav className={nav}>
        <Link to="/" className={logo}><img src={demoSvg} alt="Demo" /></Link>
        <ul className={navItemsList}>
          {me.isAuthenticated ?
          <>
            <li>{me.user?.username}</li>
            <li><Button variant='primary' onClick={me.logout}>Logout</Button></li>
          </>
        :
          <>
            <li><Button variant='primary' onClick={() => setShowLoginModal(true)}>explore</Button></li>
            <li><Button variant='primary' onClick={() => setShowLoginModal(true)}>log in</Button></li>
            <li><Button variant='primary' onClick={() => setShowSignUpModal(true)}>join</Button></li>
          </>
        }
        </ul>
      </nav>
      {showLoginModal && createPortal(
       <Modal title='Log in' onClose={() => setShowLoginModal(false)}>
        <Login onSuccess={() => setShowLoginModal(false)}/>
       </Modal>,
        document.body
      )}
      {showSignUpModal && createPortal(
       <Modal title='Join demooo' onClose={() => setShowSignUpModal(false)}>
        <CreateAccount onSuccess={() => setShowSignUpModal(false)}/>
       </Modal>,
        document.body
      )}
    </>
  )
}

export default NavBar
