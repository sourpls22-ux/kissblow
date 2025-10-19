import { useEffect, useRef } from 'react'

/**
 * Универсальный хук для блокировки скролла фоновой страницы
 * Работает на всех устройствах и браузерах
 */
export const useScrollLock = (isLocked) => {
  const scrollPosition = useRef(0)

  useEffect(() => {
    if (isLocked) {
      // Сохраняем текущую позицию скролла
      scrollPosition.current = window.pageYOffset || document.documentElement.scrollTop
      
      // Блокируем скролл всеми возможными способами
      const body = document.body
      const html = document.documentElement
      
      // Основная блокировка
      body.style.position = 'fixed'
      body.style.top = `-${scrollPosition.current}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
      body.style.overflow = 'hidden'
      
      // Дополнительная блокировка для разных браузеров
      html.style.overflow = 'hidden'
      body.style.webkitOverflowScrolling = 'touch'
      
      // Добавляем класс для CSS
      body.classList.add('modal-open')
      
      // Обработчик для предотвращения скролла
      const preventScroll = (e) => {
        // Разрешаем скролл только внутри модального окна
        const modalContent = document.querySelector('[data-modal-content]')
        if (!modalContent || !modalContent.contains(e.target)) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      // Добавляем все возможные обработчики
      const events = ['touchmove', 'touchstart', 'touchend', 'wheel', 'scroll']
      events.forEach(event => {
        document.addEventListener(event, preventScroll, { passive: false })
      })
      
      return () => {
        // Восстанавливаем стили
        body.style.position = ''
        body.style.top = ''
        body.style.left = ''
        body.style.right = ''
        body.style.width = ''
        body.style.overflow = ''
        body.style.webkitOverflowScrolling = ''
        html.style.overflow = ''
        
        // Удаляем класс
        body.classList.remove('modal-open')
        
        // Удаляем обработчики
        events.forEach(event => {
          document.removeEventListener(event, preventScroll)
        })
        
        // Восстанавливаем позицию скролла
        window.scrollTo(0, scrollPosition.current)
      }
    }
  }, [isLocked])
}

/**
 * Хук для обработки скролла внутри модального окна
 * Использует CSS overscroll-behavior вместо JavaScript обработчиков
 */
export const useModalScroll = () => {
  // Убираем JavaScript обработчики, так как они вызывают ошибки passive event listener
  // Вместо этого используем CSS overscroll-behavior для предотвращения скролла фона
  return {
    handleModalScroll: undefined, // Убираем обработчик
    handleTouchScroll: undefined  // Убираем обработчик
  }
}
