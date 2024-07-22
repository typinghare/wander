import { fetchGitEmail } from './email.js'
import { ensureUserDir, toRelativePath, WANDER_DIR_PATH } from './directory.js'
import fs from 'fs-extra'
import path from 'node:path'
import chalk from 'chalk'

export type ACTION = 'list' | 'save' | 'restore'

export function resolveAction(action: ACTION, args: string[]): void {
    const mapper = {
        list: listAllConfigurationItems,
        save: save,
        restore: restore,
    } as const

    mapper[action](args)
}

export async function listAllConfigurationItems(): Promise<void> {
    const lines: string[] = []
    for (const email of await fs.readdir(WANDER_DIR_PATH)) {
        const userDir = path.join(WANDER_DIR_PATH, email)
        const stat = await fs.stat(userDir)
        if (!stat.isDirectory()) {
            continue
        }

        lines.push(chalk.cyan(email) + ` (${toRelativePath(userDir)})`)

        for (const fileName of await fs.readdir(userDir)) {
            lines.push('    ' + chalk.yellow(fileName))
        }
    }

    lines.forEach(line => console.log(line))
}

async function getTargetAndDestPath(args: string[]): Promise<[string, string]> {
    const targetPath: string | null = args[0] || null
    if (targetPath == null) {
        console.log('Missing required argument: <target>')
        process.exit(1)
    }

    const email: string = await fetchGitEmail()
    await ensureUserDir(email)
    const destPath: string = path.join(WANDER_DIR_PATH, email, targetPath)

    return [targetPath, destPath]
}

export async function save(args: string[]): Promise<void> {
    const [targetPath, destPath] = await getTargetAndDestPath(args)

    try {
        await fs.access(targetPath)
    } catch (ex) {
        console.error('Target file or directory not found: ' + targetPath)
        console.error('Abort saving')
        process.exit(1)
    }

    // Remove destination file if it exists
    await fs.rm(destPath, { recursive: true, force: true })

    // Copy the target file to the destination file
    await fs.copy(targetPath, destPath)

    console.log(`Saved: ${targetPath} -> ${destPath}`)
}

export async function restore(args: string[]): Promise<void> {
    const [targetPath, destPath] = await getTargetAndDestPath(args)

    try {
        await fs.access(destPath)
    } catch (ex) {
        console.error('Destination file or directory not found: ' +
            toRelativePath(destPath))
        console.error('Abort restoring')
        process.exit(1)
    }

    // Remove target file if it exists
    await fs.rm(targetPath, { recursive: true, force: true })

    // Copy the target file to the destination file
    await fs.copy(destPath, targetPath)

    console.log(`Restored: ${destPath} -> ${targetPath}`)
}
