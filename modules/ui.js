/**
 * UI MANAGER - Gestor de Interfaz de Usuario
 *
 * Controla los elementos de la interfaz de usuario:
 * - HUD de juego
 * - Elementos interactivos
 * - Transiciones y animaciones de UI
 */

export class UIManager {
  constructor(game) {
    console.log("🖥️ [UI] Inicializando gestor de interfaz...")
    
    this.game = game
    this.elements = {}
    this.timeLeft = 0
    this.score = 0
    this.level = 1
    this.notifications = []
    this.animationFrames = {}
    
    console.log("✅ [UI] Gestor de interfaz inicializado")
  }
  
  /**
   * Inicializa y busca todos los elementos UI necesarios
   */
  initialize() {
    console.log("🚀 [UI] Buscando elementos UI...")
    
    // Mapeo de elementos a buscar
    const elementsToFind = [
      "scoreValue",
      "timeValue",
      "levelValue",
      "hudContainer",
      "gameOverlay",
      "pauseOverlay",
      "notificationContainer",
      "levelIndicator",
    ]
    
    // Buscar cada elemento
    elementsToFind.forEach((id) => {
      this.elements[id] = document.getElementById(id)
      if (!this.elements[id]) {
        console.warn(`⚠️ [UI] Elemento UI no encontrado: ${id}`)
      }
    })
    
    // Ocultar overlays inicialmente
    this.hideElement("gameOverlay")
    this.hideElement("pauseOverlay")
    
    console.log("✅ [UI] Elementos UI inicializados")
    
    // Inicializar notificaciones
    this.initializeNotifications()
  }
  
  /**
   * Configura el contenedor de notificaciones
   */
  initializeNotifications() {
    if (!this.elements.notificationContainer) {
      this.elements.notificationContainer = document.createElement("div")
      this.elements.notificationContainer.id = "notificationContainer"
      this.elements.notificationContainer.classList.add("notification-container")
      document.body.appendChild(this.elements.notificationContainer)
      
      console.log("✅ [UI] Contenedor de notificaciones creado")
    }
  }
  
  /**
   * Actualiza el HUD del juego
   */
  updateHUD(gameState) {
    this.updateScore(gameState.score)
    this.updateTimer(gameState.timeLeft)
    this.updateLevel(gameState.level)
  }
  
  /**
   * Actualiza la puntuación mostrada
   */
  updateScore(newScore) {
    if (!this.elements.scoreValue) return
    
    // Animación de puntaje si ha cambiado
    if (newScore > this.score) {
      this.elements.scoreValue.classList.add("score-change")
      setTimeout(() => {
        this.elements.scoreValue.classList.remove("score-change")
      }, 500)
    }
    
    this.elements.scoreValue.textContent = newScore
    this.score = newScore
  }
  
  /**
   * Actualiza el temporizador
   */
  updateTimer(seconds) {
    if (!this.elements.timeValue) return
    
    // Añadir clase de alerta si queda poco tiempo
    if (seconds <= 10) {
      this.elements.timeValue.classList.add("time-low")
    } else {
      this.elements.timeValue.classList.remove("time-low")
    }
    
    // Formatear minutos:segundos
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    this.elements.timeValue.textContent = `${minutes}:${secs < 10 ? "0" : ""}${secs}`
    this.timeLeft = seconds
  }
  
  /**
   * Actualiza el nivel mostrado
   */
  updateLevel(level) {
    if (!this.elements.levelValue) return
    
    // Animación de cambio de nivel
    if (level > this.level) {
      this.elements.levelValue.classList.add("level-up")
      setTimeout(() => {
        this.elements.levelValue.classList.remove("level-up")
      }, 800)
      
      // Mostrar indicador de nivel
      this.showLevelIndicator(level)
    }
    
    this.elements.levelValue.textContent = level
    this.level = level
  }
  
  /**
   * Muestra el indicador de nuevo nivel
   */
  showLevelIndicator(level) {
    if (!this.elements.levelIndicator) return
    
    // Actualizar contenido
    this.elements.levelIndicator.textContent = `NIVEL ${level}`
    
    // Mostrar con animación
    this.elements.levelIndicator.classList.add("show")
    
    // Ocultar después de la animación
    setTimeout(() => {
      this.elements.levelIndicator.classList.remove("show")
    }, 2000)
  }
  
  /**
   * Muestra un mensaje de notificación en juego
   */
  showNotification(message, type = "info", duration = 3000) {
    console.log(`📢 [UI] Notificación (${type}): ${message}`)
    
    // Crear elemento
    const notification = document.createElement("div")
    notification.classList.add("game-notification", `notification-${type}`)
    notification.textContent = message
    
    // Añadir al contenedor
    this.elements.notificationContainer?.appendChild(notification)
    
    // Mostrar con animación
    setTimeout(() => {
      notification.classList.add("show")
    }, 10)
    
    // Crear ID único para esta notificación
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`
    this.notifications.push(notificationId)
    
    // Programar eliminación
    setTimeout(() => {
      notification.classList.remove("show")
      notification.classList.add("hide")
      
      // Eliminar elemento después de la animación
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
        // Eliminar de la lista de notificaciones
        this.notifications = this.notifications.filter((id) => id !== notificationId)
      }, 500)
    }, duration)
    
    return notificationId
  }
  
  /**
   * Elimina una notificación específica
   */
  removeNotification(notificationId) {
    const index = this.notifications.indexOf(notificationId)
    if (index === -1) return
    
    this.notifications.splice(index, 1)
    // Implementación de la eliminación del DOM según sea necesario
  }
  
  /**
   * Muestra la pantalla de pausa
   */
  showPauseScreen() {
    console.log("⏸️ [UI] Mostrando pantalla de pausa")
    this.showElement("pauseOverlay")
  }
  
  /**
   * Oculta la pantalla de pausa
   */
  hidePauseScreen() {
    console.log("▶️ [UI] Ocultando pantalla de pausa")
    this.hideElement("pauseOverlay")
  }
  
  /**
   * Muestra la pantalla de fin de juego
   */
  showGameOverScreen(stats) {
    console.log("🏁 [UI] Mostrando pantalla de fin de juego")
    
    // Mostrar overlay
    this.showElement("gameOverlay")
    
    // Actualizar estadísticas en la pantalla si existen los elementos
    if (stats) {
      const finalScoreElement = document.getElementById("finalScore")
      const maxLevelElement = document.getElementById("maxLevel")
      const playTimeElement = document.getElementById("playTime")
      
      if (finalScoreElement) finalScoreElement.textContent = stats.finalScore
      if (maxLevelElement) maxLevelElement.textContent = stats.maxLevel
      if (playTimeElement) playTimeElement.textContent = this.formatTime(stats.playTime)
      
      console.log(`📊 [UI] Estadísticas finales: Score ${stats.finalScore}, Nivel ${stats.maxLevel}`)
    }
    
    // Mostrar botones después de un breve retraso
    setTimeout(() => {
      const buttons = document.querySelectorAll(".game-over-button")
      buttons.forEach((button, index) => {
        setTimeout(() => {
          button.classList.add("visible")
        }, index * 200)
      })
    }, 500)
  }
  
  /**
   * Formatea segundos a MM:SS
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }
  
  /**
   * Oculta la pantalla de fin de juego
   */
  hideGameOverScreen() {
    console.log("🔄 [UI] Ocultando pantalla de fin de juego")
    
    // Ocultar botones primero
    const buttons = document.querySelectorAll(".game-over-button")
    buttons.forEach((button) => {
      button.classList.remove("visible")
    })
    
    // Ocultar overlay después
    setTimeout(() => {
      this.hideElement("gameOverlay")
    }, 300)
  }
  
  /**
   * Métodos genéricos para mostar/ocultar elementos
   */
  showElement(elementId) {
    const element = this.elements[elementId]
    if (element) {
      element.style.display = "flex" // Cambiar según el layout deseado
      element.style.opacity = "1"
    }
  }
  
  hideElement(elementId) {
    const element = this.elements[elementId]
    if (element) {
      element.style.opacity = "0"
      setTimeout(() => {
        element.style.display = "none"
      }, 300) // Tiempo para la transición
    }
  }
  
  /**
   * Crea una animación para un elemento
   */
  createAnimation(elementId, keyframes, timing) {
    const element = document.getElementById(elementId) || this.elements[elementId]
    if (!element) {
      console.warn(`⚠️ [UI] Elemento para animación no encontrado: ${elementId}`)
      return null
    }
    
    // Cancelar animación anterior si existe
    if (this.animationFrames[elementId]) {
      this.animationFrames[elementId].cancel()
    }
    
    // Crear nueva animación
    const animation = element.animate(keyframes, timing)
    this.animationFrames[elementId] = animation
    
    return animation
  }
  
  /**
   * Animación de vibracion para elemento
   */
  shakeElement(elementId, intensity = 5, duration = 500) {
    return this.createAnimation(
      elementId,
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${intensity}px)` },
        { transform: `translateX(${intensity}px)` },
        { transform: `translateX(-${intensity / 2}px)` },
        { transform: `translateX(${intensity / 2}px)` },
        { transform: "translateX(0)" },
      ],
      {
        duration: duration,
        easing: "ease-in-out",
      },
    )
  }
  
  /**
   * Actualiza el estado visual de los botones de control
   */
  updateControlButtons(gameState) {
    // Ejemplo de actualización de botones según estado
    const pauseButton = document.getElementById("pauseButton")
    const powerupButton = document.getElementById("powerupButton")
    
    if (pauseButton) {
      pauseButton.classList.toggle("active", gameState.gamePaused)
    }
    
    if (powerupButton && gameState.powerups && gameState.powerups.length > 0) {
      powerupButton.classList.add("available")
      powerupButton.disabled = false
    } else if (powerupButton) {
      powerupButton.classList.remove("available")
      powerupButton.disabled = true
    }
  }
  
  /**
   * Actualiza la visualización de un powerup
   */
  updatePowerupDisplay(powerupType, active, timeLeft = 0) {
    const powerupElement = document.getElementById(`powerup-${powerupType}`)
    if (!powerupElement) return
    
    if (active) {
      powerupElement.classList.add("active")
      // Actualizar barra de progreso si existe
      const progressBar = powerupElement.querySelector(".powerup-progress")
      if (progressBar) {
        progressBar.style.width = `${(timeLeft * 100)}%`
      }
    } else {
      powerupElement.classList.remove("active")
    }
  }
  
  /**
   * Muestra el historial de puntuaciones
   */
  showHighScores(scores) {
    if (!scores || scores.length === 0) {
      console.log("📊 [UI] No hay puntuaciones para mostrar")
      return
    }
    
    console.log("📊 [UI] Mostrando tabla de puntuaciones")
    
    // Buscar o crear contenedor
    let scoresContainer = document.getElementById("highScoresContainer")
    if (!scoresContainer) {
      scoresContainer = document.createElement("div")
      scoresContainer.id = "highScoresContainer"
      scoresContainer.classList.add("high-scores-container")
      document.body.appendChild(scoresContainer)
    }
    
    // Limpiar contenido existente
    scoresContainer.innerHTML = `
      <h2>🏆 MEJORES PUNTUACIONES 🏆</h2>
      <table class="scores-table">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Puntuación</th>
            <th>Nivel</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${scores
            .map(
              (score, index) => `
            <tr class="${index === 0 ? "top-score" : ""}">
              <td>${index + 1}</td>
              <td>${score.score}</td>
              <td>${score.level || "-"}</td>
              <td>${new Date(score.date).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      <button id="closeScoresButton" class="close-button">Cerrar</button>
    `
    
    // Mostrar contenedor
    scoresContainer.style.display = "flex"
    setTimeout(() => {
      scoresContainer.classList.add("visible")
      
      // Configurar botón de cierre
      const closeButton = document.getElementById("closeScoresButton")
      if (closeButton) {
        closeButton.addEventListener("click", () => this.hideHighScores())
      }
    }, 10)
  }
  
  /**
   * Oculta el historial de puntuaciones
   */
  hideHighScores() {
    const scoresContainer = document.getElementById("highScoresContainer")
    if (!scoresContainer) return
    
    scoresContainer.classList.remove("visible")
    setTimeout(() => {
      scoresContainer.style.display = "none"
    }, 300)
  }
  
  /**
   * Limpia recursos del UI
   */
  cleanup() {
    // Cancelar todas las animaciones activas
    Object.values(this.animationFrames).forEach((animation) => {
      if (animation && typeof animation.cancel === "function") {
        animation.cancel()
      }
    })
    
    // Limpiar referencias
    this.animationFrames = {}
    this.notifications = []
  }
}