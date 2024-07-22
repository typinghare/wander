import { join, resolve } from 'path'
import * as fs from 'fs-extra'

export const WANDER_DIR_NAME = '.wander'

export const CURRENT_WORKING_DIRECTORY = process.cwd()

// Get the absolute path of the .wander directory
export const WANDER_DIR_PATH: string
    = resolve(join(CURRENT_WORKING_DIRECTORY, WANDER_DIR_NAME))

export async function ensureUserDir(email: string): Promise<void> {
    const userDir: string = join(WANDER_DIR_PATH, email)

    try {
        await fs.ensureDir(userDir)
    } catch (ex) {
        console.error('Fail to ensure email dir: ' + userDir)
        console.error(ex)
    }
}

export function toRelativePath(absolutePath: string): string {
    return absolutePath.substring(CURRENT_WORKING_DIRECTORY.length + 1)
}
