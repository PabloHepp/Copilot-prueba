import { Application } from './Application'

interface MathProblem {
  question: string
  answer: number
  options: number[]
}

export class MathApp extends Application {
  private score: number = 0
  private currentProblem: MathProblem | null = null
  private difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  private gameContainer: HTMLElement | null = null

  init(container: HTMLElement): void {
    this.container = container
    this.isRunning = true
    this.score = 0
    
    this.render()
  }

  private render(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="math-app">
        <div class="app-header">
          <h2>🔢 ¡Aprende Matemáticas!</h2>
          <div class="score">Puntos: <span id="math-score">${this.score}</span></div>
        </div>
        
        <div class="difficulty-selector">
          <h3>Elige el nivel:</h3>
          <div class="difficulty-buttons">
            <button class="difficulty-btn active" data-level="easy">Fácil (1-10)</button>
            <button class="difficulty-btn" data-level="medium">Medio (1-20)</button>
            <button class="difficulty-btn" data-level="hard">Difícil (1-50)</button>
          </div>
        </div>
        
        <div class="game-area" id="math-game">
          <!-- El juego se renderiza aquí -->
        </div>
      </div>
    `

    this.gameContainer = this.container.querySelector('#math-game')
    this.setupEventListeners()
    this.generateNewProblem()
    this.addStyles()
  }

  private setupEventListeners(): void {
    const difficultyButtons = this.container?.querySelectorAll('.difficulty-btn')
    difficultyButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const level = target.dataset.level as 'easy' | 'medium' | 'hard'
        
        // Actualizar botón activo
        difficultyButtons.forEach(btn => btn.classList.remove('active'))
        target.classList.add('active')
        
        this.difficulty = level
        this.generateNewProblem()
      })
    })
  }

  private generateNewProblem(): void {
    if (!this.gameContainer) return

    const { min, max } = this.getDifficultyRange()
    
    // Generar números aleatorios
    const num1 = this.getRandomInt(min, max)
    const num2 = this.getRandomInt(min, Math.min(max, num1)) // Para que la resta no sea negativa
    
    // Elegir operación aleatoria
    const operations = ['+', '-']
    if (this.difficulty !== 'easy') {
      operations.push('×')
    }
    
    const operation = operations[this.getRandomInt(0, operations.length - 1)]
    
    let answer: number
    let question: string
    
    switch (operation) {
      case '+':
        answer = num1 + num2
        question = `${num1} + ${num2} = ?`
        break
      case '-':
        answer = num1 - num2
        question = `${num1} - ${num2} = ?`
        break
      case '×':
        answer = num1 * num2
        question = `${num1} × ${num2} = ?`
        break
      default:
        answer = num1 + num2
        question = `${num1} + ${num2} = ?`
    }
    
    // Generar opciones de respuesta
    const options = this.generateAnswerOptions(answer)
    
    this.currentProblem = { question, answer, options }
    this.renderProblem()
  }

  private getDifficultyRange(): { min: number, max: number } {
    switch (this.difficulty) {
      case 'easy':
        return { min: 1, max: 10 }
      case 'medium':
        return { min: 1, max: 20 }
      case 'hard':
        return { min: 1, max: 50 }
      default:
        return { min: 1, max: 10 }
    }
  }

  private generateAnswerOptions(correctAnswer: number): number[] {
    const options = [correctAnswer]
    const range = Math.max(5, Math.floor(correctAnswer * 0.3))
    
    while (options.length < 4) {
      const wrongAnswer = correctAnswer + this.getRandomInt(-range, range)
      if (wrongAnswer >= 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer)
      }
    }
    
    return this.shuffleArray(options)
  }

  private renderProblem(): void {
    if (!this.gameContainer || !this.currentProblem) return

    this.gameContainer.innerHTML = `
      <div class="problem-container">
        <div class="question">
          <h3>${this.currentProblem.question}</h3>
        </div>
        
        <div class="answer-options">
          ${this.currentProblem.options.map(option => `
            <button class="answer-option" data-answer="${option}">
              ${option}
            </button>
          `).join('')}
        </div>
        
        <div class="feedback" id="math-feedback"></div>
      </div>
    `

    // Agregar event listeners a las opciones
    const answerButtons = this.gameContainer.querySelectorAll('.answer-option')
    answerButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const selectedAnswer = parseInt(target.dataset.answer || '0')
        this.checkAnswer(selectedAnswer, target)
      })
    })
  }

  private checkAnswer(selectedAnswer: number, buttonElement: HTMLElement): void {
    if (!this.currentProblem) return

    const feedbackElement = document.getElementById('math-feedback')
    const answerButtons = this.gameContainer?.querySelectorAll('.answer-option')
    
    // Deshabilitar todos los botones
    answerButtons?.forEach(btn => {
      (btn as HTMLElement).style.pointerEvents = 'none'
    })

    if (selectedAnswer === this.currentProblem.answer) {
      // Respuesta correcta
      this.score += 10
      this.updateScore()
      
      buttonElement.classList.add('correct')
      this.showSuccessEffect(buttonElement)
      this.playSuccessSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="success-message">
            <span class="emoji">🎉</span>
            <span>¡Excelente! La respuesta es ${selectedAnswer}</span>
          </div>
        `
      }
    } else {
      // Respuesta incorrecta
      buttonElement.classList.add('incorrect')
      this.showErrorEffect(buttonElement)
      this.playErrorSound()
      
      // Mostrar la respuesta correcta
      answerButtons?.forEach(btn => {
        const btnAnswer = parseInt((btn as HTMLElement).dataset.answer || '0')
        if (btnAnswer === this.currentProblem!.answer) {
          btn.classList.add('correct')
        }
      })
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="error-message">
            <span class="emoji">🤔</span>
            <span>¡Inténtalo de nuevo! La respuesta correcta es ${this.currentProblem.answer}</span>
          </div>
        `
      }
    }

    // Generar nuevo problema después de 2 segundos
    setTimeout(() => {
      this.generateNewProblem()
    }, 2000)
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('math-score')
    if (scoreElement) {
      scoreElement.textContent = this.score.toString()
    }
  }

  private addStyles(): void {
    if (!document.getElementById('math-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'math-app-styles'
      styles.textContent = `
        .math-app {
          padding: 20px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .app-header {
          margin-bottom: 30px;
        }
        
        .app-header h2 {
          color: #FF6B6B;
          margin-bottom: 10px;
          font-size: 2em;
        }
        
        .score {
          font-size: 1.2em;
          font-weight: bold;
          color: #4ECDC4;
        }
        
        .difficulty-selector {
          margin-bottom: 30px;
        }
        
        .difficulty-selector h3 {
          margin-bottom: 15px;
          color: #2C3E50;
        }
        
        .difficulty-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .difficulty-btn {
          padding: 10px 20px;
          border: 3px solid #ddd;
          background: white;
          border-radius: 10px;
          font-size: 1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .difficulty-btn.active {
          background: #FF6B6B;
          color: white;
          border-color: #FF6B6B;
        }
        
        .difficulty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .problem-container {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .question h3 {
          font-size: 2.5em;
          color: #2C3E50;
          margin-bottom: 30px;
        }
        
        .answer-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .answer-option {
          padding: 20px;
          font-size: 1.5em;
          border: 3px solid #4ECDC4;
          background: white;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .answer-option:hover {
          background: #4ECDC4;
          color: white;
          transform: scale(1.05);
        }
        
        .answer-option.correct {
          background: #96CEB4 !important;
          border-color: #96CEB4 !important;
          color: white !important;
        }
        
        .answer-option.incorrect {
          background: #FF6B6B !important;
          border-color: #FF6B6B !important;
          color: white !important;
        }
        
        .feedback {
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .success-message, .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.2em;
          font-weight: bold;
        }
        
        .success-message {
          color: #96CEB4;
        }
        
        .error-message {
          color: #FF6B6B;
        }
        
        .emoji {
          font-size: 1.5em;
        }
        
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @media (max-width: 600px) {
          .question h3 {
            font-size: 2em;
          }
          
          .answer-option {
            font-size: 1.2em;
            padding: 15px;
            min-height: 60px;
          }
          
          .difficulty-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `
      document.head.appendChild(styles)
    }
  }
}
