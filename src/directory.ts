import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import * as fs from 'fs-extra'

export const WANDER_DIR_NAME = '.wander'

// Get the absolute path of the current directory (dist)
export const DIST_DIR_PATH: string = dirname(fileURLToPath(import.meta.url))

// Get the absolute path of the .wander directory
export const WANDER_DIR_PATH: string
    = resolve(join(DIST_DIR_PATH, '..', WANDER_DIR_NAME))

export async function ensureUserDir(email: string): Promise<void> {
    const userDir: string = join(WANDER_DIR_PATH, email)

    try {
        await fs.ensureDir(userDir)
    } catch (ex) {
        console.error('Fail to ensure email dir: ' + userDir)
        console.error(ex)
    }
}
