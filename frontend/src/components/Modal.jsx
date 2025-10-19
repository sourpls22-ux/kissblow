import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useScrollLock, useModalScroll } from '../hooks/useScrollLock'

const Modal = ({ isOpen, onClose, children, title, buttonRef }) => {
  const modalRef = useRef(null)

  // Хуки для блокировки скролла
  useScrollLock(isOpen)
  const { handleModalScroll, handleTouchScroll } = useModalScroll()

  // Модальное окно всегда по центру экрана
  // Убираем сложную логику позиционирования

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && 
          buttonRef?.current && !buttonRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in slide-in-from-top-2 duration-200 modal-content"
        data-modal-content
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
