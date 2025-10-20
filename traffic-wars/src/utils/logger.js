/**
 * Logging utility with different severity levels
 * DEBUG: Frame rate, game loop running (most intensive, less important)
 * INFO: Ride creation, ride selection, ride completion
 * WARNING: Driver search for rides, pathfinding issues
 * ERROR: Critical errors, system failures
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
}

export const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARNING]: 'WARNING',
  [LOG_LEVELS.ERROR]: 'ERROR'
}

export const LOG_LEVEL_COLORS = {
  [LOG_LEVELS.DEBUG]: '#95a5a6',    // Gray
  [LOG_LEVELS.INFO]: '#3498db',     // Blue
  [LOG_LEVELS.WARNING]: '#f39c12',  // Orange
  [LOG_LEVELS.ERROR]: '#e74c3c'     // Red
}

class Logger {
  constructor() {
    this.currentLevel = LOG_LEVELS.INFO
    this.logs = []
    this.maxLogs = 1000 // Keep last 1000 logs
  }

  setLevel(level) {
    this.currentLevel = level
  }

  getLevel() {
    return this.currentLevel
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }

  _log(level, message, ...args) {
    if (level < this.currentLevel) {
      return // Don't log if below current level
    }

    const timestamp = new Date().toLocaleTimeString()
    const levelName = LOG_LEVEL_NAMES[level]
    const color = LOG_LEVEL_COLORS[level]
    
    const logEntry = {
      timestamp,
      level,
      levelName,
      color,
      message,
      args: args.length > 0 ? args : null
    }

    this.logs.push(logEntry)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Also log to console with appropriate method
    const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' : 
                         level === LOG_LEVELS.WARNING ? 'warn' : 'log'
    
    console[consoleMethod](`[${timestamp}] [${levelName}] ${message}`, ...args)
  }

  debug(message, ...args) {
    this._log(LOG_LEVELS.DEBUG, message, ...args)
  }

  info(message, ...args) {
    this._log(LOG_LEVELS.INFO, message, ...args)
  }

  warn(message, ...args) {
    this._log(LOG_LEVELS.WARNING, message, ...args)
  }

  error(message, ...args) {
    this._log(LOG_LEVELS.ERROR, message, ...args)
  }
}

// Create a singleton instance
export const logger = new Logger()

// Export convenience functions
export const debug = (message, ...args) => logger.debug(message, ...args)
export const info = (message, ...args) => logger.info(message, ...args)
export const warn = (message, ...args) => logger.warn(message, ...args)
export const error = (message, ...args) => logger.error(message, ...args)
