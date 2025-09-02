/**
 * ACHIEVEMENTS SYSTEM - Sistema de Logros
 *
 * Gestiona logros y achievements del juego:
 * - Definición de logros
 * - Seguimiento de progreso
 * - Notificaciones
 * - Persistencia
 */

export class AchievementManager {
  constructor(game) {
    console.log("🏆 [ACHIEVEMENTS] Inicializando sistema de logros...")

    this.game = game
    this.achievements = new Map()
    this.unlockedAchievements = new Set()
    this.progress = new Map()

    this.initializeAchievements()
    this.loadProgress()

    console.log("✅ [ACHIEVEMENTS] Sistema de logros inicializado")
  }

  /**
   * Inicializa todos los logros disponibles
   */
  initializeAchievements() {
    const achievementDefinitions = [
      // Logros básicos
      {
        id: "first_shot",
        name: "Primer Disparo",
        description: "Dispara tu primera estrella",
        icon: "⭐",
        type: "basic",
        condition: { type: "shots_fired", target: 1 },
      },
      {
        id: "first_goal",
        name: "Primera Meta",
        description: "Mete una estrella en el agujero correcto",
        icon: "🎯",
        type: "basic",
        condition: { type: "stars_in_hole", target: 1 },
      },
      {
        id: "level_complete",
        name: "Nivel Completado",
        description: "Completa tu primer nivel",
        icon: "🏁",
        type: "basic",
        condition: { type: "levels_completed", target: 1 },
      },

      // Logros de puntuación
      {
        id: "score_1000",
        name: "Mil Puntos",
        description: "Alcanza 1000 puntos",
        icon: "💯",
        type: "score",
        condition: { type: "score_reached", target: 1000 },
      },
      {
        id: "score_5000",
        name: "Cinco Mil",
        description: "Alcanza 5000 puntos",
        icon: "🔥",
        type: "score",
        condition: { type: "score_reached", target: 5000 },
      },
      {
        id: "score_10000",
        name: "Diez Mil",
        description: "Alcanza 10000 puntos",
        icon: "💎",
        type: "score",
        condition: { type: "score_reached", target: 10000 },
      },

      // Logros de precisión
      {
        id: "perfect_level",
        name: "Nivel Perfecto",
        description: "Completa un nivel sin fallar ningún disparo",
        icon: "🎯",
        type: "precision",
        condition: { type: "perfect_level", target: 1 },
      },
      {
        id: "sharpshooter",
        name: "Tirador Experto",
        description: "Consigue 10 disparos perfectos consecutivos",
        icon: "🏹",
        type: "precision",
        condition: { type: "consecutive_hits", target: 10 },
      },
      {
        id: "no_meteorite_hits",
        name: "Esquiva Meteoritos",
        description: "Completa 5 niveles sin golpear meteoritos",
        icon: "🛡️",
        type: "precision",
        condition: { type: "levels_no_meteorite", target: 5 },
      },

      // Logros de velocidad
      {
        id: "speed_demon",
        name: "Demonio de Velocidad",
        description: "Completa un nivel en menos de 30 segundos",
        icon: "⚡",
        type: "speed",
        condition: { type: "level_time_under", target: 30 },
      },
      {
        id: "lightning_fast",
        name: "Rápido como el Rayo",
        description: "Completa un nivel en menos de 15 segundos",
        icon: "⚡⚡",
        type: "speed",
        condition: { type: "level_time_under", target: 15 },
      },

      // Logros de resistencia
      {
        id: "marathon_player",
        name: "Jugador Maratón",
        description: "Juega durante 30 minutos seguidos",
        icon: "🏃",
        type: "endurance",
        condition: { type: "play_time_session", target: 1800 },
      },
      {
        id: "level_master",
        name: "Maestro de Niveles",
        description: "Alcanza el nivel 10",
        icon: "👑",
        type: "endurance",
        condition: { type: "level_reached", target: 10 },
      },
      {
        id: "century_club",
        name: "Club del Centenario",
        description: "Juega 100 partidas",
        icon: "💯",
        type: "endurance",
        condition: { type: "games_played", target: 100 },
      },

      // Logros especiales
      {
        id: "power_user",
        name: "Usuario Avanzado",
        description: "Usa todos los tipos de power-ups",
        icon: "🚀",
        type: "special",
        condition: { type: "powerups_used", target: ["slowmo", "shield", "magnet"] },
      },
      {
        id: "star_collector",
        name: "Coleccionista de Estrellas",
        description: "Usa las 3 estrellas diferentes en una partida",
        icon: "🌟",
        type: "special",
        condition: { type: "stars_used", target: ["yellow", "blue", "red"] },
      },
      {
        id: "explorer",
        name: "Explorador",
        description: "Visita todas las esquinas del tablero",
        icon: "🗺️",
        type: "special",
        condition: { type: "board_exploration", target: 100 },
      },
    ]

    achievementDefinitions.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement)
      this.progress.set(achievement.id, 0)
    })

    console.log(`🏆 [ACHIEVEMENTS] ${this.achievements.size} logros definidos`)
  }

  /**
   * Carga el progreso guardado
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem("stellarPoolAchievements")
      if (saved) {
        const data = JSON.parse(saved)
        this.unlockedAchievements = new Set(data.unlocked || [])

        if (data.progress) {
          Object.entries(data.progress).forEach(([id, value]) => {
            this.progress.set(id, value)
          })
        }
      }

      console.log(`🏆 [ACHIEVEMENTS] ${this.unlockedAchievements.size} logros desbloqueados`)
    } catch (error) {
      console.error("❌ [ACHIEVEMENTS] Error cargando progreso:", error)
    }
  }

  /**
   * Guarda el progreso actual
   */
  saveProgress() {
    try {
      const data = {
        unlocked: Array.from(this.unlockedAchievements),
        progress: Object.fromEntries(this.progress),
        lastSaved: Date.now(),
      }

      localStorage.setItem("stellarPoolAchievements", JSON.stringify(data))
    } catch (error) {
      console.error("❌ [ACHIEVEMENTS] Error guardando progreso:", error)
    }
  }

  /**
   * Actualiza el progreso de un logro
   */
  updateProgress(type, value = 1, data = null) {
    this.achievements.forEach((achievement, id) => {
      if (this.unlockedAchievements.has(id)) return

      const condition = achievement.condition
      if (condition.type !== type) return

      switch (type) {
        case "shots_fired":
        case "stars_in_hole":
        case "levels_completed":
        case "games_played":
          this.incrementProgress(id, value, condition.target)
          break

        case "score_reached":
        case "level_reached":
          if (value >= condition.target) {
            this.unlockAchievement(id)
          }
          break

        case "level_time_under":
          if (value <= condition.target) {
            this.unlockAchievement(id)
          }
          break

        case "consecutive_hits":
          this.handleConsecutiveHits(id, value, condition.target)
          break

        case "perfect_level":
        case "levels_no_meteorite":
          this.incrementProgress(id, value, condition.target)
          break

        case "powerups_used":
        case "stars_used":
          this.handleArrayProgress(id, value, condition.target)
          break

        case "play_time_session":
          this.updateSessionTime(id, value, condition.target)
          break

        case "board_exploration":
          this.updateExploration(id, value, condition.target)
          break
      }
    })

    this.saveProgress()
  }

  /**
   * Incrementa el progreso de un logro
   */
  incrementProgress(achievementId, increment, target) {
    const current = this.progress.get(achievementId) || 0
    const newProgress = current + increment

    this.progress.set(achievementId, newProgress)

    if (newProgress >= target) {
      this.unlockAchievement(achievementId)
    }
  }

  /**
   * Maneja hits consecutivos
   */
  handleConsecutiveHits(achievementId, isHit, target) {
    if (isHit) {
      this.incrementProgress(achievementId, 1, target)
    } else {
      this.progress.set(achievementId, 0) // Reset en fallo
    }
  }

  /**
   * Maneja progreso de arrays (power-ups, estrellas)
   */
  handleArrayProgress(achievementId, item, targetArray) {
    const current = this.progress.get(achievementId) || []

    if (!current.includes(item)) {
      current.push(item)
      this.progress.set(achievementId, current)

      if (current.length >= targetArray.length) {
        this.unlockAchievement(achievementId)
      }
    }
  }

  /**
   * Actualiza tiempo de sesión
   */
  updateSessionTime(achievementId, sessionTime, target) {
    if (sessionTime >= target) {
      this.unlockAchievement(achievementId)
    }
  }

  /**
   * Actualiza exploración del tablero
   */
  updateExploration(achievementId, position, target) {
    const current = this.progress.get(achievementId) || new Set()
    const gridKey = `${Math.floor(position.x / 100)},${Math.floor(position.y / 100)}`

    current.add(gridKey)
    this.progress.set(achievementId, current)

    if (current.size >= target) {
      this.unlockAchievement(achievementId)
    }
  }

  /**
   * Desbloquea un logro
   */
  unlockAchievement(achievementId) {
    if (this.unlockedAchievements.has(achievementId)) return

    const achievement = this.achievements.get(achievementId)
    if (!achievement) return

    this.unlockedAchievements.add(achievementId)

    console.log(`🏆 [ACHIEVEMENTS] Logro desbloqueado: ${achievement.name}`)

    // Mostrar notificación
    this.showAchievementNotification(achievement)

    // Feedback del juego
    this.game.soundSystem?.play("powerup")
    this.game.mobileSystem?.vibrate([100, 50, 100])

    this.saveProgress()
  }

  /**
   * Muestra notificación de logro
   */
  showAchievementNotification(achievement) {
    const notification = document.createElement("div")
    notification.className = "achievement-notification"
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">¡Logro Desbloqueado!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      </div>
    `

    // Estilos inline para la notificación
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1a1a3e 0%, #2d1b69 100%);
      border: 2px solid #ffeb3b;
      border-radius: 10px;
      padding: 15px;
      color: white;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 0 20px rgba(255, 235, 59, 0.5);
      animation: slideInFromRight 0.5s ease-out;
    `

    // Añadir estilos de animación si no existen
    if (!document.getElementById("achievementStyles")) {
      const style = document.createElement("style")
      style.id = "achievementStyles"
      style.textContent = `
        @keyframes slideInFromRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .achievement-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .achievement-icon {
          font-size: 24px;
          min-width: 30px;
        }
        .achievement-title {
          font-weight: bold;
          color: #ffeb3b;
          font-size: 14px;
        }
        .achievement-name {
          font-weight: bold;
          margin: 2px 0;
        }
        .achievement-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(notification)

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.style.animation = "slideInFromRight 0.5s ease-out reverse"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 500)
    }, 5000)
  }

  /**
   * Obtiene todos los logros desbloqueados
   */
  getUnlockedAchievements() {
    return Array.from(this.unlockedAchievements).map((id) => ({
      ...this.achievements.get(id),
      unlockedAt: Date.now(), // Podrías guardar esto también
    }))
  }

  /**
   * Obtiene el progreso de todos los logros
   */
  getAllProgress() {
    const result = []

    this.achievements.forEach((achievement, id) => {
      const progress = this.progress.get(id) || 0
      const isUnlocked = this.unlockedAchievements.has(id)

      let progressPercentage = 0
      if (isUnlocked) {
        progressPercentage = 100
      } else {
        const condition = achievement.condition
        if (typeof condition.target === "number") {
          progressPercentage = Math.min((progress / condition.target) * 100, 100)
        } else if (Array.isArray(condition.target)) {
          progressPercentage = Math.min((progress.length / condition.target.length) * 100, 100)
        }
      }

      result.push({
        ...achievement,
        progress: progress,
        progressPercentage: Math.round(progressPercentage),
        isUnlocked: isUnlocked,
      })
    })

    return result.sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1
      }
      return b.progressPercentage - a.progressPercentage
    })
  }

  /**
   * Obtiene estadísticas de logros
   */
  getStats() {
    const total = this.achievements.size
    const unlocked = this.unlockedAchievements.size
    const percentage = Math.round((unlocked / total) * 100)

    return {
      total,
      unlocked,
      percentage,
      remaining: total - unlocked,
    }
  }

  /**
   * Resetea todos los logros (para testing)
   */
  resetAllAchievements() {
    this.unlockedAchievements.clear()
    this.progress.clear()
    this.achievements.forEach((_, id) => {
      this.progress.set(id, 0)
    })
    this.saveProgress()
    console.log("🏆 [ACHIEVEMENTS] Todos los logros reseteados")
  }

  // ==========================================
  // EVENTOS DEL JUEGO - CORREGIDOS
  // ==========================================

  onGameStart() {
    this.updateProgress("games_played", 1)
  }

  onStarShoot() {
    this.updateProgress("shots_fired", 1)
  }

  onStarInHole() {
    this.updateProgress("stars_in_hole", 1)
    this.updateProgress("consecutive_hits", true)
  }

  onStarMiss() {
    this.updateProgress("consecutive_hits", false)
  }

  onLevelComplete(levelData) {
    this.updateProgress("levels_completed", 1)
    this.updateProgress("level_time_under", levelData.timeUsed)

    if (levelData.isPerfect) {
      this.updateProgress("perfect_level", 1)
    }

    if (levelData.noMeteoriteHits) {
      this.updateProgress("levels_no_meteorite", 1)
    }
  }

  onScoreUpdate(score) {
    this.updateProgress("score_reached", score)
  }

  onLevelReached(level) {
    this.updateProgress("level_reached", level)
  }

  onPowerupUsed(type) {
    this.updateProgress("powerups_used", type)
  }

  onStarUsed(color) {
    this.updateProgress("stars_used", color)
  }

  onCameraMove(position) {
    this.updateProgress("board_exploration", position)
  }

  onSessionTime(seconds) {
    this.updateProgress("play_time_session", seconds)
  }

  // CORREGIDO: Métodos faltantes añadidos
  onGameOver() {
    console.log("🏆 [ACHIEVEMENTS] Game Over - actualizando estadísticas finales")
    // Aquí podrías añadir lógica específica para cuando termina el juego
  }

  onLevelComplete() {
    console.log("🏆 [ACHIEVEMENTS] Nivel completado")
    // Método ya existe arriba, pero añadido para evitar errores
  }
}