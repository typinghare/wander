import {
    ensureMyUserDir,
    getUserDirs,
    getUserSavedFileEntry,
    UserSavedFilesEntry,
} from './file.js'
import chalk from 'chalk'
import { pipe } from 'fp-ts/lib/function.js'
import { wanderEnv, wanderEnvBinder } from './env.js'
import { chain, sequenceArray } from 'fp-ts/lib/TaskEither.js'
import { closedFold } from './error.js'
import { Task } from 'fp-ts/Task'
import { Either } from 'fp-ts/Either'

export function printSavedFilesEntry(savedFilesEntry: UserSavedFilesEntry) {
    const userDir: string = savedFilesEntry.userDir
    const lines: string[] = [tintUserDir(userDir)]
    for (const savedFilePath of savedFilesEntry.savedFilePaths) {
        const destFilePath: string = savedFilePath.substring(userDir.length + 1)
        lines.push('    ' + tintDestFilePath(destFilePath))
    }

    console.log(lines.join('\n'))
}

export function printAllUsersSavedFiles(): Task<Either<null, null>> {
    return pipe(
        getUserDirs.call(wanderEnv),
        chain((userDirs: string[]) =>
            sequenceArray(
                userDirs.map((userDir: string) =>
                    wanderEnvBinder(getUserSavedFileEntry)(userDir)
                )
            )
        ),
        closedFold((savedFileEntries: readonly UserSavedFilesEntry[]) => {
            savedFileEntries.forEach(printSavedFilesEntry)
        })
    )
}

export function printMySavedFiles(): Task<Either<null, null>> {
    return pipe(
        ensureMyUserDir(),
        chain((myUserDir: string) =>
            wanderEnvBinder(getUserSavedFileEntry)(myUserDir)
        ),
        closedFold((savedFileEntry: UserSavedFilesEntry) => {
            printSavedFilesEntry(savedFileEntry)
        })
    )
}

export function tintUserDir(userDir: string): string {
    return chalk.cyan(userDir)
}

export function tintDestFilePath(destFilePath: string): string {
    return chalk.magenta(destFilePath)
}

export function tintTargetFilePath(targetFilePath: string): string {
    return chalk.yellow(targetFilePath)
}
