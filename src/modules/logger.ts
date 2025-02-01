import Winston, { createLogger, format, transports } from 'winston'

import serverConfig from '../config/server'


const myFormat = format.printf(({ level, message, label, timestamp, meta }) => {
  const msg = `[${label}] ${level}: ${message}`

  return JSON.stringify({
    severity: level.toUpperCase(),
    message: msg,
    metadata: meta
  })
})

const log = createLogger({
  levels: Winston.config.npm.levels,
  transports: [
    new transports.Console({
      level: serverConfig.logLevel,
      format: format.combine(
        format.label({ label: 'App' }),
        myFormat
      )
    })
  ]
})

export default log