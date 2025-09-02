/**
 * MOBILE SYSTEM - Sistema de Compatibilidad Móvil
 *
 * Gestiona funcionalidades específicas para dispositivos móviles:
 * - Detección de dispositivo
 * - Controles táctiles adaptados
 * - Vibración
 */

export class MobileSystem {
  constructor(game) {
    console.log("📱 [MOBILE] Inicializando sistema móvil...")

    this.game = game
    this.isMobileDevice = this.detectMobileDevice()
    this.touchActive = false
    this.touchStartX = 0
    this.touchStartY = 0
    this.vibrationAvailable = this.checkVibration()
    this.swipeThreshold = 50 // Mínima distancia para considerar swipe
    this.longPressTimer = null
    this.longPressDelay = 500 // ms para considerar long press

    this.initializeListeners()

    console.log(`📱 [MOBILE] Sistema inicializado: ${this.isMobileDevice ? "Dispositivo móvil detectado" : "Escritorio detectado"}`)
  }

  /**
   * Detecta si es un dispositivo móvil
   */
  detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
    const touchEnabled = "ontouchstart" in window || navigator.maxTouchPoints > 0

    console.log(`📱 [MOBILE] Detección: userAgent=${isMobile}, touch=${touchEnabled}`)
    return isMobile || touchEnabled
  }

  /**
   * Verifica si la vibración está disponible
   */
  checkVibration() {
    const hasVibration = "vibrate" in navigator
    console.log(`📳 [MOBILE] Vibración disponible: ${hasVibration}`)
    return hasVibration
  }

  /**
   * Inicializa event listeners específicos para móvil
   */
  initializeListeners() {
    if (!this.isMobileDevice) return

    console.log("📱 [MOBILE] Configurando event listeners para móvil...")

    document.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false })
    document.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false })
    document.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: false })

    // Prevenir zoom y comportamientos indeseados
    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      },
      { passive: false },
    )

    window.addEventListener("resize", this.handleResize.bind(this))
    window.addEventListener("orientationchange", this.handleOrientationChange.bind(this))

    console.log("✅ [MOBILE] Event listeners configurados")
  }

  /**
   * Maneja eventos touch start
   */
  handleTouchStart(e) {
    if (!this.game.gameState.gameActive || this.game.gameState.gamePaused) return

    this.touchActive = true
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY

    // Iniciar timer para detección de long press
    this.longPressTimer = setTimeout(() => {
      this.handleLongPress(e.touches[0])
    }, this.longPressDelay)
  }

  /**
   * Maneja eventos touch move
   */
  handleTouchMove(e) {
    if (!this.touchActive) return
    if (!this.game.gameState.gameActive || this.game.gameState.gamePaused) return

    // Cancelar long press si hay movimiento
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    // Procesamiento adicional si es necesario
  }

  /**
   * Maneja eventos touch end
   */
  handleTouchEnd(e) {
    if (!this.touchActive) return
    if (!this.game.gameState.gameActive || this.game.gameState.gamePaused) return

    // Cancelar long press
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchEndX - this.touchStartX
    const deltaY = touchEndY - this.touchStartY

    // Detectar swipe
    if (Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold) {
      this.handleSwipe(deltaX, deltaY)
    } else {
      // Si no es swipe, podría ser un tap simple
      this.handleTap(e.changedTouches[0])
    }

    this.touchActive = false
  }

  /**
   * Maneja eventos de pulsación larga
   */
  handleLongPress(touch) {
    // Si el juego está activo y no pausado, cambiar estrella activa
    if (this.game.gameState.gameActive && !this.game.gameState.gamePaused) {
      console.log("📱 [MOBILE] Long press detectado - Cambiando estrella activa")
      this.game.switchActiveStar()
      this.vibrate([50, 50, 100])
    }
  }

  /**
   * Maneja eventos de tap (toque corto)
   */
  handleTap(touch) {
    // Implementación específica según necesidad
    console.log("📱 [MOBILE] Tap detectado")
  }

  /**
   * Maneja eventos de deslizamiento (swipe)
   */
  handleSwipe(deltaX, deltaY) {
    // Determinar dirección del swipe
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
    const distance = isHorizontal ? deltaX : deltaY
    const direction = distance > 0 ? 1 : -1

    // Aplicar navegación por cámara
    if (isHorizontal) {
      console.log(`📱 [MOBILE] Swipe horizontal ${direction > 0 ? "derecha" : "izquierda"}`)
      this.game.gameState.camera.x -= deltaX * 0.5
    } else {
      console.log(`📱 [MOBILE] Swipe vertical ${direction > 0 ? "abajo" : "arriba"}`)
      this.game.gameState.camera.y -= deltaY * 0.5
    }

    this.game.updateCameraPosition()
  }

  /**
   * Maneja el cambio de orientación del dispositivo
   */
  handleOrientationChange() {
    console.log("📱 [MOBILE] Cambio de orientación detectado")

    // Actualizar dimensiones
    setTimeout(() => {
      this.updateViewport()
    }, 300) // Pequeño delay para permitir que el cambio se complete
  }

  /**
   * Maneja el cambio de tamaño de ventana
   */
  handleResize() {
    this.updateViewport()
  }

  /**
   * Actualiza las dimensiones del viewport
   */
  updateViewport() {
    if (this.game && this.game.gameState) {
      this.game.gameState.viewport.width = window.innerWidth
      this.game.gameState.viewport.height = window.innerHeight - 60 // Ajustar por header
      console.log(
        `📱 [MOBILE] Viewport actualizado: ${this.game.gameState.viewport.width}x${this.game.gameState.viewport.height}`,
      )
    }
  }

  /**
   * Activa la vibración si está disponible
   */
  vibrate(pattern) {
    if (this.vibrationAvailable) {
      try {
        navigator.vibrate(pattern)
      } catch (error) {
        console.warn("⚠️ [MOBILE] Error activando vibración:", error)
      }
    }
  }

  /**
   * Para hook de eventos del juego
   */
  onStarShoot() {
    if (this.isMobileDevice) {
      this.vibrate(50)
    }
  }

  onStarInHole() {
    if (this.isMobileDevice) {
      this.vibrate([50, 50, 100])
    }
  }

  onMeteoriteHit() {
    if (this.isMobileDevice) {
      this.vibrate([100, 50, 100, 50, 100])
    }
  }

  onPowerupCollected() {
    if (this.isMobileDevice) {
      this.vibrate([25, 25, 25, 25])
    }
  }

  onLevelComplete() {
    if (this.isMobileDevice) {
      this.vibrate([50, 100, 50, 100, 200])
    }
  }

  onGameOver() {
    if (this.isMobileDevice) {
      this.vibrate([100, 50, 100, 50, 100, 50, 200])
    }
  }

  /**
   * Método para limpiar event listeners
   */
  cleanup() {
    if (!this.isMobileDevice) return

    document.removeEventListener("touchstart", this.handleTouchStart.bind(this))
    document.removeEventListener("touchmove", this.handleTouchMove.bind(this))
    document.removeEventListener("touchend", this.handleTouchEnd.bind(this))
    window.removeEventListener("resize", this.handleResize.bind(this))
    window.removeEventListener("orientationchange", this.handleOrientationChange.bind(this))

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
    }
  }
}