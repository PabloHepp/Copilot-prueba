import './style.css'
import { DesktopEnvironment } from './desktop/DesktopEnvironment'
import { KioskManager } from './kiosk/KioskManager'

// Configuración del sistema
const config = {
  kioskMode: true,
  theme: 'infantil',
  difficulty: 'facil', // facil, medio, dificil
  language: 'es'
}

class SistemaEducativo {
  private desktop: DesktopEnvironment
  private kioskManager: KioskManager

  constructor() {
    this.kioskManager = new KioskManager(config.kioskMode)
    this.desktop = new DesktopEnvironment(config)
    this.init()
  }

  private init() {
    // Activar modo kiosco si está habilitado
    if (config.kioskMode) {
      this.kioskManager.enable()
    }

    // Inicializar el entorno de escritorio
    this.desktop.render()

    // Event listeners para salida de emergencia (solo para administradores)
    this.setupEmergencyExit()
  }

  private setupEmergencyExit() {
    let sequence = ''
    const exitCode = 'SALIR123'
    
    document.addEventListener('keydown', (e) => {
      sequence += e.key.toUpperCase()
      
      // Mantener solo los últimos 8 caracteres
      if (sequence.length > exitCode.length) {
        sequence = sequence.slice(-exitCode.length)
      }
      
      // Si se ingresa el código de salida, desactivar modo kiosco
      if (sequence === exitCode) {
        this.kioskManager.disable()
        alert('Modo kiosco desactivado. Presiona F11 para salir de pantalla completa.')
        sequence = ''
      }
    })
  }
}

// Inicializar el sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  new SistemaEducativo()
})

// Manejar visibilidad de la página (importante para modo kiosco)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && config.kioskMode) {
    // Si la página se oculta en modo kiosco, intentar volver al foco
    setTimeout(() => {
      window.focus()
    }, 100)
  }
})
