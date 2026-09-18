import { Application } from './Application'

export class ShapesApp extends Application {
  private score: number = 0
  private shapes = [
    { name: 'CÍRCULO', emoji: '⭕', sides: 0 },
    { name: 'CUADRADO', emoji: '🟪', sides: 4 },
    { name: 'TRIÁNGULO', emoji: '🔺', sides: 3 },
    { name: 'RECTÁNGULO', emoji: '🟩', sides: 4 },
    { name: 'ESTRELLA', emoji: '⭐', sides: 5 },
    { name: 'CORAZÓN', emoji: '❤️', sides: 0 }
  ]

  init(container: HTMLElement): void {
    this.container = container
    this.isRunning = true
    this.score = 0
    this.render()
  }

  private render(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="shapes-app">
        <div class="app-header">
          <h2>🔷 ¡Aprende las Formas!</h2>
          <div class="score">Puntos: <span id="shapes-score">${this.score}</span></div>
        </div>
        <div class="game-area" id="shapes-game"></div>
      </div>
    `

    this.generateNewGame()
    this.addStyles()
  }

  private generateNewGame(): void {
    const gameContainer = document.getElementById('shapes-game')
    if (!gameContainer) return

    const targetShape = this.shapes[this.getRandomInt(0, this.shapes.length - 1)]
    const options = [targetShape]
    
    while (options.length < 4) {
      const wrongShape = this.shapes[this.getRandomInt(0, this.shapes.length - 1)]
      if (!options.some(s => s.name === wrongShape.name)) {
        options.push(wrongShape)
      }
    }

    const shuffledOptions = this.shuffleArray(options)

    gameContainer.innerHTML = `
      <div class="shape-game">
        <div class="instruction">
          <h3>¿Qué forma es esta?</h3>
        </div>
        
        <div class="shape-display">
          <div class="big-shape">
            ${targetShape.emoji}
          </div>
          <div class="shape-name">${targetShape.name}</div>
        </div>
        
        <div class="shape-options">
          ${shuffledOptions.map(shape => `
            <button class="shape-option" data-shape="${shape.name}">
              <span class="shape-emoji">${shape.emoji}</span>
              <span class="shape-label">${shape.name}</span>
            </button>
          `).join('')}
        </div>
        
        <div class="feedback" id="shapes-feedback"></div>
      </div>
    `

    const shapeOptions = gameContainer.querySelectorAll('.shape-option')
    shapeOptions.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement
        const selectedShape = target.dataset.shape || ''
        this.checkAnswer(selectedShape, target, targetShape.name)
      })
    })
  }

  private checkAnswer(selectedShape: string, buttonElement: HTMLElement, correctShape: string): void {
    const feedbackElement = document.getElementById('shapes-feedback')
    const shapeOptions = document.querySelectorAll('.shape-option')
    
    shapeOptions.forEach(btn => {
      (btn as HTMLElement).style.pointerEvents = 'none'
    })

    if (selectedShape === correctShape) {
      this.score += 10
      this.updateScore()
      buttonElement.classList.add('correct')
      this.showSuccessEffect(buttonElement)
      this.playSuccessSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="success-message">
            <span class="emoji">🎉</span>
            <span>¡Excelente! Es un ${correctShape}</span>
          </div>
        `
      }
    } else {
      buttonElement.classList.add('incorrect')
      this.showErrorEffect(buttonElement)
      this.playErrorSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="error-message">
            <span class="emoji">🤔</span>
            <span>¡Inténtalo de nuevo! Era un ${correctShape}</span>
          </div>
        `
      }
    }

    setTimeout(() => {
      this.generateNewGame()
    }, 2000)
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('shapes-score')
    if (scoreElement) {
      scoreElement.textContent = this.score.toString()
    }
  }

  private addStyles(): void {
    if (!document.getElementById('shapes-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'shapes-app-styles'
      styles.textContent = `
        .shapes-app {
          padding: 20px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .shapes-app h2 {
          color: #96CEB4;
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        .shape-display {
          margin: 30px 0;
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          display: inline-block;
        }
        
        .big-shape {
          font-size: 8em;
          margin-bottom: 15px;
        }
        
        .shape-name {
          font-size: 1.5em;
          font-weight: bold;
          color: #2C3E50;
        }
        
        .shape-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          max-width: 500px;
          margin: 30px auto;
        }
        
        .shape-option {
          padding: 20px;
          border: 3px solid #96CEB4;
          background: white;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .shape-emoji {
          font-size: 3em;
        }
        
        .shape-label {
          font-size: 1em;
          font-weight: bold;
          color: #2C3E50;
        }
        
        .shape-option:hover {
          background: #96CEB4;
          color: white;
          transform: scale(1.05);
        }
        
        .shape-option.correct {
          background: #96CEB4 !important;
          border-color: #96CEB4 !important;
          color: white !important;
        }
        
        .shape-option.incorrect {
          background: #FF6B6B !important;
          border-color: #FF6B6B !important;
          color: white !important;
        }
      `
      document.head.appendChild(styles)
    }
  }
}
