import { useState } from 'react'
import '../App.css'
import { createPortal } from 'react-dom'
import Modal from './Common/Modal'
import CreateAccount from './CreateAccount'

function NavBar() {

  const [showSignUpModal, setShowSignUpModal] = useState(false)

  return ( 
    <>
      <nav>
        <div className='logo'>demooooooo</div>
        <ul>
          <li><button>Log in</button></li>
          <li><button onClick={() => setShowSignUpModal(true)}>Sign up</button></li>
        </ul>
      </nav>
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
