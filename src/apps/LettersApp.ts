import { Application } from './Application'

interface LetterGame {
  type: 'identify' | 'match' | 'write'
  letter: string
  options?: string[]
  word?: string
}

export class LettersApp extends Application {
  private score: number = 0
  private currentGame: LetterGame | null = null
  private gameType: 'identify' | 'match' | 'write' = 'identify'
  private gameContainer: HTMLElement | null = null
  private alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  init(container: HTMLElement): void {
    this.container = container
    this.isRunning = true
    this.score = 0
    
    this.render()
  }

  private render(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="letters-app">
        <div class="app-header">
          <h2>🔤 ¡Aprende las Letras!</h2>
          <div class="score">Puntos: <span id="letters-score">${this.score}</span></div>
        </div>
        
        <div class="game-selector">
          <h3>Elige el juego:</h3>
          <div class="game-buttons">
            <button class="game-btn active" data-game="identify">Identificar Letras</button>
            <button class="game-btn" data-game="match">Unir Mayúsculas y Minúsculas</button>
            <button class="game-btn" data-game="write">Escribir Palabras</button>
          </div>
        </div>
        
        <div class="game-area" id="letters-game">
          <!-- El juego se renderiza aquí -->
        </div>
      </div>
    `

    this.gameContainer = this.container.querySelector('#letters-game')
    this.setupEventListeners()
    this.generateNewGame()
    this.addStyles()
  }

  private setupEventListeners(): void {
    const gameButtons = this.container?.querySelectorAll('.game-btn')
    gameButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const gameType = target.dataset.game as 'identify' | 'match' | 'write'
        
        // Actualizar botón activo
        gameButtons.forEach(btn => btn.classList.remove('active'))
        target.classList.add('active')
        
        this.gameType = gameType
        this.generateNewGame()
      })
    })
  }

  private generateNewGame(): void {
    switch (this.gameType) {
      case 'identify':
        this.generateIdentifyGame()
        break
      case 'match':
        this.generateMatchGame()
        break
      case 'write':
        this.generateWriteGame()
        break
    }
  }

  private generateIdentifyGame(): void {
    if (!this.gameContainer) return

    const letter = this.alphabet[this.getRandomInt(0, this.alphabet.length - 1)]
    const options = [letter]
    
    // Generar 3 opciones incorrectas
    while (options.length < 4) {
      const wrongLetter = this.alphabet[this.getRandomInt(0, this.alphabet.length - 1)]
      if (!options.includes(wrongLetter)) {
        options.push(wrongLetter)
      }
    }

    this.currentGame = {
      type: 'identify',
      letter,
      options: this.shuffleArray(options)
    }

    this.gameContainer.innerHTML = `
      <div class="identify-game">
        <div class="instruction">
          <h3>¿Cuál es la letra?</h3>
        </div>
        
        <div class="letter-display">
          <div class="big-letter">${letter}</div>
        </div>
        
        <div class="letter-options">
          ${this.currentGame.options?.map(option => `
            <button class="letter-option" data-letter="${option}">
              ${option}
            </button>
          `).join('') || ''}
        </div>
        
        <div class="feedback" id="letters-feedback"></div>
      </div>
    `

    this.setupIdentifyEventListeners()
  }

  private generateMatchGame(): void {
    if (!this.gameContainer) return

    const letter = this.alphabet[this.getRandomInt(0, this.alphabet.length - 1)]
    const pairs = [
      { upper: letter, lower: letter.toLowerCase() }
    ]

    // Generar más pares para mayor dificultad
    while (pairs.length < 3) {
      const randomLetter = this.alphabet[this.getRandomInt(0, this.alphabet.length - 1)]
      if (!pairs.some(p => p.upper === randomLetter)) {
        pairs.push({ upper: randomLetter, lower: randomLetter.toLowerCase() })
      }
    }

    this.currentGame = {
      type: 'match',
      letter
    }

    const shuffledPairs = this.shuffleArray(pairs)

    this.gameContainer.innerHTML = `
      <div class="match-game">
        <div class="instruction">
          <h3>Une las mayúsculas con las minúsculas</h3>
        </div>
        
        <div class="match-container">
          <div class="uppercase-letters">
            <h4>Mayúsculas</h4>
            ${shuffledPairs.map(pair => `
              <button class="match-letter uppercase" data-letter="${pair.upper}">
                ${pair.upper}
              </button>
            `).join('')}
          </div>
          
          <div class="lowercase-letters">
            <h4>Minúsculas</h4>
            ${this.shuffleArray(shuffledPairs).map(pair => `
              <button class="match-letter lowercase" data-letter="${pair.lower}">
                ${pair.lower}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="feedback" id="letters-feedback"></div>
      </div>
    `

    this.setupMatchEventListeners()
  }

  private generateWriteGame(): void {
    if (!this.gameContainer) return

    const words = ['GATO', 'CASA', 'SOL', 'LUNA', 'AGUA', 'FLOR', 'MESA', 'LIBRO']
    const word = words[this.getRandomInt(0, words.length - 1)]

    this.currentGame = {
      type: 'write',
      letter: '', // No usado en este juego
      word
    }

    this.gameContainer.innerHTML = `
      <div class="write-game">
        <div class="instruction">
          <h3>Escribe la palabra que ves en la imagen</h3>
        </div>
        
        <div class="word-image">
          <div class="image-placeholder">
            <span class="word-emoji">${this.getEmojiForWord(word)}</span>
            <div class="word-hint">${word}</div>
          </div>
        </div>
        
        <div class="word-input">
          <input type="text" id="word-input" placeholder="Escribe aquí..." maxlength="${word.length}">
          <button id="check-word">Verificar</button>
        </div>
        
        <div class="feedback" id="letters-feedback"></div>
      </div>
    `

    this.setupWriteEventListeners()
  }

  private getEmojiForWord(word: string): string {
    const emojiMap: { [key: string]: string } = {
      'GATO': '🐱',
      'CASA': '🏠',
      'SOL': '☀️',
      'LUNA': '🌙',
      'AGUA': '💧',
      'FLOR': '🌸',
      'MESA': '🪑',
      'LIBRO': '📚'
    }
    return emojiMap[word] || '📝'
  }

  private setupIdentifyEventListeners(): void {
    const letterOptions = this.gameContainer?.querySelectorAll('.letter-option')
    letterOptions?.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const selectedLetter = target.dataset.letter || ''
        this.checkIdentifyAnswer(selectedLetter, target)
      })
    })
  }

  private setupMatchEventListeners(): void {
    let selectedUppercase: HTMLElement | null = null
    let selectedLowercase: HTMLElement | null = null

    const matchLetters = this.gameContainer?.querySelectorAll('.match-letter')
    matchLetters?.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        
        if (target.classList.contains('uppercase')) {
          // Deseleccionar anterior
          if (selectedUppercase) {
            selectedUppercase.classList.remove('selected')
          }
          selectedUppercase = target
          target.classList.add('selected')
        } else {
          // Deseleccionar anterior
          if (selectedLowercase) {
            selectedLowercase.classList.remove('selected')
          }
          selectedLowercase = target
          target.classList.add('selected')
        }

        // Verificar si ambas están seleccionadas
        if (selectedUppercase && selectedLowercase) {
          this.checkMatchAnswer(selectedUppercase, selectedLowercase)
          selectedUppercase = null
          selectedLowercase = null
        }
      })
    })
  }

  private setupWriteEventListeners(): void {
    const input = this.gameContainer?.querySelector('#word-input') as HTMLInputElement
    const checkButton = this.gameContainer?.querySelector('#check-word')

    const checkAnswer = () => {
      if (input) {
        this.checkWriteAnswer(input.value.toUpperCase())
      }
    }

    checkButton?.addEventListener('click', checkAnswer)
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkAnswer()
      }
    })
  }

  private checkIdentifyAnswer(selectedLetter: string, buttonElement: HTMLElement): void {
    if (!this.currentGame) return

    const feedbackElement = document.getElementById('letters-feedback')
    const letterOptions = this.gameContainer?.querySelectorAll('.letter-option')
    
    // Deshabilitar todos los botones
    letterOptions?.forEach(btn => {
      (btn as HTMLElement).style.pointerEvents = 'none'
    })

    if (selectedLetter === this.currentGame.letter) {
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
            <span>¡Perfecto! Es la letra ${selectedLetter}</span>
          </div>
        `
      }
    } else {
      // Respuesta incorrecta
      buttonElement.classList.add('incorrect')
      this.showErrorEffect(buttonElement)
      this.playErrorSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="error-message">
            <span class="emoji">🤔</span>
            <span>¡Inténtalo de nuevo! Era la letra ${this.currentGame.letter}</span>
          </div>
        `
      }
    }

    // Generar nuevo juego después de 2 segundos
    setTimeout(() => {
      this.generateNewGame()
    }, 2000)
  }

  private checkMatchAnswer(uppercaseElement: HTMLElement, lowercaseElement: HTMLElement): void {
    const uppercaseLetter = uppercaseElement.dataset.letter || ''
    const lowercaseLetter = lowercaseElement.dataset.letter || ''
    
    const feedbackElement = document.getElementById('letters-feedback')

    if (uppercaseLetter.toLowerCase() === lowercaseLetter) {
      // Par correcto
      this.score += 15
      this.updateScore()
      
      uppercaseElement.classList.add('correct')
      lowercaseElement.classList.add('correct')
      this.showSuccessEffect(uppercaseElement)
      this.showSuccessEffect(lowercaseElement)
      this.playSuccessSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="success-message">
            <span class="emoji">🎯</span>
            <span>¡Excelente! ${uppercaseLetter} y ${lowercaseLetter} son pareja</span>
          </div>
        `
      }

      // Verificar si se completó el juego
      const remainingLetters = this.gameContainer?.querySelectorAll('.match-letter:not(.correct)')
      if (remainingLetters && remainingLetters.length === 0) {
        setTimeout(() => {
          this.generateNewGame()
        }, 2000)
      }
    } else {
      // Par incorrecto
      uppercaseElement.classList.add('incorrect')
      lowercaseElement.classList.add('incorrect')
      this.showErrorEffect(uppercaseElement)
      this.showErrorEffect(lowercaseElement)
      this.playErrorSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="error-message">
            <span class="emoji">❌</span>
            <span>No son pareja. ¡Inténtalo de nuevo!</span>
          </div>
        `
      }

      // Remover selección y clases de error después de un momento
      setTimeout(() => {
        uppercaseElement.classList.remove('selected', 'incorrect')
        lowercaseElement.classList.remove('selected', 'incorrect')
        if (feedbackElement) {
          feedbackElement.innerHTML = ''
        }
      }, 1500)
    }
  }

  private checkWriteAnswer(inputWord: string): void {
    if (!this.currentGame || !this.currentGame.word) return

    const feedbackElement = document.getElementById('letters-feedback')
    const input = this.gameContainer?.querySelector('#word-input') as HTMLInputElement

    if (inputWord === this.currentGame.word) {
      // Respuesta correcta
      this.score += 20
      this.updateScore()
      
      if (input) {
        input.classList.add('correct')
        this.showSuccessEffect(input)
      }
      this.playSuccessSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="success-message">
            <span class="emoji">🌟</span>
            <span>¡Fantástico! Escribiste "${this.currentGame.word}" correctamente</span>
          </div>
        `
      }

      // Generar nuevo juego después de 2 segundos
      setTimeout(() => {
        this.generateNewGame()
      }, 2000)
    } else {
      // Respuesta incorrecta
      if (input) {
        input.classList.add('incorrect')
        this.showErrorEffect(input)
      }
      this.playErrorSound()
      
      if (feedbackElement) {
        feedbackElement.innerHTML = `
          <div class="error-message">
            <span class="emoji">🤔</span>
            <span>¡Inténtalo de nuevo! La palabra es "${this.currentGame.word}"</span>
          </div>
        `
      }

      // Limpiar input y clases después de un momento
      setTimeout(() => {
        if (input) {
          input.value = ''
          input.classList.remove('incorrect')
        }
        if (feedbackElement) {
          feedbackElement.innerHTML = ''
        }
      }, 2000)
    }
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('letters-score')
    if (scoreElement) {
      scoreElement.textContent = this.score.toString()
    }
  }

  private addStyles(): void {
    if (!document.getElementById('letters-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'letters-app-styles'
      styles.textContent = `
        .letters-app {
          padding: 20px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .app-header h2 {
          color: #4ECDC4;
          margin-bottom: 10px;
          font-size: 2em;
        }
        
        .score {
          font-size: 1.2em;
          font-weight: bold;
          color: #FF6B6B;
        }
        
        .game-selector {
          margin: 30px 0;
        }
        
        .game-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .game-btn {
          padding: 10px 20px;
          border: 3px solid #ddd;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .game-btn.active {
          background: #4ECDC4;
          color: white;
          border-color: #4ECDC4;
        }
        
        .letter-display {
          margin: 30px 0;
        }
        
        .big-letter {
          font-size: 8em;
          font-weight: bold;
          color: #2C3E50;
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          display: inline-block;
          min-width: 150px;
        }
        
        .letter-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          max-width: 400px;
          margin: 30px auto;
        }
        
        .letter-option {
          padding: 20px;
          font-size: 2em;
          font-weight: bold;
          border: 3px solid #4ECDC4;
          background: white;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .letter-option:hover {
          background: #4ECDC4;
          color: white;
          transform: scale(1.05);
        }
        
        .match-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 30px 0;
        }
        
        .match-letter {
          padding: 15px;
          margin: 5px;
          font-size: 1.5em;
          border: 3px solid #96CEB4;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .match-letter:hover {
          background: #96CEB4;
          color: white;
        }
        
        .match-letter.selected {
          background: #FECA57;
          border-color: #FECA57;
          color: white;
        }
        
        .word-image {
          margin: 30px 0;
        }
        
        .image-placeholder {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          display: inline-block;
        }
        
        .word-emoji {
          font-size: 6em;
          display: block;
          margin-bottom: 10px;
        }
        
        .word-hint {
          font-size: 1.5em;
          color: #2C3E50;
          font-weight: bold;
        }
        
        .word-input {
          display: flex;
          gap: 15px;
          justify-content: center;
          align-items: center;
          margin: 30px 0;
        }
        
        #word-input {
          padding: 15px;
          font-size: 1.5em;
          border: 3px solid #4ECDC4;
          border-radius: 10px;
          text-align: center;
          text-transform: uppercase;
          min-width: 200px;
        }
        
        #check-word {
          padding: 15px 25px;
          font-size: 1.2em;
          background: #4ECDC4;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        #check-word:hover {
          background: #45B7D1;
          transform: scale(1.05);
        }
        
        .correct {
          background: #96CEB4 !important;
          border-color: #96CEB4 !important;
          color: white !important;
        }
        
        .incorrect {
          background: #FF6B6B !important;
          border-color: #FF6B6B !important;
          color: white !important;
        }
        
        .feedback {
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
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
        
        @media (max-width: 600px) {
          .big-letter {
            font-size: 5em;
            padding: 20px;
          }
          
          .letter-options {
            grid-template-columns: 1fr;
          }
          
          .match-container {
            grid-template-columns: 1fr;
          }
          
          .word-input {
            flex-direction: column;
          }
        }
      `
      document.head.appendChild(styles)
    }
  }
}
