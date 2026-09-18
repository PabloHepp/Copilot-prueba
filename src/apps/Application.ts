export abstract class Application {
  protected container: HTMLElement | null = null
  protected isRunning: boolean = false

  constructor() {}

  // Método abstracto que debe implementar cada aplicación
  abstract init(container: HTMLElement): void

  // Método para limpiar recursos cuando se cierra la aplicación
  close(): void {
    this.isRunning = false
    if (this.container) {
      this.container.innerHTML = ''
    }
  }

  // Método para verificar si la aplicación está ejecutándose
  isActive(): boolean {
    return this.isRunning
  }

  // Método helper para crear elementos HTML
  protected createElement(tag: string, className?: string, content?: string): HTMLElement {
    const element = document.createElement(tag)
    if (className) {
      element.className = className
    }
    if (content) {
      element.innerHTML = content
    }
    return element
  }

  // Método helper para reproducir sonidos de éxito
  protected playSuccessSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Melodía de éxito
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } catch (error) {
      console.log('No se pudo reproducir el sonido de éxito')
    }
  }

  // Método helper para reproducir sonidos de error
  protected playErrorSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Sonido de error
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3)
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('No se pudo reproducir el sonido de error')
    }
  }

  // Método helper para mostrar efectos visuales de éxito
  protected showSuccessEffect(element: HTMLElement): void {
    element.style.animation = 'none'
    element.offsetHeight // Trigger reflow
    element.style.animation = 'successPulse 0.6s ease'
    
    setTimeout(() => {
      element.style.animation = ''
    }, 600)
  }

  // Método helper para mostrar efectos visuales de error
  protected showErrorEffect(element: HTMLElement): void {
    element.style.animation = 'none'
    element.offsetHeight // Trigger reflow
    element.style.animation = 'errorShake 0.6s ease'
    
    setTimeout(() => {
      element.style.animation = ''
    }, 600)
  }

  // Método helper para generar números aleatorios
  protected getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Método helper para mezclar arrays (Fisher-Yates shuffle)
  protected shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Método helper para crear botones con estilos consistentes
  protected createButton(text: string, onClick: () => void, className: string = 'game-button'): HTMLElement {
    const button = this.createElement('button', className, text)
    button.addEventListener('click', onClick)
    return button
  }
}
