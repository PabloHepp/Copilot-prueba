export class KioskManager {
  private isKioskMode: boolean = false
  private preventedKeys: string[] = [
    'F11', 'F12', 'F5', 'F4',
    'Tab', 'Alt', 'Control', 'Meta',
    'Escape', 'Delete'
  ]

  constructor(enabled: boolean = true) {
    this.isKioskMode = enabled
  }

  enable(): void {
    this.isKioskMode = true
    
    // Activar pantalla completa
    this.enterFullscreen()
    
    // Prevenir navegación hacia atrás/adelante
    this.preventNavigation()
    
    // Bloquear atajos de teclado
    this.blockKeyboardShortcuts()
    
    // Bloquear menú contextual
    this.blockContextMenu()
    
    // Prevenir zoom
    this.preventZoom()
    
    // Mantener foco en la ventana
    this.maintainFocus()
    
    // Ocultar cursor después de inactividad
    this.manageCursor()

    console.log('Modo kiosco activado')
  }

  disable(): void {
    this.isKioskMode = false
    
    // Remover event listeners
    this.removeEventListeners()
    
    // Salir de pantalla completa
    this.exitFullscreen()
    
    // Mostrar cursor
    document.body.style.cursor = 'default'
    
    console.log('Modo kiosco desactivado')
  }

  private enterFullscreen(): void {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen()
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen()
      }
    } catch (error) {
      console.warn('No se pudo activar pantalla completa:', error)
    }
  }

  private exitFullscreen(): void {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
    } catch (error) {
      console.warn('No se pudo salir de pantalla completa:', error)
    }
  }

  private preventNavigation(): void {
    // Prevenir navegación hacia atrás
    history.pushState(null, '', location.href)
    
    window.addEventListener('popstate', () => {
      if (this.isKioskMode) {
        history.pushState(null, '', location.href)
      }
    })
  }

  private blockKeyboardShortcuts(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isKioskMode) return

    const key = event.key
    
    // Bloquear teclas específicas
    if (this.preventedKeys.includes(key)) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    
    // Bloquear combinaciones peligrosas
    if (
      (event.ctrlKey && (key === 'u' || key === 'U')) || // Ver código fuente
      (event.ctrlKey && (key === 'i' || key === 'I')) || // DevTools
      (event.ctrlKey && (key === 'j' || key === 'J')) || // DevTools
      (event.ctrlKey && (key === 'k' || key === 'K')) || // DevTools
      (event.ctrlKey && (key === 's' || key === 'S')) || // Guardar
      (event.ctrlKey && (key === 'p' || key === 'P')) || // Imprimir
      (event.ctrlKey && (key === 'n' || key === 'N')) || // Nueva ventana
      (event.ctrlKey && (key === 't' || key === 'T')) || // Nueva pestaña
      (event.ctrlKey && (key === 'w' || key === 'W')) || // Cerrar pestaña
      (event.ctrlKey && event.shiftKey && (key === 'i' || key === 'I')) || // DevTools
      (event.ctrlKey && event.shiftKey && (key === 'j' || key === 'J')) || // DevTools
      (event.ctrlKey && event.shiftKey && (key === 'c' || key === 'C')) || // DevTools
      (event.altKey && key === 'F4') || // Cerrar aplicación
      (event.altKey && key === 'Tab') // Cambiar aplicación
    ) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isKioskMode) return
    
    // Prevenir acciones en keyup también
    if (this.preventedKeys.includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  private blockContextMenu(): void {
    document.addEventListener('contextmenu', (event) => {
      if (this.isKioskMode) {
        event.preventDefault()
        return false
      }
    })
  }

  private preventZoom(): void {
    // Prevenir zoom con rueda del mouse
    document.addEventListener('wheel', (event) => {
      if (this.isKioskMode && event.ctrlKey) {
        event.preventDefault()
      }
    }, { passive: false })

    // Prevenir zoom táctil
    document.addEventListener('touchmove', (event) => {
      if (this.isKioskMode && event.touches.length > 1) {
        event.preventDefault()
      }
    }, { passive: false })
  }

  private maintainFocus(): void {
    // Mantener foco en la ventana
    window.addEventListener('blur', () => {
      if (this.isKioskMode) {
        setTimeout(() => {
          window.focus()
        }, 100)
      }
    })

    // Detectar cuando se sale de pantalla completa
    document.addEventListener('fullscreenchange', () => {
      if (this.isKioskMode && !document.fullscreenElement) {
        // Intentar volver a pantalla completa
        setTimeout(() => {
          this.enterFullscreen()
        }, 1000)
      }
    })
  }

  private manageCursor(): void {
    let cursorTimeout: number
    
    const hideCursor = () => {
      if (this.isKioskMode) {
        document.body.style.cursor = 'none'
      }
    }

    const showCursor = () => {
      if (this.isKioskMode) {
        document.body.style.cursor = 'default'
        
        clearTimeout(cursorTimeout)
        cursorTimeout = window.setTimeout(hideCursor, 3000) // Ocultar después de 3 segundos
      }
    }

    document.addEventListener('mousemove', showCursor)
    document.addEventListener('mousedown', showCursor)
    
    // Ocultar cursor inicialmente
    setTimeout(hideCursor, 3000)
  }

  private removeEventListeners(): void {
    // Esta función se puede expandir para remover listeners específicos
    // Por simplicidad, se recarga la página al salir del modo kiosco
  }

  // Método para verificar si está en modo kiosco
  isEnabled(): boolean {
    return this.isKioskMode
  }

  // Método para obtener estadísticas del modo kiosco
  getStatus(): { enabled: boolean; fullscreen: boolean } {
    return {
      enabled: this.isKioskMode,
      fullscreen: !!document.fullscreenElement
    }
  }
}
