import { useEffect, useState } from 'react'
import { XCircle } from '@phosphor-icons/react'
import Button from '../button/Button'
import { modalBackdropContainer, modalButtonClose, modalCard } from './Modal.css'

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
    <div className={modalBackdropContainer} style={{transition:`opacity ${TRANSITION_TIME}ms ease-in`,opacity:opacity}} >
      <div className={modalCard} style={{transition:`opacity ${TRANSITION_TIME}ms ease-in`,opacity:opacity}} >
        <Button type='button' className={modalButtonClose} onClick={handleClose}><XCircle color='#000000' weight='fill' /></Button>
        {children}
      </div>
    </div>
  )
}

export default Modal
