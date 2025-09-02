/**
 * SOUND SYSTEM - Sistema de Audio
 *
 * Gestiona todos los efectos de sonido del juego:
 * - Carga de sonidos
 * - Reproducción
 * - Volumen
 * - Muteo
 */

export class SoundSystem {
  constructor() {
    console.log("🔊 [SOUND] Inicializando sistema de sonido...")

    this.sounds = {}
    this.enabled = false
    this.volume = 0.5
    this.muted = false
    this.currentMusic = null
    this.audioContext = null
    this.audioAvailable = this.checkAudioAvailability()

    if (this.audioAvailable) {
      this.initializeAudioContext()
      this.loadSounds()
    }

    console.log(`✅ [SOUND] Sistema inicializado. Audio disponible: ${this.audioAvailable}`)
  }

  /**
   * Comprueba si el audio está disponible en el navegador
   */
  checkAudioAvailability() {
    const audioAvailable = typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined"
    console.log(`🔊 [SOUND] Audio API disponible: ${audioAvailable}`)
    return audioAvailable
  }

  /**
   * Inicializa el contexto de audio
   */
  initializeAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContextClass()
      console.log("🔊 [SOUND] Contexto de audio creado")
    } catch (e) {
      console.error("❌ [SOUND] Error creando contexto de audio:", e)
      this.audioAvailable = false
    }
  }

  /**
   * Inicializa y precarga todos los sonidos del juego
   */
  loadSounds() {
    console.log("🔊 [SOUND] Cargando sonidos...")

    // Sonidos del juego
    const soundsToLoad = [
      { name: "shoot", url: "sounds/shoot.mp3" },
      { name: "bounce", url: "sounds/dung.mp3" }, // bounce.mp3
      { name: "hole", url: "sounds/hole.mp3" },
      { name: "explosion", url: "sounds/explosion.mp3" },
      { name: "powerup", url: "sounds/powerup.mp3" },
      { name: "levelComplete", url: "sounds/level_complete.mp3" },
      { name: "gameOver", url: "sounds/game_over.mp3" },
      { name: "menu", url: "sounds/menu.mp3" },
    ]

    // Cargar cada sonido
    soundsToLoad.forEach((sound) => {
      this.loadSound(sound.name, sound.url)
    })
  }

  /**
   * Carga un sonido individual
   */
  loadSound(name, url) {
    if (!this.audioAvailable) return

    try {
      // La carga en segundo plano usando la API de Audio
      const audio = new Audio()
      audio.src = url
      audio.preload = "auto"
      audio.volume = this.volume

      // Manejar error silenciosamente en caso de que el archivo no exista
      audio.onerror = () => {
        console.warn(`⚠️ [SOUND] No se pudo cargar el sonido: ${name}`)
      }

      this.sounds[name] = {
        audio: audio,
        loaded: false,
      }

      // Marcar como cargado cuando esté listo
      audio.oncanplaythrough = () => {
        this.sounds[name].loaded = true
        console.log(`✅ [SOUND] Sonido cargado: ${name}`)
      }
    } catch (error) {
      console.error(`❌ [SOUND] Error cargando sonido ${name}:`, error)
    }
  }

  /**
   * Reproduce un sonido por su nombre
   */
  play(name) {
    if (!this.audioAvailable || !this.enabled || this.muted) return
    
    const sound = this.sounds[name]
    if (!sound || !sound.loaded) {
      console.warn(`⚠️ [SOUND] Sonido no disponible: ${name}`)
      return
    }

    try {
      // Si el sonido ya está reproduciéndose, crear una nueva instancia
      if (sound.audio.currentTime > 0 && !sound.audio.paused) {
        // Clonar el audio para reproducción simultánea
        const audioClone = sound.audio.cloneNode()
        audioClone.volume = this.volume
        audioClone.play().catch((e) => console.warn(`⚠️ [SOUND] Error reproduciendo ${name}:`, e))
      } else {
        // Reproducir el original
        sound.audio.currentTime = 0
        sound.audio.volume = this.volume
        sound.audio.play().catch((e) => console.warn(`⚠️ [SOUND] Error reproduciendo ${name}:`, e))
      }

      console.log(`🎵 [SOUND] Reproduciendo: ${name}`)
    } catch (error) {
      console.warn(`⚠️ [SOUND] Error reproduciendo ${name}:`, error)
    }
  }

  /**
   * Reproduce música de fondo en loop
   */
  playMusic(name) {
    if (!this.audioAvailable || !this.enabled || this.muted) return
    
    if (this.currentMusic) {
      this.stopMusic()
    }

    const music = this.sounds[name]
    if (!music || !music.loaded) {
      console.warn(`⚠️ [SOUND] Música no disponible: ${name}`)
      return
    }

    try {
      music.audio.loop = true
      music.audio.volume = this.volume * 0.6 // Música a volumen más bajo
      music.audio.play().catch((e) => console.warn(`⚠️ [SOUND] Error reproduciendo música ${name}:`, e))
      this.currentMusic = name
      console.log(`🎵 [SOUND] Iniciando música: ${name}`)
    } catch (error) {
      console.warn(`⚠️ [SOUND] Error reproduciendo música ${name}:`, error)
    }
  }

  /**
   * Detiene la música en reproducción
   */
  stopMusic() {
    if (!this.audioAvailable || !this.currentMusic) return
    
    const music = this.sounds[this.currentMusic]
    if (music && music.audio) {
      music.audio.pause()
      music.audio.currentTime = 0
      console.log(`🎵 [SOUND] Música detenida: ${this.currentMusic}`)
    }
    
    this.currentMusic = null
  }

  /**
   * Activa o desactiva todo el sistema de sonido
   */
  setEnabled(enabled) {
    this.enabled = enabled
    console.log(`🔊 [SOUND] Sistema de sonido ${enabled ? "activado" : "desactivado"}`)

    if (!enabled && this.currentMusic) {
      this.stopMusic()
    }

    // Al activar, tratar de reanudar el AudioContext
    if (enabled && this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume()
    }
  }

  /**
   * Ajusta el volumen global
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    
    // Ajustar volumen en todos los sonidos cargados
    Object.values(this.sounds).forEach(sound => {
      if (sound.audio) {
        sound.audio.volume = this.volume
      }
    })
    
    console.log(`🔊 [SOUND] Volumen establecido: ${this.volume}`)
  }

  /**
   * Activa/desactiva el mute
   */
  toggleMute() {
    this.muted = !this.muted
    console.log(`🔊 [SOUND] ${this.muted ? "Silenciado" : "No silenciado"}`)

    if (this.muted && this.currentMusic) {
      this.stopMusic()
    }
    
    return this.muted
  }

  /**
   * Comprueba el estado del audio
   */
  getStatus() {
    return {
      available: this.audioAvailable,
      enabled: this.enabled,
      muted: this.muted,
      volume: this.volume,
      contextState: this.audioContext ? this.audioContext.state : null,
      loadedSounds: Object.keys(this.sounds).filter(name => this.sounds[name].loaded),
      currentMusic: this.currentMusic,
    }
  }

  /**
   * Limpia recursos al cerrar
   */
  cleanup() {
    this.stopMusic()
    
    // Detener todos los sonidos
    Object.values(this.sounds).forEach(sound => {
      if (sound.audio) {
        sound.audio.pause()
        sound.audio.currentTime = 0
      }
    })
    
    // Cerrar AudioContext
    if (this.audioContext) {
      this.audioContext.close().then(() => {
        console.log("🔊 [SOUND] AudioContext cerrado")
      })
    }
    
    this.sounds = {}
    console.log("🔊 [SOUND] Sistema de sonido limpiado")
  }
}