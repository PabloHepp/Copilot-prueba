import { Application } from './Application'

export class ColorsApp extends Application {
  private score: number = 0
  private colors = [
    { name: 'ROJO', hex: '#FF6B6B', emoji: '🔴' },
    { name: 'AZUL', hex: '#45B7D1', emoji: '🔵' },
    { name: 'VERDE', hex: '#96CEB4', emoji: '🟢' },
    { name: 'AMARILLO', hex: '#FECA57', emoji: '🟡' },
    { name: 'MORADO', hex: '#A29BFE', emoji: '🟣' },
    { name: 'NARANJA', hex: '#E17055', emoji: '🟠' }
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
      <div class="colors-app">
        <div class="app-header">
          <h2>🎨 ¡Aprende los Colores!</h2>
          <div class="score">Puntos: <span id="colors-score">${this.score}</span></div>
        </div>
        <div class="game-area" id="colors-game"></div>
      </div>
    `

    this.generateNewGame()
    this.addStyles()
  }

  private generateNewGame(): void {
    const gameContainer = document.getElementById('colors-game')
    if (!gameContainer) return

    const targetColor = this.colors[this.getRandomInt(0, this.colors.length - 1)]
    const options = [targetColor]
    
    while (options.length < 4) {
      const wrongColor = this.colors[this.getRandomInt(0, this.colors.length - 1)]
      if (!options.some(c => c.name === wrongColor.name)) {
        options.push(wrongColor)
      }
    }

    const shuffledOptions = this.shuffleArray(options)

    gameContainer.innerHTML = `
      <div class="color-game">
        <div class="instruction">
          <h3>¿De qué color es este objeto?</h3>
        </div>
        
        <div class="color-display">
          <div class="color-circle" style="background: ${targetColor.hex}">
            <span class="color-emoji">${targetColor.emoji}</span>
          </div>
        </div>
        
        <div class="color-options">
          ${shuffledOptions.map(color => `
            <button class="color-option" data-color="${color.name}" style="background: ${color.hex}">
              ${color.name}
            </button>
          `).join('')}
        </div>
        
        <div class="feedback" id="colors-feedback"></div>
      </div>
    `

    const colorOptions = gameContainer.querySelectorAll('.color-option')
    colorOptions.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const selectedColor = target.dataset.color || ''
        this.checkAnswer(selectedColor, target, targetColor.name)
      })
    })
  }

  private checkAnswer(selectedColor: string, buttonElement: HTMLElement, correctColor: string): void {
    const feedbackElement = document.getElementById('colors-feedback')
    const colorOptions = document.querySelectorAll('.color-option')
    
    colorOptions.forEach(btn => {
      (btn as HTMLElement).style.pointerEvents = 'none'
    })

    if (selectedColor === correctColor) {
      this.score += 10
      this.updateScore()
      buttonElement.classList.add('correct')
      this.showSuccessEffect(buttonElement)
      this.playSuccessSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="success-message">
            <span class="emoji">🎉</span>
            <span>¡Perfecto! Es ${correctColor}</span>
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
            <span>¡Inténtalo de nuevo! Era ${correctColor}</span>
          </div>
        `
      }
    }

    setTimeout(() => {
      this.generateNewGame()
    }, 2000)
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('colors-score')
    if (scoreElement) {
      scoreElement.textContent = this.score.toString()
    }
  }

  private addStyles(): void {
    if (!document.getElementById('colors-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'colors-app-styles'
      styles.textContent = `
        .colors-app {
          padding: 20px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .colors-app h2 {
          color: #FECA57;
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        .color-display {
          margin: 30px 0;
        }
        
        .color-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          border: 5px solid white;
        }
        
        .color-emoji {
          font-size: 4em;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        }
        
        .color-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          max-width: 400px;
          margin: 30px auto;
        }
        
        .color-option {
          padding: 20px;
          font-size: 1.2em;
          font-weight: bold;
          color: white;
          border: 3px solid white;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        .color-option:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .color-option.correct {
          border-color: #96CEB4;
          box-shadow: 0 0 20px #96CEB4;
        }
        
        .color-option.incorrect {
          border-color: #FF6B6B;
          box-shadow: 0 0 20px #FF6B6B;
        }
      `
      document.head.appendChild(styles)
    }
  }
}
