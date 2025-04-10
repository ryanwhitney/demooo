import '../../App.css'

function Modal({children, onClose}: {children: React.ReactNode, onClose: () => void}) {
  return ( 
    <div className='modal-backdrop-container' onClick={onClose}>
      <div className='modal-card'>
        <button onClick={onClose}>close</button>
        {children}
      </div>
    </div>
  )
}

export default Modal
