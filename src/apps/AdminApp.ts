import { Application } from './Application'

interface SystemSettings {
  kioskMode: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  soundEnabled: boolean
  theme: string
  autoSave: boolean
}

export class AdminApp extends Application {
  private settings: SystemSettings = {
    kioskMode: true,
    difficulty: 'easy',
    soundEnabled: true,
    theme: 'infantil',
    autoSave: true
  }

  init(container: HTMLElement): void {
    this.container = container
    this.isRunning = true
    this.loadSettings()
    this.render()
  }

  private render(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="admin-app">
        <div class="app-header">
          <h2>⚙️ Panel de Administración</h2>
          <p>Configuración del sistema educativo</p>
        </div>
        
        <div class="admin-sections">
          <div class="section">
            <h3>🔒 Modo Kiosco</h3>
            <div class="setting-item">
              <label class="switch">
                <input type="checkbox" id="kiosk-mode" ${this.settings.kioskMode ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
              <span class="setting-label">Activar modo kiosco (pantalla completa, sin salida)</span>
            </div>
            <div class="setting-description">
              <p>⚠️ En modo kiosco, los estudiantes no podrán salir de la aplicación fácilmente.</p>
              <p>Código de salida de emergencia: <strong>SALIR123</strong></p>
            </div>
          </div>
          
          <div class="section">
            <h3>🎯 Dificultad Global</h3>
            <div class="setting-item">
              <select id="difficulty-select">
                <option value="easy" ${this.settings.difficulty === 'easy' ? 'selected' : ''}>Fácil (5-6 años)</option>
                <option value="medium" ${this.settings.difficulty === 'medium' ? 'selected' : ''}>Medio (6-7 años)</option>
                <option value="hard" ${this.settings.difficulty === 'hard' ? 'selected' : ''}>Difícil (7-8 años)</option>
              </select>
              <span class="setting-label">Nivel de dificultad predeterminado</span>
            </div>
          </div>
          
          <div class="section">
            <h3>🔊 Audio</h3>
            <div class="setting-item">
              <label class="switch">
                <input type="checkbox" id="sound-enabled" ${this.settings.soundEnabled ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
              <span class="setting-label">Habilitar efectos de sonido</span>
            </div>
          </div>
          
          <div class="section">
            <h3>🎨 Tema Visual</h3>
            <div class="setting-item">
              <select id="theme-select">
                <option value="infantil" ${this.settings.theme === 'infantil' ? 'selected' : ''}>Infantil (Colores brillantes)</option>
                <option value="clasico" ${this.settings.theme === 'clasico' ? 'selected' : ''}>Clásico (Colores suaves)</option>
                <option value="accesible" ${this.settings.theme === 'accesible' ? 'selected' : ''}>Accesible (Alto contraste)</option>
              </select>
              <span class="setting-label">Tema de colores de la interfaz</span>
            </div>
          </div>
          
          <div class="section">
            <h3>💾 Datos</h3>
            <div class="setting-item">
              <label class="switch">
                <input type="checkbox" id="auto-save" ${this.settings.autoSave ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
              <span class="setting-label">Guardar progreso automáticamente</span>
            </div>
            <div class="data-actions">
              <button id="export-data" class="action-btn export">📤 Exportar Datos</button>
              <button id="import-data" class="action-btn import">📥 Importar Datos</button>
              <button id="reset-data" class="action-btn reset">🗑️ Reiniciar Datos</button>
            </div>
          </div>
          
          <div class="section">
            <h3>📊 Estadísticas de Uso</h3>
            <div class="stats-container" id="stats-container">
              <!-- Las estadísticas se cargarán aquí -->
            </div>
          </div>
          
          <div class="section">
            <h3>ℹ️ Información del Sistema</h3>
            <div class="system-info">
              <div class="info-item">
                <strong>Versión:</strong> 1.0.0
              </div>
              <div class="info-item">
                <strong>Última actualización:</strong> ${new Date().toLocaleDateString()}
              </div>
              <div class="info-item">
                <strong>Navegador:</strong> ${navigator.userAgent.split(' ')[0]}
              </div>
              <div class="info-item">
                <strong>Resolución:</strong> ${screen.width}x${screen.height}
              </div>
            </div>
          </div>
        </div>
        
        <div class="admin-actions">
          <button id="save-settings" class="save-btn">💾 Guardar Configuración</button>
          <button id="reset-settings" class="reset-btn">🔄 Restaurar Valores Predeterminados</button>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.loadStatistics()
    this.addStyles()
  }

  private setupEventListeners(): void {
    // Guardar configuración
    const saveBtn = this.container?.querySelector('#save-settings')
    saveBtn?.addEventListener('click', () => {
      this.saveSettings()
    })

    // Resetear configuración
    const resetBtn = this.container?.querySelector('#reset-settings')
    resetBtn?.addEventListener('click', () => {
      this.resetSettings()
    })

    // Exportar datos
    const exportBtn = this.container?.querySelector('#export-data')
    exportBtn?.addEventListener('click', () => {
      this.exportData()
    })

    // Importar datos
    const importBtn = this.container?.querySelector('#import-data')
    importBtn?.addEventListener('click', () => {
      this.importData()
    })

    // Resetear datos
    const resetDataBtn = this.container?.querySelector('#reset-data')
    resetDataBtn?.addEventListener('click', () => {
      this.resetData()
    })

    // Escuchar cambios en tiempo real
    const inputs = this.container?.querySelectorAll('input, select')
    inputs?.forEach(input => {
      input.addEventListener('change', () => {
        this.updateSettingsFromForm()
      })
    })
  }

  private updateSettingsFromForm(): void {
    const kioskModeInput = this.container?.querySelector('#kiosk-mode') as HTMLInputElement
    const difficultySelect = this.container?.querySelector('#difficulty-select') as HTMLSelectElement
    const soundEnabledInput = this.container?.querySelector('#sound-enabled') as HTMLInputElement
    const themeSelect = this.container?.querySelector('#theme-select') as HTMLSelectElement
    const autoSaveInput = this.container?.querySelector('#auto-save') as HTMLInputElement

    if (kioskModeInput) this.settings.kioskMode = kioskModeInput.checked
    if (difficultySelect) this.settings.difficulty = difficultySelect.value as 'easy' | 'medium' | 'hard'
    if (soundEnabledInput) this.settings.soundEnabled = soundEnabledInput.checked
    if (themeSelect) this.settings.theme = themeSelect.value
    if (autoSaveInput) this.settings.autoSave = autoSaveInput.checked
  }

  private saveSettings(): void {
    this.updateSettingsFromForm()
    
    try {
      localStorage.setItem('educativo-settings', JSON.stringify(this.settings))
      this.showNotification('✅ Configuración guardada correctamente', 'success')
      
      // Aplicar cambios inmediatamente si es posible
      this.applySettings()
    } catch (error) {
      this.showNotification('❌ Error al guardar la configuración', 'error')
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('educativo-settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.log('No se pudieron cargar las configuraciones guardadas')
    }
  }

  private resetSettings(): void {
    this.settings = {
      kioskMode: true,
      difficulty: 'easy',
      soundEnabled: true,
      theme: 'infantil',
      autoSave: true
    }
    
    this.render()
    this.showNotification('🔄 Configuración restaurada a valores predeterminados', 'info')
  }

  private applySettings(): void {
    // Aplicar tema
    document.body.className = `theme-${this.settings.theme}`
    
    // Aplicar modo kiosco si está habilitado
    if (this.settings.kioskMode) {
      // Aquí se podría comunicar con el KioskManager
      console.log('Aplicando modo kiosco')
    }
  }

  private exportData(): void {
    try {
      const data = {
        settings: this.settings,
        statistics: this.getStatistics(),
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `educativo-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
      URL.revokeObjectURL(url)
      this.showNotification('📤 Datos exportados correctamente', 'success')
    } catch (error) {
      this.showNotification('❌ Error al exportar los datos', 'error')
    }
  }

  private importData(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          if (data.settings) {
            this.settings = { ...this.settings, ...data.settings }
            this.saveSettings()
            this.render()
            this.showNotification('📥 Datos importados correctamente', 'success')
          } else {
            this.showNotification('❌ Archivo de datos inválido', 'error')
          }
        } catch (error) {
          this.showNotification('❌ Error al leer el archivo', 'error')
        }
      }
      reader.readAsText(file)
    })
    
    input.click()
  }

  private resetData(): void {
    if (confirm('¿Estás seguro de que quieres reiniciar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        localStorage.clear()
        this.showNotification('🗑️ Todos los datos han sido reiniciados', 'info')
        this.loadStatistics()
      } catch (error) {
        this.showNotification('❌ Error al reiniciar los datos', 'error')
      }
    }
  }

  private loadStatistics(): void {
    const statsContainer = this.container?.querySelector('#stats-container')
    if (!statsContainer) return

    const stats = this.getStatistics()
    
    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.totalGames}</div>
          <div class="stat-label">Juegos Jugados</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.totalScore}</div>
          <div class="stat-label">Puntos Totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.averageScore}</div>
          <div class="stat-label">Promedio por Juego</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.timeSpent}</div>
          <div class="stat-label">Tiempo de Uso (min)</div>
        </div>
      </div>
      
      <div class="stats-details">
        <h4>Juegos Más Populares:</h4>
        <ul>
          ${stats.gamePopularity.map((game: any) => `
            <li>${game.name}: ${game.plays} veces</li>
          `).join('')}
        </ul>
      </div>
    `
  }

  private getStatistics(): any {
    // Simular estadísticas (en una implementación real, estos datos vendrían del localStorage)
    return {
      totalGames: parseInt(localStorage.getItem('total-games') || '0'),
      totalScore: parseInt(localStorage.getItem('total-score') || '0'),
      averageScore: Math.round((parseInt(localStorage.getItem('total-score') || '0') / Math.max(1, parseInt(localStorage.getItem('total-games') || '1')))),
      timeSpent: parseInt(localStorage.getItem('time-spent') || '0'),
      gamePopularity: [
        { name: 'Matemáticas', plays: parseInt(localStorage.getItem('math-plays') || '0') },
        { name: 'Letras', plays: parseInt(localStorage.getItem('letters-plays') || '0') },
        { name: 'Colores', plays: parseInt(localStorage.getItem('colors-plays') || '0') },
        { name: 'Formas', plays: parseInt(localStorage.getItem('shapes-plays') || '0') }
      ]
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notification = document.createElement('div')
    notification.className = `admin-notification ${type}`
    notification.textContent = message
    
    this.container?.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  private addStyles(): void {
    if (!document.getElementById('admin-app-styles')) {
      const styles = document.createElement('style')
      styles.id = 'admin-app-styles'
      styles.textContent = `
        .admin-app {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
          text-align: left;
        }
        
        .admin-app h2 {
          color: #636E72;
          text-align: center;
          margin-bottom: 10px;
        }
        
        .app-header p {
          text-align: center;
          color: #74b9ff;
          margin-bottom: 30px;
        }
        
        .admin-sections {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        .section {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border-left: 5px solid #636E72;
        }
        
        .section h3 {
          color: #2C3E50;
          margin-bottom: 20px;
          font-size: 1.3em;
        }
        
        .setting-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .setting-label {
          color: #2C3E50;
          font-weight: 500;
        }
        
        .setting-description {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-top: 10px;
        }
        
        .setting-description p {
          margin: 5px 0;
          color: #666;
          font-size: 0.9em;
        }
        
        /* Switch Toggle */
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #636E72;
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        
        /* Select */
        select {
          padding: 10px 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1em;
          background: white;
          min-width: 200px;
        }
        
        select:focus {
          outline: none;
          border-color: #636E72;
        }
        
        /* Action buttons */
        .data-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.3s ease;
        }
        
        .action-btn.export {
          background: #00b894;
          color: white;
        }
        
        .action-btn.import {
          background: #0984e3;
          color: white;
        }
        
        .action-btn.reset {
          background: #e17055;
          color: white;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        /* Statistics */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          color: #636E72;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9em;
          margin-top: 5px;
        }
        
        .stats-details h4 {
          color: #2C3E50;
          margin-bottom: 10px;
        }
        
        .stats-details ul {
          list-style: none;
          padding: 0;
        }
        
        .stats-details li {
          padding: 5px 0;
          color: #666;
        }
        
        /* System info */
        .system-info {
          display: grid;
          gap: 10px;
        }
        
        .info-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          font-family: monospace;
        }
        
        /* Admin actions */
        .admin-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eee;
        }
        
        .save-btn, .reset-btn {
          padding: 15px 30px;
          font-size: 1.1em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .save-btn {
          background: #00b894;
          color: white;
        }
        
        .reset-btn {
          background: #636E72;
          color: white;
        }
        
        .save-btn:hover, .reset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.2);
        }
        
        /* Notifications */
        .admin-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        
        .admin-notification.success {
          background: #00b894;
        }
        
        .admin-notification.error {
          background: #e17055;
        }
        
        .admin-notification.info {
          background: #0984e3;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @media (max-width: 768px) {
          .data-actions {
            flex-direction: column;
          }
          
          .admin-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `
      document.head.appendChild(styles)
    }
  }
}
