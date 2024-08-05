import { WanderEnv } from './env.js'
import winston from 'winston'
import moment from 'moment'
import chalk, { ChalkInstance } from 'chalk'
import { DestFileNotFoundError, TargetFileNotFoundError } from './file.js'
import { tintDestFilePath, tintTargetFilePath } from './print.js'
import { UnknownError } from './error.js'

export const WANDER_LOGGING_LEVELS = {
    error: 0,
    warning: 1,
    success: 2,
    info: 3,
    debug: 4,
} as const

export const WANDER_LOGGING_COLORS: Record<WanderLoggingLevel, ChalkInstance> =
    {
        error: chalk.red,
        warning: chalk.yellow,
        success: chalk.green,
        info: chalk.cyan,
        debug: chalk.blue,
    } as const

export type WanderLoggingLevel = keyof typeof WANDER_LOGGING_LEVELS

export const winstonConsoleFormat: winston.Logform.Format =
    winston.format.printf((info) => {
        const { level, message } = info
        const wanderLoggingLevel = level as WanderLoggingLevel
        const time = moment().format('YYYY-MM-DD hh:mm:ss.SSS')
        const levelWithBracket = `[${level.toUpperCase().padEnd(7)}]`
        const coloredLevel =
            WANDER_LOGGING_COLORS[wanderLoggingLevel](levelWithBracket)

        return `${time} ${coloredLevel} ${message}`
    })

export function initWanderLogger(): winston.Logger {
    return winston.createLogger({
        levels: WANDER_LOGGING_LEVELS,
        level: 'info',
        transports: [
            new winston.transports.Console({
                format: winstonConsoleFormat,
            }),
        ],
    })
}

export function logSaved(
    this: WanderEnv,
    targetFilePath: string,
    destFilePath: string
): void {
    this.logger.log(
        'success',
        `${tintTargetFilePath(targetFilePath)} => ${tintDestFilePath(destFilePath)}`
    )
}

export function logRestored(
    this: WanderEnv,
    targetFilePath: string,
    destFilePath: string
): void {
    this.logger.log(
        'success',
        `${tintTargetFilePath(targetFilePath)} <= ${tintDestFilePath(destFilePath)}`
    )
}

export function logTargetFileNotFound(
    this: WanderEnv,
    err: TargetFileNotFoundError
) {
    this.logger.error(err.message)
}

export function logDestFileNotFound(
    this: WanderEnv,
    err: DestFileNotFoundError
) {
    this.logger.error(err.message)
}

export function logUnknown(this: WanderEnv, err: UnknownError) {
    this.logger.error(err.message)
}
