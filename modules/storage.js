/**
 * STORAGE MANAGER - Sistema de Almacenamiento
 *
 * Gestiona la persistencia de datos:
 * - Puntuaciones altas
 * - Configuración de usuario
 * - Progreso de juego
 */

export class StorageManager {
  constructor() {
    console.log("💾 [STORAGE] Inicializando sistema de almacenamiento...")
    
    this.storageAvailable = this.checkStorageAvailability()
    this.storagePrefix = "stellarPool_"
    this.maxHighScores = 10
    
    console.log(`✅ [STORAGE] Sistema inicializado. Storage disponible: ${this.storageAvailable}`)
  }
  
  /**
   * Comprueba si el localStorage está disponible
   */
  checkStorageAvailability() {
    try {
      const storage = window.localStorage
      const testKey = "__storage_test__"
      storage.setItem(testKey, testKey)
      storage.removeItem(testKey)
      console.log("✅ [STORAGE] LocalStorage disponible")
      return true
    } catch (e) {
      console.warn("⚠️ [STORAGE] LocalStorage no disponible:", e)
      return false
    }
  }
  
  /**
   * Guarda un objeto en localStorage
   */
  saveData(key, data) {
    if (!this.storageAvailable) return false
    
    try {
      const fullKey = `${this.storagePrefix}${key}`
      const serializedData = JSON.stringify(data)
      localStorage.setItem(fullKey, serializedData)
      console.log(`💾 [STORAGE] Datos guardados: ${key}`)
      return true
    } catch (e) {
      console.error(`❌ [STORAGE] Error guardando ${key}:`, e)
      return false
    }
  }
  
  /**
   * Carga un objeto desde localStorage
   */
  loadData(key, defaultValue = null) {
    if (!this.storageAvailable) return defaultValue
    
    try {
      const fullKey = `${this.storagePrefix}${key}`
      const serializedData = localStorage.getItem(fullKey)
      
      if (serializedData === null) {
        console.log(`📂 [STORAGE] No hay datos para: ${key}, usando valor por defecto`)
        return defaultValue
      }
      
      const data = JSON.parse(serializedData)
      console.log(`📂 [STORAGE] Datos cargados: ${key}`)
      return data
    } catch (e) {
      console.error(`❌ [STORAGE] Error cargando ${key}:`, e)
      return defaultValue
    }
  }
  
  /**
   * Elimina un objeto de localStorage
   */
  removeData(key) {
    if (!this.storageAvailable) return false
    
    try {
      const fullKey = `${this.storagePrefix}${key}`
      localStorage.removeItem(fullKey)
      console.log(`🗑️ [STORAGE] Datos eliminados: ${key}`)
      return true
    } catch (e) {
      console.error(`❌ [STORAGE] Error eliminando ${key}:`, e)
      return false
    }
  }
  
  /**
   * Guarda configuración de usuario
   */
  saveSettings(settings) {
    return this.saveData("settings", settings)
  }
  
  /**
   * Carga configuración de usuario
   */
  loadSettings() {
    return this.loadData("settings", {
      timeLimit: 60,
      showAimLine: true,
      controlMode: "flipper",
      pointerStyle: "orbital",
      showTrajectory: true,
      soundEnabled: false,
    })
  }
  
  /**
   * Guarda una nueva puntuación alta
   */
  saveHighScore(scoreData) {
    // Estructura básica de puntuación
    const scoreEntry = {
      score: scoreData.score,
      level: scoreData.level,
      date: scoreData.date || new Date().toISOString(),
    }
    
    // Cargar puntuaciones existentes
    const existingScores = this.loadHighScores()
    
    // Añadir nueva puntuación
    existingScores.push(scoreEntry)
    
    // Ordenar de mayor a menor
    existingScores.sort((a, b) => b.score - a.score)
    
    // Limitar a las mejores N puntuaciones
    const topScores = existingScores.slice(0, this.maxHighScores)
    
    // Guardar
    const saved = this.saveData("highScores", topScores)
    console.log(`🏆 [STORAGE] Puntuación guardada: ${scoreEntry.score} (posición: ${topScores.indexOf(scoreEntry) + 1})`)
    return saved
  }
  
  /**
   * Carga las puntuaciones altas
   */
  loadHighScores() {
    return this.loadData("highScores", [])
  }
  
  /**
   * Limpia todas las puntuaciones altas
   */
  clearHighScores() {
    const cleared = this.saveData("highScores", [])
    if (cleared) {
      console.log("🧹 [STORAGE] Puntuaciones altas limpiadas")
    }
    return cleared
  }
  
  /**
   * Guarda el progreso actual del juego
   */
  saveProgress(progressData) {
    return this.saveData("progress", {
      ...progressData,
      lastSaved: new Date().toISOString(),
    })
  }
  
  /**
   * Carga el progreso guardado del juego
   */
  loadProgress() {
    return this.loadData("progress", null)
  }
  
  /**
   * Exporta todos los datos a JSON
   */
  exportData() {
    if (!this.storageAvailable) return null
    
    const exportData = {
      settings: this.loadSettings(),
      highScores: this.loadHighScores(),
      progress: this.loadProgress(),
      exportDate: new Date().toISOString(),
    }
    
    return JSON.stringify(exportData)
  }
  
  /**
   * Importa datos desde JSON
   */
  importData(jsonData) {
    if (!this.storageAvailable) return false
    
    try {
      const data = JSON.parse(jsonData)
      let success = true
      
      if (data.settings) {
        success = success && this.saveSettings(data.settings)
      }
      
      if (data.highScores) {
        success = success && this.saveData("highScores", data.highScores)
      }
      
      if (data.progress) {
        success = success && this.saveProgress(data.progress)
      }
      
      console.log(`📥 [STORAGE] Importación ${success ? "exitosa" : "fallida"}`)
      return success
    } catch (e) {
      console.error("❌ [STORAGE] Error importando datos:", e)
      return false
    }
  }
  
  /**
   * Limpia todos los datos almacenados
   */
  clearAllData() {
    if (!this.storageAvailable) return false
    
    try {
      // Limpiar datos utilizando el prefijo
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.storagePrefix))
        .forEach((key) => localStorage.removeItem(key))
      
      console.log("🧹 [STORAGE] Todos los datos borrados")
      return true
    } catch (e) {
      console.error("❌ [STORAGE] Error borrando datos:", e)
      return false
    }
  }
}