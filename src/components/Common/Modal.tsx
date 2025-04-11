import { useEffect, useState } from 'react'
import '../../App.css'

function Modal({children, onClose}: {children: React.ReactNode, onClose: () => void}) {
  const [opacity, setOpacity] = useState(0)

  const TRANSITION_TIME = 100

  const handleClose = () => {
    setOpacity(0)
    setTimeout(() => {
      onClose()
    }, TRANSITION_TIME)
  }

  useEffect(() => {
    setOpacity(1)
  }, [])

  return ( 
    <div className='modal-backdrop-container' style={{transition:`opacity ${TRANSITION_TIME}ms ease-in`,opacity:opacity}} >
      <div className='modal-card' style={{transition:`opacity ${TRANSITION_TIME}ms ease-in`,opacity:opacity}} >
        <button className='modal-button-close' onClick={handleClose}>close</button>
        {children}
      </div>
    </div>
  )
}

export default Modal
