import { useRef, useCallback } from 'react'

/**
 * Хук для правильного поведения модального окна при клике на backdrop
 * Закрывает модальное окно только если и mousedown, и mouseup произошли за пределами модального окна
 */
export const useModalBackdrop = (onClose) => {
  const mouseDownRef = useRef(null)
  const modalRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    // Запоминаем, где произошел mousedown
    mouseDownRef.current = e.target
  }, [])

  const handleMouseUp = useCallback((e) => {
    // Проверяем, что и mousedown, и mouseup произошли за пределами модального окна
    if (mouseDownRef.current === e.target && 
        mouseDownRef.current === e.currentTarget &&
        e.target === e.currentTarget) {
      onClose()
    }
    // Сбрасываем ссылку
    mouseDownRef.current = null
  }, [onClose])

  const handleClick = useCallback((e) => {
    // Предотвращаем закрытие при обычном клике, если mousedown был внутри модального окна
    if (mouseDownRef.current && mouseDownRef.current !== e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return {
    modalRef,
    handleMouseDown,
    handleMouseUp,
    handleClick
  }
}
