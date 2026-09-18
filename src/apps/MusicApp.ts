import { Application } from './Application'

export class MusicApp extends Application {
  private score: number = 0
  private notes = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']
  private instruments = [
    { name: 'Piano', emoji: '🎹', sound: 'piano' },
    { name: 'Guitarra', emoji: '🎸', sound: 'guitar' },
    { name: 'Tambor', emoji: '🥁', sound: 'drum' },
    { name: 'Flauta', emoji: '🎺', sound: 'flute' }
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
      <div class="music-app">
        <div class="app-header">
          <h2>🎵 ¡Aprende Música!</h2>
          <div class="score">Puntos: <span id="music-score">${this.score}</span></div>
        </div>
        
        <div class="music-sections">
          <div class="section">
            <h3>🎹 Piano Virtual</h3>
            <div class="piano" id="piano">
              ${this.notes.map((note, index) => `
                <button class="piano-key" data-note="${note}" data-frequency="${this.getNoteFrequency(index)}">
                  ${note}
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h3>🎶 Instrumentos</h3>
            <div class="instruments">
              ${this.instruments.map(instrument => `
                <button class="instrument-btn" data-instrument="${instrument.sound}">
                  <span class="instrument-emoji">${instrument.emoji}</span>
                  <span class="instrument-name">${instrument.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h3>🎯 Juego de Notas</h3>
            <div class="note-game" id="note-game">
              <button id="start-note-game">¡Empezar Juego!</button>
            </div>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.addStyles()
  }

  private getNoteFrequency(index: number): number {
    // Frecuencias básicas para las notas (Do, Re, Mi, Fa, Sol, La, Si)
    const baseFrequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]
    return baseFrequencies[index] || 261.63
  }

  private setupEventListeners(): void {
    // Piano keys
    const pianoKeys = this.container?.querySelectorAll('.piano-key')
    pianoKeys?.forEach(key => {
      key.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const frequency = parseFloat(target.dataset.frequency || '261.63')
        this.playNote(frequency)
        this.animateKey(target)
      })
    })

    // Instrumentos
    const instrumentBtns = this.container?.querySelectorAll('.instrument-btn')
    instrumentBtns?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement
        const instrument = target.dataset.instrument || ''
        this.playInstrument(instrument)
        this.animateInstrument(target)
      })
    })

    // Juego de notas
    const startGameBtn = this.container?.querySelector('#start-note-game')
    startGameBtn?.addEventListener('click', () => {
      this.startNoteGame()
    })
  }

  private playNote(frequency: number): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('No se pudo reproducir la nota')
    }
  }

  private playInstrument(instrument: string): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      let frequency = 440
      let waveType: OscillatorType = 'sine'
      
      switch (instrument) {
        case 'piano':
          frequency = 440
          waveType = 'sine'
          break
        case 'guitar':
          frequency = 329.63
          waveType = 'sawtooth'
          break
        case 'drum':
          frequency = 80
          waveType = 'square'
          break
        case 'flute':
          frequency = 523.25
          waveType = 'sine'
          break
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = waveType
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.8)
    } catch (error) {
      console.log('No se pudo reproducir el instrumento')
    }
  }

  private animateKey(keyElement: HTMLElement): void {
    keyElement.classList.add('pressed')
    setTimeout(() => {
      keyElement.classList.remove('pressed')
    }, 200)
  }

  private animateInstrument(instrumentElement: HTMLElement): void {
    instrumentElement.classList.add('playing')
    setTimeout(() => {
      instrumentElement.classList.remove('playing')
    }, 500)
  }

  private startNoteGame(): void {
    const gameContainer = document.getElementById('note-game')
    if (!gameContainer) return

    const targetNote = this.notes[this.getRandomInt(0, this.notes.length - 1)]
    
    gameContainer.innerHTML = `
      <div class="note-game-active">
        <div class="instruction">
          <h4>¡Encuentra la nota ${targetNote}!</h4>
          <p>Haz clic en la tecla correcta del piano</p>
        </div>
        <div class="target-note">${targetNote}</div>
        <button id="play-target-sound">🔊 Escuchar</button>
      </div>
    `

    // Hacer que las teclas del piano sean parte del juego
    const pianoKeys = document.querySelectorAll('.piano-key')
    pianoKeys.forEach(key => {
      const keyElement = key as HTMLElement
      keyElement.classList.add('game-active')
      
      // Remover listeners anteriores y agregar nuevos
      const newKey = keyElement.cloneNode(true) as HTMLElement
      keyElement.parentNode?.replaceChild(newKey, keyElement)
      
      newKey.addEventListener('click', () => {
        const note = newKey.dataset.note || ''
        this.checkNoteAnswer(note, targetNote, newKey)
      })
    })

    // Botón para escuchar la nota objetivo
    const playTargetBtn = document.getElementById('play-target-sound')
    playTargetBtn?.addEventListener('click', () => {
      const noteIndex = this.notes.indexOf(targetNote)
      const frequency = this.getNoteFrequency(noteIndex)
      this.playNote(frequency)
    })
  }

  private checkNoteAnswer(selectedNote: string, targetNote: string, keyElement: HTMLElement): void {
    const gameContainer = document.getElementById('note-game')
    
    if (selectedNote === targetNote) {
      this.score += 15
      this.updateScore()
      
      keyElement.classList.add('correct')
      this.showSuccessEffect(keyElement)
      this.playSuccessSound()
      
      if (gameContainer) {
        gameContainer.innerHTML = `
          <div class="game-result success">
            <span class="emoji">🎉</span>
            <span>¡Perfecto! Era la nota ${targetNote}</span>
            <button id="next-note-game">Siguiente</button>
          </div>
        `
        
        const nextBtn = document.getElementById('next-note-game')
        nextBtn?.addEventListener('click', () => {
          this.startNoteGame()
        })
      }
    } else {
      keyElement.classList.add('incorrect')
      this.showErrorEffect(keyElement)
      this.playErrorSound()
      
      // Mostrar la tecla correcta
      const correctKey = document.querySelector(`[data-note="${targetNote}"]`)
      if (correctKey) {
        correctKey.classList.add('correct')
      }
    }

    // Limpiar el juego después de unos segundos
    setTimeout(() => {
      const allKeys = document.querySelectorAll('.piano-key')
      allKeys.forEach(key => {
        key.classList.remove('game-active', 'correct', 'incorrect')
      })
    }, 2000)
  }

  private updateScore(): void {
    const scoreElement = document.getElementById('music-score')
    if (scoreElement) {
      scoreElement.textContent = this.score.toString()
    }
  }

  private addStyles(): void {
    if (!document.getElementById('music-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'music-app-styles'
      styles.textContent = `
        .music-app {
          padding: 20px;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .music-app h2 {
          color: #E17055;
          font-size: 2em;
          margin-bottom: 10px;
        }
        
        .music-sections {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .section {
          background: white;
          padding: 25px;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .section h3 {
          color: #2C3E50;
          margin-bottom: 20px;
        }
        
        .piano {
          display: flex;
          justify-content: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        
        .piano-key {
          padding: 20px 10px;
          font-size: 1.2em;
          font-weight: bold;
          border: 3px solid #E17055;
          background: white;
          color: #E17055;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 60px;
        }
        
        .piano-key:hover {
          background: #E17055;
          color: white;
          transform: translateY(-3px);
        }
        
        .piano-key.pressed {
          background: #E17055;
          color: white;
          transform: translateY(2px);
        }
        
        .piano-key.game-active {
          border-color: #45B7D1;
          animation: pulse 1s infinite;
        }
        
        .piano-key.correct {
          background: #96CEB4 !important;
          border-color: #96CEB4 !important;
        }
        
        .piano-key.incorrect {
          background: #FF6B6B !important;
          border-color: #FF6B6B !important;
        }
        
        .instruments {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .instrument-btn {
          padding: 20px;
          border: 3px solid #A29BFE;
          background: white;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .instrument-emoji {
          font-size: 3em;
        }
        
        .instrument-name {
          font-weight: bold;
          color: #2C3E50;
        }
        
        .instrument-btn:hover {
          background: #A29BFE;
          color: white;
          transform: scale(1.05);
        }
        
        .instrument-btn.playing {
          background: #A29BFE;
          color: white;
          transform: scale(1.1);
        }
        
        .target-note {
          font-size: 4em;
          font-weight: bold;
          color: #E17055;
          margin: 20px 0;
          background: white;
          border: 3px solid #E17055;
          border-radius: 20px;
          padding: 20px;
          display: inline-block;
          min-width: 100px;
        }
        
        #play-target-sound, #start-note-game, #next-note-game {
          padding: 15px 25px;
          font-size: 1.2em;
          background: #45B7D1;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 10px;
        }
        
        #play-target-sound:hover, #start-note-game:hover, #next-note-game:hover {
          background: #4ECDC4;
          transform: scale(1.05);
        }
        
        .game-result {
          padding: 20px;
          border-radius: 15px;
          font-size: 1.2em;
          font-weight: bold;
        }
        
        .game-result.success {
          background: #96CEB4;
          color: white;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @media (max-width: 600px) {
          .piano {
            flex-direction: column;
            align-items: center;
          }
          
          .piano-key {
            min-width: 80px;
          }
          
          .instruments {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `
      document.head.appendChild(styles)
    }
  }
}
