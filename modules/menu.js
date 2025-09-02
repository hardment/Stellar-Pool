/**
 * MENU SYSTEM - Sistema de Menús
 *
 * Gestiona todos los menús del juego:
 * - Menú principal
 * - Configuración
 * - Puntuaciones altas
 * - Instrucciones
 */

export class MenuSystem {
  constructor(game) {
    console.log("📋 [MENU] Inicializando sistema de menú...")

    this.game = game
    this.domElements = {}
    this.isVisible = false
    this.isInitialized = false

    // CORREGIDO: Inicializar inmediatamente sin esperar
    this.initialize()
  }

  /**
   * CORREGIDO: Inicializa el sistema de menú de forma síncrona
   */
  initialize() {
    console.log("🚀 [MENU] Inicializando elementos del menú...")
    
    this.initializeElements()

    try {
      if (!this.initializeElements()) {
        console.error("❌ [MENU] Error inicializando elementos")
        // CORREGIDO: Reintentar después de un breve delay
        setTimeout(() => {
          console.log("🔄 [MENU] Reintentando inicialización...")
          this.initialize()
        }, 100)
        return
      }

      this.setupEventListeners()
      this.setupAnimations()
      this.isInitialized = true

      console.log("✅ [MENU] Sistema de menú inicializado correctamente")
    } catch (error) {
      console.error("❌ [MENU] Error en inicialización:", error)
    }
  }

  /**
   * CORREGIDO: Inicializa las referencias a elementos DOM con mejor logging
   */
  initializeElements() {
    console.log("🔍 [MENU] Buscando elementos DOM...")

    const elementIds = [
      "menuOverlay",
      "startGameButton",
      "instructionsButton",
      "highScoresButton",
      "timeSelect",
      "aimLineToggle",
      "pointerStyleSelect",
      "trajectoryToggle",
      "controlModeSelect",
      "soundToggle",
      "scoresModal",
      "closeScoresButton",
    ]

    let foundElements = 0
    const missingElements = []

    elementIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        this.domElements[id] = element
        foundElements++
        console.log(`✅ [MENU] Elemento encontrado: ${id}`)
      } else {
        missingElements.push(id)
        console.warn(`⚠️ [MENU] Elemento no encontrado: ${id}`)
      }
    })

    // CORREGIDO: Logging detallado de elementos faltantes
    if (missingElements.length > 0) {
      console.error("❌ [MENU] Elementos faltantes:", missingElements)
      console.log(
        "🔍 [MENU] Elementos disponibles en DOM:",
        Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
      )
    }

    // Verificar elemento crítico
    if (!this.domElements.menuOverlay) {
      console.error("❌ [MENU] menuOverlay no encontrado - menú no funcionará")
      return false
    }

    if (!this.domElements.startGameButton) {
      console.error("❌ [MENU] startGameButton no encontrado - no se puede iniciar juego")
      return false
    }

    console.log(`📊 [MENU] ${foundElements}/${elementIds.length} elementos encontrados`)
    return foundElements >= 2 // Al menos menuOverlay y startGameButton
  }
  
  /**
   * CORREGIDO: Configura los event listeners del menú con elementos interactivos
   */
  setupEventListeners() {
    console.log("🎧 [MENU] Configurando event listeners del menú...")

    // Limpiar listeners existentes para evitar duplicados
    this.removeExistingListeners()

    // CORREGIDO: Configurar todos los botones
    this.setupAllButtons()

    // CORREGIDO: Configurar elementos interactivos (selects, checkboxes)
    this.setupInteractiveElements()

    // Event listeners para cambios en configuración
    this.setupConfigurationListeners()

    console.log("✅ [MENU] Todos los event listeners configurados")
  }

  /**
   * NUEVO: Configura elementos interactivos (selects, checkboxes) SIN animaciones de hover
   */
  setupInteractiveElements() {
    console.log("🎛️ [MENU] Configurando elementos interactivos...")

    // Configurar selects
    const selects = ["timeSelect", "pointerStyleSelect", "controlModeSelect"]
    selects.forEach((selectId) => {
      const select = this.domElements[selectId]
      if (select) {
        // CORREGIDO: Prevenir interferencias de hover del contenedor padre
        const parentGroup = select.closest(".option-group")
        if (parentGroup) {
          parentGroup.style.pointerEvents = "auto"
        }

        select.addEventListener("change", (e) => {
          console.log(`🎛️ [MENU] Select cambiado: ${selectId} = ${e.target.value}`)
          this.saveCurrentSettings()
        })

        console.log(`✅ [MENU] Select configurado: ${selectId}`)
      }
    })

    // Configurar checkboxes
    const checkboxes = ["aimLineToggle", "trajectoryToggle", "soundToggle"]
    checkboxes.forEach((checkboxId) => {
      const checkbox = this.domElements[checkboxId]
      if (checkbox) {
        // CORREGIDO: Prevenir interferencias de hover del contenedor padre
        const parentGroup = checkbox.closest(".option-group")
        if (parentGroup) {
          parentGroup.style.pointerEvents = "auto"
        }

        checkbox.addEventListener("change", (e) => {
          console.log(`☑️ [MENU] Checkbox cambiado: ${checkboxId} = ${e.target.checked}`)
          this.saveCurrentSettings()
        })

        console.log(`✅ [MENU] Checkbox configurado: ${checkboxId}`)
      }
    })
  }

  /**
   * CORREGIDO: Configuración robusta de TODOS los botones
   */
  setupAllButtons() {
    // Configurar botón de inicio
    this.setupButton("startGameButton", "🎮 [MENU] Botón iniciar presionado", () => {
      this.handleStartGame()
    })

    // Configurar botón de instrucciones
    this.setupButton("instructionsButton", "📖 [MENU] Botón instrucciones presionado", () => {
      this.showInstructions()
    })

    // Configurar botón de puntuaciones
    this.setupButton("highScoresButton", "🏆 [MENU] Botón puntuaciones presionado", () => {
      this.showHighScores()
    })

    // Configurar botón de cerrar puntuaciones
    this.setupButton("closeScoresButton", "🏆 [MENU] Cerrando puntuaciones", () => {
      this.hideHighScores()
    })
  }
  
  /**
   * NUEVO: Método genérico para configurar cualquier botón
   */
  setupButton(buttonId, logMessage, callback) {
    const button = this.domElements[buttonId]
    if (!button) {
      console.warn(`⚠️ [MENU] Botón no encontrado: ${buttonId}`)
      return
    }

    // Asegurar que el botón esté visible y habilitado
    button.style.display = "inline-block"
    button.style.visibility = "visible"
    button.style.pointerEvents = "auto"
    button.disabled = false
    button.classList.remove("loading")

    // Handler unificado
    const handleClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log(logMessage)
      console.log(`🔍 [MENU] Elemento: ${buttonId}, Tipo evento: ${e.type}`)

      try {
        callback()
      } catch (error) {
        console.error(`❌ [MENU] Error en ${buttonId}:`, error)
      }
    }

    // Múltiples event listeners para asegurar funcionamiento
    button.addEventListener("touchstart", handleClick, { passive: false })

    // Log de verificación
    console.log(`✅ [MENU] Botón configurado: ${buttonId}`)
    console.log(`  - Display: ${getComputedStyle(button).display}`)
    console.log(`  - Visibility: ${getComputedStyle(button).visibility}`)
    console.log(`  - Pointer Events: ${getComputedStyle(button).pointerEvents}`)
  }
  
  /**
   * Remueve listeners existentes para evitar duplicados
   */
  removeExistingListeners() {
    const elements = [
      this.domElements.startGameButton,
      this.domElements.instructionsButton,
      this.domElements.highScoresButton,
      this.domElements.closeScoresButton,
    ]

    elements.forEach((element) => {
      if (element) {
        const newElement = element.cloneNode(true)
        element.parentNode.replaceChild(newElement, element)
        // Actualizar referencia
        this.domElements[element.id] = newElement
      }
    })
  }

  /**
   * Configura listeners para cambios de configuración
   */
  setupConfigurationListeners() {
    const configElements = [
      "timeSelect",
      "aimLineToggle",
      "pointerStyleSelect",
      "trajectoryToggle",
      "controlModeSelect",
      "soundToggle",
    ]

    configElements.forEach((elementId) => {
      const element = this.domElements[elementId]
      if (element) {
        element.addEventListener("change", () => {
          console.log(`⚙️ [MENU] Configuración cambiada: ${elementId}`)
          this.saveCurrentSettings()
        })
      }
    })
  }
  
  /**
   * Configura animaciones del menú
   */
  setupAnimations() {
    // Añadir clases de animación a elementos
    if (this.domElements.menuOverlay) {
      this.domElements.menuOverlay.classList.add("menu-animated")
    }

    // Configurar animaciones de botones
    const buttons = [
      this.domElements.startGameButton,
      this.domElements.instructionsButton,
      this.domElements.highScoresButton,
    ]

    buttons.forEach((button, index) => {
      if (button) {
        button.style.animationDelay = `${0.8 + index * 0.1}s`
      }
    })
  }

  /**
   * CORREGIDO: Maneja el inicio del juego con mejor logging
   */
  handleStartGame() {
    console.log("🎮 [MENU] === INICIANDO PROCESO DE JUEGO ===")

    try {
      // Verificar que el sistema esté listo
      if (!this.isInitialized) {
        console.error("❌ [MENU] Sistema no inicializado")
        return
      }

      if (!this.game) {
        console.error("❌ [MENU] Objeto game no disponible")
        return
      }

      // Añadir clase de loading al botón
      const startButton = this.domElements.startGameButton
      if (startButton) {
        startButton.classList.add("loading")
        startButton.disabled = true
        console.log("🔄 [MENU] Botón en estado loading")
      }

      // Obtener configuración
      const settings = this.getGameSettings()
      console.log("⚙️ [MENU] Configuración obtenida:", settings)

      // Validar configuración
      if (!this.validateSettings(settings)) {
        console.error("❌ [MENU] Configuración inválida")
        this.resetStartButton()
        return
      }

      console.log("🎯 [MENU] Iniciando secuencia de juego...")

      // Verificar método startGame
      if (typeof this.game.startGame !== "function") {
        console.error("❌ [MENU] Método startGame no existe en game object")
        console.log("🔍 [MENU] Métodos disponibles en game:", Object.getOwnPropertyNames(this.game))
        this.resetStartButton()
        return
      }

      // Ocultar menú con animación
      this.hide()

      // Iniciar juego después de la animación
      setTimeout(() => {
        console.log("🚀 [MENU] Llamando game.startGame()...")
        this.game.startGame(settings)
        console.log("✅ [MENU] Juego iniciado correctamente")
        this.resetStartButton()
      }, 300)
    } catch (error) {
      console.error("❌ [MENU] Error iniciando juego:", error)
      console.error("❌ [MENU] Stack trace:", error.stack)
      this.resetStartButton()
      this.show()
      alert("Error al iniciar el juego. Por favor, verifica la configuración.")
    }
  }
  
  /**
   * Resetea el botón de inicio
   */
  resetStartButton() {
    const startButton = this.domElements.startGameButton
    if (startButton) {
      startButton.classList.remove("loading")
      startButton.disabled = false
      console.log("🔄 [MENU] Botón reseteado")
    }
  }

  /**
   * Valida la configuración del juego
   */
  validateSettings(settings) {
    const requiredFields = ["timeLimit", "showAimLine", "controlMode", "pointerStyle", "showTrajectory", "soundEnabled"]

    for (const field of requiredFields) {
      if (settings[field] === undefined || settings[field] === null) {
        console.error(`❌ [MENU] Campo requerido faltante: ${field}`)
        return false
      }
    }

    // Validar rangos
    if (settings.timeLimit < 30 || settings.timeLimit > 120) {
      console.error("❌ [MENU] Tiempo límite fuera de rango")
      return false
    }

    return true
  }

  /**
   * Obtiene la configuración actual del menú
   */
  getGameSettings() {
    const settings = {
      timeLimit: Number.parseInt(this.domElements.timeSelect?.value || "60"),
      showAimLine: this.domElements.aimLineToggle?.checked || true,
      controlMode: this.domElements.controlModeSelect?.value || "flipper",
      pointerStyle: this.domElements.pointerStyleSelect?.value || "orbital",
      showTrajectory: this.domElements.trajectoryToggle?.checked || true,
      soundEnabled: this.domElements.soundToggle?.checked || false,
    }

    console.log("📋 [MENU] Configuración actual:", settings)
    return settings
  }

  /**
   * Guarda la configuración actual
   */
  saveCurrentSettings() {
    try {
      const settings = this.getGameSettings()
      if (this.game && this.game.storageManager) {
        this.game.storageManager.saveSettings(settings)
        console.log("💾 [MENU] Configuración guardada:", settings)
      }
    } catch (error) {
      console.warn("⚠️ [MENU] Error guardando configuración:", error)
    }
  }

  /**
   * Muestra las instrucciones del juego
   */
  showInstructions() {
    console.log("📖 [MENU] Mostrando instrucciones...")

    const instructions = `🌟 STELLAR POOL - INSTRUCCIONES 🌟

🎯 OBJETIVO:
- Mete las estrellas en los agujeros activos (brillan en amarillo)
- Completa todos los niveles antes de que se acabe el tiempo

🎮 CONTROLES:
- Arrastra una estrella para apuntar y disparar
- Usa las flechas del teclado para mover la cámara
- Presiona ESPACIO para cambiar de estrella
- Presiona ESC para pausar el juego

⭐ ESTRELLAS:
- Amarilla: Estrella principal
- Azul: Estrella de precisión  
- Roja: Estrella de potencia

🚀 POWER-UPS:
- Morado: Cámara lenta (5 segundos)
- Azul: Escudo protector (8 segundos)
- Naranja: Imán magnético (6 segundos)

💥 OBSTÁCULOS:
- Meteoritos rojos: Te quitan puntos y te regresan al inicio
- Agujeros incorrectos: Penalización de puntos`

    alert(instructions)
  }
  
}