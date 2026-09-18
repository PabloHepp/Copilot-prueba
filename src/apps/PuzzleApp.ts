import { Application } from './Application'

interface PuzzlePiece {
  id: number
  x: number
  y: number
  correctX: number
  correctY: number
  placed: boolean
}

export class PuzzleApp extends Application {
  private score: number = 0
  private currentPuzzle: PuzzlePiece[] = []
  private puzzleSize: 2 | 3 | 4 = 2
  private draggedPiece: PuzzlePiece | null = null

  init(container: HTMLElement): void {
    this.container = container
    this.isRunning = true
    this.score = 0
    this.render()
  }

  private render(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="puzzle-app">
        <div class="app-header">
          <h2>🧩 ¡Rompecabezas!</h2>
          <div class="score">Puntos: <span id="puzzle-score">${this.score}</span></div>
        </div>
        
        <div class="difficulty-selector">
          <h3>Elige la dificultad:</h3>
          <div class="difficulty-buttons">
            <button class="difficulty-btn active" data-size="2">Fácil (2x2)</button>
            <button class="difficulty-btn" data-size="3">Medio (3x3)</button>
            <button class="difficulty-btn" data-size="4">Difícil (4x4)</button>
          </div>
        </div>
        
        <div class="puzzle-container">
          <div class="puzzle-board" id="puzzle-board"></div>
          <div class="puzzle-pieces" id="puzzle-pieces"></div>
        </div>
        
        <div class="puzzle-controls">
          <button id="new-puzzle">Nuevo Rompecabezas</button>
          <button id="show-solution">Mostrar Solución</button>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.generateNewPuzzle()
    this.addStyles()
  }

  private setupEventListeners(): void {
    // Botones de dificultad
    const difficultyButtons = this.container?.querySelectorAll('.difficulty-btn')
    difficultyButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const size = parseInt(target.dataset.size || '2') as 2 | 3 | 4
        
        difficultyButtons.forEach(btn => btn.classList.remove('active'))
        target.classList.add('active')
        
        this.puzzleSize = size
        this.generateNewPuzzle()
      })
    })

    // Botón nuevo puzzle
    const newPuzzleBtn = this.container?.querySelector('#new-puzzle')
    newPuzzleBtn?.addEventListener('click', () => {
      this.generateNewPuzzle()
    })

    // Botón mostrar solución
    const showSolutionBtn = this.container?.querySelector('#show-solution')
    showSolutionBtn?.addEventListener('click', () => {
      this.showSolution()
    })
  }

  private generateNewPuzzle(): void {
    const totalPieces = this.puzzleSize * this.puzzleSize
    this.currentPuzzle = []

    // Crear piezas del puzzle
    for (let i = 0; i < totalPieces; i++) {
      const correctX = i % this.puzzleSize
      const correctY = Math.floor(i / this.puzzleSize)
      
      this.currentPuzzle.push({
        id: i,
        x: -1, // Inicialmente en el área de piezas
        y: -1,
        correctX,
        correctY,
        placed: false
      })
    }

    this.renderPuzzle()
  }

  private renderPuzzle(): void {
    const puzzleBoard = document.getElementById('puzzle-board')
    const puzzlePieces = document.getElementById('puzzle-pieces')
    
    if (!puzzleBoard || !puzzlePieces) return

    // Configurar tamaño del tablero
    puzzleBoard.style.gridTemplateColumns = `repeat(${this.puzzleSize}, 1fr)`
    puzzleBoard.style.gridTemplateRows = `repeat(${this.puzzleSize}, 1fr)`

    // Limpiar contenedores
    puzzleBoard.innerHTML = ''
    puzzlePieces.innerHTML = ''

    // Crear espacios del tablero
    for (let y = 0; y < this.puzzleSize; y++) {
      for (let x = 0; x < this.puzzleSize; x++) {
        const slot = document.createElement('div')
        slot.className = 'puzzle-slot'
        slot.dataset.x = x.toString()
        slot.dataset.y = y.toString()
        
        // Agregar patrón de imagen como referencia
        slot.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(this.generatePiecePattern(x, y))}")`
        
        this.setupDropZone(slot)
        puzzleBoard.appendChild(slot)
      }
    }

    // Crear piezas mezcladas
    const shuffledPieces = this.shuffleArray([...this.currentPuzzle])
    shuffledPieces.forEach(piece => {
      const pieceElement = document.createElement('div')
      pieceElement.className = 'puzzle-piece'
      pieceElement.dataset.id = piece.id.toString()
      pieceElement.draggable = true
      
      // Patrón de la pieza
      pieceElement.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(this.generatePiecePattern(piece.correctX, piece.correctY))}")`
      
      this.setupDragEvents(pieceElement, piece)
      puzzlePieces.appendChild(pieceElement)
    })
  }

  private generatePiecePattern(x: number, y: number): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#A29BFE', '#E17055', '#DDA0DD']
    const color = colors[(x + y * this.puzzleSize) % colors.length]
    
    return `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}"/>
        <circle cx="50" cy="50" r="20" fill="white" opacity="0.7"/>
        <text x="50" y="55" text-anchor="middle" font-size="16" font-weight="bold" fill="#2C3E50">
          ${x + y * this.puzzleSize + 1}
        </text>
      </svg>
    `
  }

  private setupDragEvents(element: HTMLElement, piece: PuzzlePiece): void {
    element.addEventListener('dragstart', (e) => {
      this.draggedPiece = piece
      element.classList.add('dragging')
      e.dataTransfer?.setData('text/plain', piece.id.toString())
    })

    element.addEventListener('dragend', () => {
      element.classList.remove('dragging')
      this.draggedPiece = null
    })

    // También agregar soporte táctil básico
    element.addEventListener('touchstart', () => {
      this.draggedPiece = piece
      element.classList.add('dragging')
    })
  }

  private setupDropZone(slot: HTMLElement): void {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault()
      slot.classList.add('drag-over')
    })

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over')
    })

    slot.addEventListener('drop', (e) => {
      e.preventDefault()
      slot.classList.remove('drag-over')
      
      if (this.draggedPiece) {
        const slotX = parseInt(slot.dataset.x || '0')
        const slotY = parseInt(slot.dataset.y || '0')
        this.placePiece(this.draggedPiece, slotX, slotY, slot)
      }
    })

    // Soporte para clic simple (más fácil para niños)
    slot.addEventListener('click', () => {
      if (this.draggedPiece) {
        const slotX = parseInt(slot.dataset.x || '0')
        const slotY = parseInt(slot.dataset.y || '0')
        this.placePiece(this.draggedPiece, slotX, slotY, slot)
      }
    })
  }

  private placePiece(piece: PuzzlePiece, slotX: number, slotY: number, slotElement: HTMLElement): void {
    // Verificar si el slot ya tiene una pieza
    if (slotElement.hasChildNodes()) {
      return
    }

    // Mover la pieza al slot
    const pieceElement = document.querySelector(`[data-id="${piece.id}"]`) as HTMLElement
    if (pieceElement) {
      pieceElement.classList.remove('dragging')
      slotElement.appendChild(pieceElement)
      
      piece.x = slotX
      piece.y = slotY
      piece.placed = true

      // Verificar si está en la posición correcta
      if (slotX === piece.correctX && slotY === piece.correctY) {
        pieceElement.classList.add('correct-position')
        this.score += 10
        this.updateScore()
        this.playSuccessSound()
        this.showSuccessEffect(pieceElement)
        
        // Verificar si el puzzle está completo
        if (this.isPuzzleComplete()) {
          this.handlePuzzleComplete()
        }
      } else {
        pieceElement.classList.add('incorrect-position')
        setTimeout(() => {
          pieceElement.classList.remove('incorrect-position')
        }, 1000)
      }
    }
  }

  private isPuzzleComplete(): boolean {
    return this.currentPuzzle.every(piece => 
      piece.placed && piece.x === piece.correctX && piece.y === piece.correctY
    )
  }

  private handlePuzzleComplete(): void {
    this.score += 50 // Bonus por completar
    this.updateScore()
    
    // Mostrar celebración
    const celebration = document.createElement('div')
    celebration.className = 'puzzle-celebration'
    celebration.innerHTML = `
      <div class="celebration-content">
        <h3>🎉 ¡Felicitaciones! 🎉</h3>
        <p>¡Completaste el rompecabezas!</p>
        <p>Bonus: +50 puntos</p>
        <button onclick="this.parentElement.parentElement.remove()">Continuar</button>
      </div>
    `
    
    this.container?.appendChild(celebration)
    
    setTimeout(() => {
      if (celebration.parentElement) {
        celebration.remove()
      }
    }, 5000)
  }

  private showSolution(): void {
    this.currentPuzzle.forEach(piece => {
      const pieceElement = document.querySelector(`[data-id="${piece.id}"]`) as HTMLElement
      const correctSlot = document.querySelector(`[data-x="${piece.correctX}"][data-y="${piece.correctY}"]`) as HTMLElement
      
      if (pieceElement && correctSlot && !piece.placed) {
        this.placePiece(piece, piece.correctX, piece.correctY, correctSlot)
      }
    })
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('puzzle-score')
    if (scoreElement) {
      scoreElement.textContent = this.score.toString()
    }
  }

  private addStyles(): void {
    if (!document.getElementById('puzzle-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'puzzle-app-styles'
      styles.textContent = `
        .puzzle-app {
          padding: 20px;
          text-align: center;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .puzzle-app h2 {
          color: #A29BFE;
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        .difficulty-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 20px 0;
        }
        
        .difficulty-btn {
          padding: 10px 20px;
          border: 3px solid #A29BFE;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .difficulty-btn.active {
          background: #A29BFE;
          color: white;
        }
        
        .puzzle-container {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
          margin: 30px 0;
          align-items: start;
        }
        
        .puzzle-board {
          display: grid;
          gap: 2px;
          background: #2C3E50;
          padding: 10px;
          border-radius: 15px;
          min-height: 400px;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .puzzle-slot {
          background: white;
          border-radius: 5px;
          min-height: 90px;
          border: 2px dashed #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background-size: cover;
          background-position: center;
          opacity: 0.3;
        }
        
        .puzzle-slot.drag-over {
          border-color: #A29BFE;
          background-color: #A29BFE;
          opacity: 0.7;
        }
        
        .puzzle-pieces {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          max-height: 400px;
          overflow-y: auto;
        }
        
        .puzzle-piece {
          width: 90px;
          height: 90px;
          border: 2px solid #A29BFE;
          border-radius: 10px;
          cursor: grab;
          transition: all 0.3s ease;
          background-size: cover;
          background-position: center;
        }
        
        .puzzle-piece:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .puzzle-piece.dragging {
          opacity: 0.5;
          cursor: grabbing;
        }
        
        .puzzle-piece.correct-position {
          border-color: #96CEB4;
          box-shadow: 0 0 15px #96CEB4;
        }
        
        .puzzle-piece.incorrect-position {
          border-color: #FF6B6B;
          animation: errorShake 0.5s ease;
        }
        
        .puzzle-controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .puzzle-controls button {
          padding: 15px 25px;
          font-size: 1.1em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        #new-puzzle {
          background: #4ECDC4;
          color: white;
        }
        
        #show-solution {
          background: #FECA57;
          color: white;
        }
        
        .puzzle-controls button:hover {
          transform: scale(1.05);
        }
        
        .puzzle-celebration {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .celebration-content {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .celebration-content h3 {
          color: #A29BFE;
          font-size: 2em;
          margin-bottom: 15px;
        }
        
        .celebration-content button {
          padding: 15px 30px;
          font-size: 1.2em;
          background: #96CEB4;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 20px;
        }
        
        @media (max-width: 768px) {
          .puzzle-container {
            grid-template-columns: 1fr;
          }
          
          .puzzle-pieces {
            grid-template-columns: repeat(3, 1fr);
            max-height: 200px;
          }
          
          .puzzle-piece {
            width: 70px;
            height: 70px;
          }
          
          .puzzle-controls {
            flex-direction: column;
            align-items: center;
          }
        }
      `
      document.head.appendChild(styles)
    }
  }
}
