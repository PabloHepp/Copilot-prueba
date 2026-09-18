import { Application } from '../apps/Application'
import { MathApp } from '../apps/MathApp'
import { LettersApp } from '../apps/LettersApp'
import { ColorsApp } from '../apps/ColorsApp'
import { ShapesApp } from '../apps/ShapesApp'
import { MusicApp } from '../apps/MusicApp'
import { PuzzleApp } from '../apps/PuzzleApp'
import { AdminApp } from '../apps/AdminApp'

interface DesktopConfig {
  kioskMode: boolean
  theme: string
  difficulty: string
  language: string
}

interface AppData {
  id: string
  name: string
  icon: string
  className: string
  app: new () => Application
  color: string
}

export class DesktopEnvironment {
  private container: HTMLElement
  private currentApp: Application | null = null
  private apps: AppData[] = []

  constructor(private config: DesktopConfig) {
    this.container = document.getElementById('app')!
    this.initializeApps()
  }

  private initializeApps(): void {
    this.apps = [
      {
        id: 'math',
        name: 'Matemáticas',
        icon: '🔢',
        className: 'math',
        app: MathApp,
        color: '#FF6B6B'
      },
      {
        id: 'letters',
        name: 'Letras',
        icon: '🔤',
        className: 'letters',
        app: LettersApp,
        color: '#4ECDC4'
      },
      {
        id: 'colors',
        name: 'Colores',
        icon: '🎨',
        className: 'colors',
        app: ColorsApp,
        color: '#FECA57'
      },
      {
        id: 'shapes',
        name: 'Formas',
        icon: '🔷',
        className: 'shapes',
        app: ShapesApp,
        color: '#96CEB4'
      },
      {
        id: 'music',
        name: 'Música',
        icon: '🎵',
        className: 'music',
        app: MusicApp,
        color: '#E17055'
      },
      {
        id: 'puzzle',
        name: 'Rompecabezas',
        icon: '🧩',
        className: 'puzzle',
        app: PuzzleApp,
        color: '#A29BFE'
      }
    ]

    // Agregar aplicación de administración solo si no está en modo kiosco
    if (!this.config.kioskMode) {
      this.apps.push({
        id: 'admin',
        name: 'Administración',
        icon: '⚙️',
        className: 'admin',
        app: AdminApp,
        color: '#636E72'
      })
    }
  }

  render(): void {
    this.container.innerHTML = ''
    
    // Crear barra superior
    const topBar = this.createTopBar()
    this.container.appendChild(topBar)
    
    // Crear área del escritorio
    const desktop = this.createDesktop()
    this.container.appendChild(desktop)
  }

  private createTopBar(): HTMLElement {
    const topBar = document.createElement('div')
    topBar.className = 'top-bar'
    
    // Logo y título
    const logo = document.createElement('div')
    logo.className = 'logo'
    logo.innerHTML = `
      <span>🏫</span>
      <span>Sistema Educativo Infantil</span>
    `
    
    // Información del usuario y reloj
    const userInfo = document.createElement('div')
    userInfo.className = 'user-info'
    
    const timeDisplay = document.createElement('div')
    timeDisplay.className = 'time-display'
    this.updateTime(timeDisplay)
    
    // Actualizar tiempo cada minuto
    setInterval(() => this.updateTime(timeDisplay), 60000)
    
    userInfo.appendChild(timeDisplay)
    
    topBar.appendChild(logo)
    topBar.appendChild(userInfo)
    
    return topBar
  }

  private createDesktop(): HTMLElement {
    const desktop = document.createElement('div')
    desktop.className = 'desktop'
    
    this.apps.forEach((appData, index) => {
      const appIcon = this.createAppIcon(appData, index)
      desktop.appendChild(appIcon)
    })
    
    return desktop
  }

  private createAppIcon(appData: AppData, index: number): HTMLElement {
    const icon = document.createElement('div')
    icon.className = `app-icon ${appData.className}`
    icon.style.animationDelay = `${index * 0.1}s`
    
    icon.innerHTML = `
      <div class="icon">${appData.icon}</div>
      <div class="label">${appData.name}</div>
    `
    
    icon.addEventListener('click', () => {
      this.launchApp(appData)
    })
    
    // Efectos de sonido (opcional)
    icon.addEventListener('mouseenter', () => {
      this.playHoverSound()
    })
    
    return icon
  }

  private launchApp(appData: AppData): void {
    // Reproducir sonido de clic
    this.playClickSound()
    
    // Cerrar aplicación actual si existe
    if (this.currentApp) {
      this.currentApp.close()
    }
    
    // Crear nueva instancia de la aplicación
    this.currentApp = new appData.app()
    
    // Crear modal para la aplicación
    const modal = this.createModal()
    const modalContent = modal.querySelector('.modal-content')!
    
    // Inicializar la aplicación en el modal
    this.currentApp.init(modalContent as HTMLElement)
    
    // Mostrar modal
    document.body.appendChild(modal)
    setTimeout(() => modal.classList.add('active'), 10)
    
    // Configurar cierre del modal
    const closeBtn = modal.querySelector('.modal-close')!
    closeBtn.addEventListener('click', () => {
      this.closeCurrentApp(modal)
    })
    
    // Cerrar con Escape (solo si no está en modo kiosco)
    if (!this.config.kioskMode) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.closeCurrentApp(modal)
          document.removeEventListener('keydown', handleEscape)
        }
      }
      document.addEventListener('keydown', handleEscape)
    }
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div')
    modal.className = 'modal'
    
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">×</button>
        <div class="app-container"></div>
      </div>
    `
    
    return modal
  }

  private closeCurrentApp(modal: HTMLElement): void {
    if (this.currentApp) {
      this.currentApp.close()
      this.currentApp = null
    }
    
    modal.classList.remove('active')
    setTimeout(() => {
      document.body.removeChild(modal)
    }, 300)
  }

  private updateTime(element: HTMLElement): void {
    const now = new Date()
    const timeString = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
    element.textContent = timeString
  }

  private playHoverSound(): void {
    // Efecto de sonido simple con Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Silenciosamente fallar si no se puede reproducir audio
    }
  }

  private playClickSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Silenciosamente fallar si no se puede reproducir audio
    }
  }

  // Método público para obtener la configuración actual
  getConfig(): DesktopConfig {
    return { ...this.config }
  }

  // Método para actualizar la configuración
  updateConfig(newConfig: Partial<DesktopConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.render() // Re-renderizar con nueva configuración
  }
}
