import { useState } from 'react'
import '../App.css'
import { createPortal } from 'react-dom'
import Modal from './Common/Modal'

function NavBar() {

  const [showLoginModal, setShowLoginModal] = useState(false)

  return ( 
    <>
      <nav>
        <div className='logo'>demooooooo</div>
        <ul>
          <li><button onClick={() => setShowLoginModal(true)}>Log in</button></li>
          <li><button>Sign up</button></li>
        </ul>
      </nav>
      {showLoginModal && createPortal(
       <Modal onClose={() => setShowLoginModal(false)}>
        <p>aw shucks</p>
       </Modal>,
        document.body
      )}
    </>
  )
}

export default NavBar
