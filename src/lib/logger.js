// src/lib/logger.js
const LEVELS = /** @type {const} */ ({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
});

function resolveMinLevel() {
  // No Vite: import.meta.env.DEV / PROD / MODE
  // Ajuste aqui a política: em prod, só warn+error.
  if (import.meta.env.PROD) return "warn";
  return "debug";
}

const MIN_LEVEL = LEVELS[resolveMinLevel()] ?? LEVELS.debug;

function shouldLog(level) {
  return LEVELS[level] >= MIN_LEVEL && MIN_LEVEL < LEVELS.silent;
}

// Formata mensagens com timestamp + tag opcional
function format(tag, args) {
  const ts = new Date().toISOString();
  const prefix = tag ? `[${ts}] [${tag}]` : `[${ts}]`;
  return [prefix, ...args];
}

export function createLogger(tag) {
  return {
    debug: (...args) => {
      if (!shouldLog("debug")) return;
      console.log(...format(tag, args));
    },
    info: (...args) => {
      if (!shouldLog("info")) return;
      console.info(...format(tag, args));
    },
    warn: (...args) => {
      if (!shouldLog("warn")) return;
      console.warn(...format(tag, args));
    },
    error: (...args) => {
      if (!shouldLog("error")) return;
      console.error(...format(tag, args));
    },
  };
}

// Logger "padrão" (sem tag)
export const log = createLogger();
