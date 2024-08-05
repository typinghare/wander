import { createEnv, createEnvBinder } from './eop.js'
import { initWanderLogger } from './log.js'

export const wanderEnv = createEnv({
    // The hidden directory for Wander to store the files.
    dir: '.wander',

    // The current working directory
    cwd: process.cwd(),

    // The logger
    logger: initWanderLogger(),

    // The extension of saved files
    saved_extension: '.svd',
})

export type WanderEnv = typeof wanderEnv

export const wanderEnvBinder = createEnvBinder(wanderEnv)
