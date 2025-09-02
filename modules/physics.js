/**
 * PHYSICS ENGINE - Motor de Física
 *
 * Gestiona todos los cálculos de física para el juego:
 * - Movimiento de estrellas
 * - Colisiones
 * - Rebotes y trayectorias
 */

export class PhysicsEngine {
  constructor(game) {
    console.log("🧪 [PHYSICS] Inicializando motor de física...")

    this.game = game
    this.gravity = 0.2
    this.friction = 0.98
    this.minSpeed = 0.5
    this.stars = []
    this.holes = []
    this.meteorites = []
    this.enabled = true
    this.collisionThreshold = 25
    this.activeHole = null
    this.lastUpdateTime = 0
    this.useDeltaTime = true

    // Constantes
    this.MAX_VELOCITY = 25
    this.STAR_RADIUS = 16
    this.HOLE_RADIUS = 20
    this.METEORITE_RADIUS = 15
    this.POWER_FACTOR = 0.12
    this.STAR_PROPERTIES = {
      yellow: { mass: 1, restitution: 0.8 },
      blue: { mass: 0.8, restitution: 0.9 },
      red: { mass: 1.2, restitution: 0.7 },
    }

    console.log("✅ [PHYSICS] Motor de física inicializado")
  }

  /**
   * Inicializa el motor de física
   */
  initialize() {
    console.log("🚀 [PHYSICS] Configurando elementos físicos...")

    this.initializeStars()
    this.initializeHoles()
    this.initializeMeteorites()
    this.setActiveHole()

    this.lastUpdateTime = performance.now()

    console.log("✅ [PHYSICS] Elementos físicos configurados")
  }

  /**
   * Inicializa las estrellas con propiedades físicas
   */
  initializeStars() {
    this.stars = []
    const starElements = [
      { id: "star1", type: "yellow" },
      { id: "star2", type: "blue" },
      { id: "star3", type: "red" },
    ]

    starElements.forEach((starInfo) => {
      const element = document.getElementById(starInfo.id)
      if (!element) {
        console.error(`❌ [PHYSICS] Estrella ${starInfo.id} no encontrada`)
        return
      }

      // Propiedades físicas
      const starProps = this.STAR_PROPERTIES[starInfo.type]
      const star = {
        id: starInfo.id,
        element: element,
        type: starInfo.type,
        x: parseInt(element.style.left) || 0,
        y: parseInt(element.style.top) || 0,
        velocity: { x: 0, y: 0 },
        mass: starProps.mass,
        restitution: starProps.restitution,
        moving: false,
        inHole: false,
        rotation: 0,
        radius: this.STAR_RADIUS,
      }

      this.stars.push(star)
      console.log(
        `⭐ [PHYSICS] Estrella ${star.id} inicializada en (${star.x}, ${star.y}) con tipo ${star.type}`,
      )
    })
  }

  /**
   * Inicializa los agujeros con propiedades físicas
   */
  initializeHoles() {
    this.holes = []
    const holeElements = document.querySelectorAll(".hole")

    holeElements.forEach((element, index) => {
      const hole = {
        id: `hole${index + 1}`,
        element: element,
        x: parseInt(element.style.left) || 0,
        y: parseInt(element.style.top) || 0,
        radius: this.HOLE_RADIUS,
        isActive: element.classList.contains("active"),
      }

      // Si usa transformTranslate, extraer la posición
      if (element.style.transform?.includes("translate")) {
        const matches = element.style.transform.match(/translate\((.+)%,\s*(.+)%\)/)
        if (matches && matches.length === 3) {
          // Ajustar por el % y el centro del elemento padre
          const board = document.getElementById("unifiedBoard")
          if (board) {
            const boardWidth = board.offsetWidth
            const boardHeight = board.offsetHeight

            hole.x = boardWidth * (parseFloat(matches[1]) / 100)
            hole.y = boardHeight * (parseFloat(matches[2]) / 100)
          }
        }
      }

      this.holes.push(hole)
      console.log(
        `🕳️ [PHYSICS] Agujero ${hole.id} inicializado en (${hole.x}, ${hole.y}), activo: ${hole.isActive}`,
      )
    })

    console.log(`✅ [PHYSICS] ${this.holes.length} agujeros inicializados`)
  }

  /**
   * Inicializa los meteoritos con propiedades físicas
   */
  initializeMeteorites() {
    this.meteorites = []
    const meteoriteElements = document.querySelectorAll(".meteorite")

    meteoriteElements.forEach((element, index) => {
      const meteorite = {
        id: `meteorite${index + 1}`,
        element: element,
        x: parseInt(element.style.left) || 0,
        y: parseInt(element.style.top) || 0,
        radius: this.METEORITE_RADIUS,
        velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
        rotationSpeed: (Math.random() - 0.5) * 4,
        rotation: 0,
      }

      this.meteorites.push(meteorite)
      console.log(
        `☄️ [PHYSICS] Meteorito ${meteorite.id} inicializado en (${meteorite.x}, ${meteorite.y})`,
      )
    })

    console.log(`✅ [PHYSICS] ${this.meteorites.length} meteoritos inicializados`)
  }

  /**
   * Configura el agujero activo de forma aleatoria
   */
  setActiveHole() {
    // Remover clase activa de todos
    this.holes.forEach((hole) => {
      if (hole.element) {
        hole.element.classList.remove("active")
        hole.isActive = false
      }
    })

    // Elegir uno aleatorio
    const randomIndex = Math.floor(Math.random() * this.holes.length)
    const activeHole = this.holes[randomIndex]
    if (activeHole && activeHole.element) {
      activeHole.element.classList.add("active")
      activeHole.isActive = true
      this.activeHole = activeHole
      console.log(`🌟 [PHYSICS] Agujero activo: ${activeHole.id} en (${activeHole.x}, ${activeHole.y})`)
    }
  }

  /**
   * CORREGIDO: Dispara una estrella con física mejorada
   */
  shootStar(gameState, dragDistance, dragTime) {
    const selectedStar = gameState.selectedStar
    if (!selectedStar || !this.enabled) return

    // Buscar la estrella en nuestro array
    const star = this.stars.find((s) => s.id === selectedStar)
    if (!star) return

    // Calcular dirección y poder
    const dx = gameState.startPos.x - gameState.currentPos.x
    const dy = gameState.startPos.y - gameState.currentPos.y
    const directionLength = Math.sqrt(dx * dx + dy * dy)

    // Evitar división por cero
    if (directionLength === 0) return

    // Calcular velocidad basada en distancia y tiempo
    let power = dragDistance * this.POWER_FACTOR
    power = Math.min(power, this.MAX_VELOCITY) // Limitar poder máximo

    // Calcular velocidad final, considerando la masa de la estrella
    const vx = (dx / directionLength) * power * (1 / star.mass)
    const vy = (dy / directionLength) * power * (1 / star.mass)

    // Aplicar velocidad a la estrella
    star.velocity.x = vx
    star.velocity.y = vy
    star.moving = true
    star.inHole = false

    console.log(
      `🚀 [PHYSICS] Estrella ${selectedStar} disparada con velocidad (${vx.toFixed(2)}, ${vy.toFixed(2)}) y poder ${power.toFixed(2)}`,
    )
  }

  /**
   * CORREGIDO: Método principal de actualización física
   */
  update(gameState) {
    if (!this.enabled) return

    // Calcular delta time para física más consistente
    const currentTime = performance.now()
    let deltaTime = (currentTime - this.lastUpdateTime) / 16.67 // Normalizado a ~60fps
    this.lastUpdateTime = currentTime

    // Limitar deltaTime para evitar saltos grandes
    if (deltaTime > 3) deltaTime = 1
    if (!this.useDeltaTime) deltaTime = 1

    // Actualizar estrellas
    this.updateStars(deltaTime)

    // Actualizar meteoritos
    this.updateMeteorites(deltaTime)

    // Actualizar posición de la cámara si hay una estrella en movimiento
    this.updateCamera(gameState)
  }

  /**
   * Actualiza la posición y física de las estrellas
   */
  updateStars(deltaTime) {
    this.stars.forEach((star) => {
      if (!star.moving || star.inHole) return

      // Aplicar fricción
      star.velocity.x *= this.friction
      star.velocity.y *= this.friction

      // Actualizar posición con deltaTime
      star.x += star.velocity.x * deltaTime
      star.y += star.velocity.y * deltaTime

      // Actualizar rotación
      star.rotation += (star.velocity.x * 0.1) * deltaTime

      // Verificar colisiones con límites
      this.checkBoundaryCollisions(star)

      // Verificar colisiones con agujeros
      this.checkHoleCollisions(star)

      // Verificar colisiones con meteoritos
      this.checkMeteoriteCollisions(star)

      // Detener si velocidad es muy baja
      const speed = Math.sqrt(star.velocity.x * star.velocity.x + star.velocity.y * star.velocity.y)
      if (speed < this.minSpeed) {
        star.velocity.x = 0
        star.velocity.y = 0
        star.moving = false
      }

      // Actualizar elemento DOM
      this.updateStarElement(star)
    })
  }

  /**
   * Actualiza los elementos visuales de estrellas
   */
  updateStarElement(star) {
    if (star.element) {
      star.element.style.left = `${star.x}px`
      star.element.style.top = `${star.y}px`

      // Actualizar rotación
      star.element.style.transform = `rotate(${star.rotation}rad)`

      // Si está en agujero, aplicar animación adicional
      if (star.inHole) {
        star.element.style.transform += " scale(0.5)" // Reducir tamaño
        star.element.style.opacity = "0.3"
      } else {
        star.element.style.opacity = "1"
      }
    }
  }

  /**
   * Actualiza la posición y física de los meteoritos
   */
  updateMeteorites(deltaTime) {
    this.meteorites.forEach((meteorite) => {
      // Actualizar posición
      meteorite.x += meteorite.velocity.x * deltaTime
      meteorite.y += meteorite.velocity.y * deltaTime

      // Actualizar rotación
      meteorite.rotation += meteorite.rotationSpeed * 0.01 * deltaTime

      // Rebotar en los límites
      const boardWidth = 1600 // Ancho del tablero unificado
      const boardHeight = 800 // Alto del tablero unificado
      const radius = meteorite.radius

      if (meteorite.x < radius || meteorite.x > boardWidth - radius) {
        meteorite.velocity.x *= -1
        meteorite.x = meteorite.x < radius ? radius : boardWidth - radius
      }

      if (meteorite.y < radius || meteorite.y > boardHeight - radius) {
        meteorite.velocity.y *= -1
        meteorite.y = meteorite.y < radius ? radius : boardHeight - radius
      }

      // Actualizar elemento DOM
      if (meteorite.element) {
        meteorite.element.style.left = `${meteorite.x}px`
        meteorite.element.style.top = `${meteorite.y}px`
        meteorite.element.style.transform = `rotate(${meteorite.rotation}rad)`
      }
    })
  }

  /**
   * Verifica colisiones con los límites del tablero
   */
  checkBoundaryCollisions(star) {
    const boardWidth = 1600 // Ancho del tablero unificado
    const boardHeight = 800 // Alto del tablero unificado
    const radius = star.radius

    // Colisión con bordes horizontales
    if (star.x < radius) {
      star.x = radius
      star.velocity.x *= -star.restitution
      this.game.onStarBounce(star.id)
    } else if (star.x > boardWidth - radius) {
      star.x = boardWidth - radius
      star.velocity.x *= -star.restitution
      this.game.onStarBounce(star.id)
    }

    // Colisión con bordes verticales
    if (star.y < radius) {
      star.y = radius
      star.velocity.y *= -star.restitution
      this.game.onStarBounce(star.id)
    } else if (star.y > boardHeight - radius) {
      star.y = boardHeight - radius
      star.velocity.y *= -star.restitution
      this.game.onStarBounce(star.id)
    }
  }

  /**
   * Verifica colisiones con agujeros
   */
  checkHoleCollisions(star) {
    this.holes.forEach((hole) => {
      const dx = star.x - hole.x
      const dy = star.y - hole.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Si está lo suficientemente cerca del agujero
      if (distance < this.collisionThreshold) {
        // Si es el agujero activo
        if (hole.isActive) {
          console.log(`🎯 [PHYSICS] Estrella ${star.id} entró en agujero ${hole.id}`)
          star.inHole = true
          star.moving = false
          star.velocity.x = 0
          star.velocity.y = 0

          // Notificar al juego
          this.game.onStarInHole(star.id)
        } else {
          // Si NO es el agujero activo, rebote
          const angle = Math.atan2(dy, dx)
          const power = 2
          star.velocity.x = Math.cos(angle) * power
          star.velocity.y = Math.sin(angle) * power
        }
      }
    })
  }

  /**
   * Verifica colisiones con meteoritos
   */
  checkMeteoriteCollisions(star) {
    this.meteorites.forEach((meteorite) => {
      const dx = star.x - meteorite.x
      const dy = star.y - meteorite.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Si hay colisión
      if (distance < star.radius + meteorite.radius) {
        console.log(`💥 [PHYSICS] Colisión entre ${star.id} y ${meteorite.id}`)

        // Velocidad del rebote
        const angle = Math.atan2(dy, dx)
        const power = 5
        star.velocity.x = Math.cos(angle) * power
        star.velocity.y = Math.sin(angle) * power

        // Notificar al juego
        this.game.onStarHitMeteorite(star.id)
      }
    })
  }

  /**
   * Actualiza la cámara para seguir estrellas en movimiento
   */
  updateCamera(gameState) {
    const movingStars = this.stars.filter((star) => star.moving && !star.inHole)

    if (movingStars.length > 0) {
      // Calcular el punto medio de todas las estrellas en movimiento
      let totalX = 0
      let totalY = 0

      movingStars.forEach((star) => {
        totalX += star.x
        totalY += star.y
      })

      const avgX = totalX / movingStars.length
      const avgY = totalY / movingStars.length

      // Ajustar la cámara gradualmente (interpolación suave)
      const cameraSpeed = 0.05
      gameState.camera.x = gameState.camera.x + (avgX - gameState.camera.x) * cameraSpeed
      gameState.camera.y = gameState.camera.y + (avgY - gameState.camera.y) * cameraSpeed

      this.game.updateCameraPosition()
    }
  }

  /**
   * Cambia la estrella activa
   */
  switchActiveStar() {
    const availableStars = this.stars.filter((star) => !star.moving && !star.inHole)
    if (availableStars.length === 0) return

    // Buscar la estrella seleccionada actualmente
    const selectedStarId = this.game.gameState.selectedStar
    let selectedIndex = -1

    if (selectedStarId) {
      selectedIndex = availableStars.findIndex((star) => star.id === selectedStarId)
    }

    // Seleccionar la siguiente estrella disponible
    const nextIndex = (selectedIndex + 1) % availableStars.length
    const nextStar = availableStars[nextIndex]

    // Actualizar selección
    this.game.gameState.selectedStar = nextStar.id
    console.log(`⭐ [PHYSICS] Estrella activa cambiada a ${nextStar.id}`)

    // Actualizar visualmente
    this.stars.forEach((star) => {
      if (star.element) {
        star.element.classList.toggle("selected", star.id === nextStar.id)
      }
    })
  }

  /**
   * Comprueba si alguna estrella está en movimiento
   */
  isAnyStarMoving() {
    return this.stars.some((star) => star.moving)
  }

  /**
   * Resetea las estrellas a sus posiciones iniciales
   */
  resetStars() {
    console.log("🔄 [PHYSICS] Reseteando estrellas...")

    this.stars.forEach((star, index) => {
      // Posiciones base
      const basePositions = [
        { x: 800, y: 400 }, // star1
        { x: 850, y: 450 }, // star2
        { x: 750, y: 450 }, // star3
      ]

      // Resetear propiedades físicas
      star.x = basePositions[index].x
      star.y = basePositions[index].y
      star.velocity.x = 0
      star.velocity.y = 0
      star.moving = false
      star.inHole = false
      star.rotation = 0

      // Actualizar DOM
      this.updateStarElement(star)
      if (star.element) {
        star.element.classList.remove("selected")
      }
    })

    // Resetear estrella seleccionada
    if (this.game.gameState) {
      this.game.gameState.selectedStar = "star1"
      const starElement = document.getElementById("star1")
      if (starElement) {
        starElement.classList.add("selected")
      }
    }

    console.log("✅ [PHYSICS] Estrellas reseteadas")
  }

  /**
   * Expande el área de juego para niveles más avanzados
   */
  expandGameArea() {
    console.log("🌌 [PHYSICS] Expandiendo área de juego...")
    
    // Implementación de expansión si es necesaria
  }

  /**
   * Activa/desactiva física
   */
  togglePhysics() {
    this.enabled = !this.enabled
    console.log(`⚙️ [PHYSICS] Motor de física ${this.enabled ? "activado" : "desactivado"}`)
    return this.enabled
  }

  /**
   * Limpia recursos
   */
  cleanup() {
    this.enabled = false
    this.stars = []
    this.holes = []
    this.meteorites = []
  }
}