import * as path from 'path'
import * as fs from 'fs-extra'
import fsExtra from 'fs-extra'
import { WanderEnv, wanderEnvBinder } from './env.js'
import { pipe } from 'fp-ts/lib/function.js'
import {
    logDestFileNotFound,
    logRestored,
    logSaved,
    logTargetFileNotFound,
    logUnknown,
} from './log.js'
import { closedFold, UnknownError, wrapUnknownError } from './error.js'
import { getGitUserEmail } from './email.js'
import {
    chain,
    fold,
    left,
    map,
    right,
    sequenceArray,
    TaskEither,
    tryCatch,
} from 'fp-ts/lib/TaskEither.js'

export function getUserDir(this: WanderEnv, email: string): string {
    return path.join(this.dir, email)
}

export function ensureUserDir(
    this: WanderEnv,
    email: string
): TaskEither<UnknownError, string> {
    const userDir: string = getUserDir.call(this, email)

    return tryCatch(async () => {
        await fs.ensureDir(userDir)
        return userDir
    }, wrapUnknownError('Failed to ensure user directory: {}'))
}

export function ensureMyUserDir(): TaskEither<UnknownError, string> {
    return pipe(
        getGitUserEmail(),
        chain((gitUserEmail: string) =>
            wanderEnvBinder(ensureUserDir)(gitUserEmail)
        )
    )
}

export function checkPathExists(
    filePath: string
): TaskEither<UnknownError, boolean> {
    return tryCatch(
        () => fsExtra.pathExists(filePath),
        wrapUnknownError('Failed to check path existence: {}')
    )
}

export function forceRemoveFile(
    filePath: string
): TaskEither<UnknownError, void> {
    return tryCatch(
        () => fsExtra.rm(filePath, { recursive: true, force: true }),
        wrapUnknownError('Failed to remove file: {}')
    )
}

export function copyFile(
    targetFilePath: string,
    destFilePath: string
): TaskEither<Error, void> {
    return tryCatch(
        () => fsExtra.copy(targetFilePath, destFilePath),
        wrapUnknownError('Failed to copy file: {}')
    )
}

export function getFileStat(
    filePath: string
): TaskEither<UnknownError, fs.Stats> {
    return tryCatch(
        () => fsExtra.promises.stat(filePath),
        wrapUnknownError('Failed to get file stats: {}')
    )
}

export function readDir(dir: string): TaskEither<UnknownError, string[]> {
    return tryCatch(
        () => fsExtra.promises.readdir(dir),
        wrapUnknownError('Failed to read dir: {}')
    )
}

export function getFileOrFilesInDir(
    filePath: string
): TaskEither<UnknownError, string[]> {
    return pipe(
        getFileStat(filePath),
        chain((stats) =>
            stats.isDirectory()
                ? getAllFilesRecursively(filePath)
                : right([filePath])
        )
    )
}

export function getFileOrFilesInDirForFiles(
    filePaths: string[],
    dir: string
): TaskEither<UnknownError, string[]> {
    return pipe(
        sequenceArray(
            filePaths.map((filePath: string) =>
                getFileOrFilesInDir(path.join(dir, filePath))
            )
        ),
        map((filesList: readonly string[][]) => filesList.flat())
    )
}

export function getAllFilesRecursively(
    dir: string
): TaskEither<UnknownError, string[]> {
    return pipe(
        readDir(dir),
        chain((files: string[]) => getFileOrFilesInDirForFiles(files, dir))
    )
}

export function getAllSavedFilePaths(
    this: WanderEnv,
    dir: string
): TaskEither<UnknownError, string[]> {
    return pipe(
        getAllFilesRecursively(dir),
        map((files) =>
            files.filter((file) => file.endsWith(this.saved_extension))
        )
    )
}

export function getUserDirs(
    this: WanderEnv
): TaskEither<UnknownError, string[]> {
    return pipe(
        readDir(this.dir),
        map((fileNames: string[]) =>
            fileNames.map((fileName) => path.join(this.dir, fileName))
        ),
        chain((filePaths: string[]) =>
            sequenceArray(
                filePaths.map((filePath) =>
                    pipe(
                        getFileStat(filePath),
                        map((stats: fs.Stats) => ({
                            filePath,
                            isDirectory: stats.isDirectory(),
                        }))
                    )
                )
            )
        ),
        map((results) =>
            results
                .filter((result) => result.isDirectory)
                .map((result) => result.filePath)
        )
    )
}

export interface UserSavedFilesEntry {
    userDir: string
    savedFilePaths: string[]
}

export function getUserSavedFileEntry(
    this: WanderEnv,
    userDir: string
): TaskEither<UnknownError, UserSavedFilesEntry> {
    return pipe(
        getAllSavedFilePaths.call(this, userDir),
        map((savedFiles: string[]) => ({
            userDir,
            savedFilePaths: savedFiles,
        }))
    )
}

export function save(
    this: WanderEnv,
    targetFilePath: string,
    destFilePath: string
): TaskEither<null, null> {
    destFilePath += this.saved_extension
    return pipe(
        checkPathExists(targetFilePath),
        chain((isTargetPathExist) =>
            isTargetPathExist
                ? right(undefined)
                : left(new TargetFileNotFoundError(targetFilePath))
        ),
        chain(() => forceRemoveFile(destFilePath)),
        chain(() => copyFile(targetFilePath, destFilePath)),
        map(() => logSaved.call(this, targetFilePath, destFilePath)),
        fold(
            (err: TargetFileNotFoundError | UnknownError) => {
                if (err instanceof TargetFileNotFoundError) {
                    wanderEnvBinder(logTargetFileNotFound)(err)
                } else {
                    wanderEnvBinder(logUnknown)(err)
                }
                return left(null)
            },
            () => right(null)
        )
    )
}

export function restore(
    this: WanderEnv,
    targetFilePath: string,
    destFilePath: string
): TaskEither<null, null> {
    destFilePath += this.saved_extension
    return pipe(
        checkPathExists(destFilePath),
        chain((isDestPathExist) =>
            isDestPathExist
                ? right(undefined)
                : left(new DestFileNotFoundError(destFilePath))
        ),
        chain(() => forceRemoveFile(targetFilePath)),
        chain(() => copyFile(destFilePath, targetFilePath)),
        map(() => logRestored.call(this, targetFilePath, destFilePath)),
        fold(
            (err: DestFileNotFoundError | UnknownError) => {
                if (err instanceof DestFileNotFoundError) {
                    wanderEnvBinder(logDestFileNotFound)(err)
                } else {
                    wanderEnvBinder(logUnknown)(err)
                }
                return left(null)
            },
            () => right(null)
        )
    )
}

export class TargetFileNotFoundError extends Error {
    public constructor(targetFilePath: string) {
        super(`Target file not found: ${targetFilePath}`)
        this.name = 'TargetFileNotFoundError'
    }
}

export class DestFileNotFoundError extends Error {
    public constructor(destFilePath: string) {
        super(`Destination file not found: ${destFilePath}`)
        this.name = 'DestFileNotFoundError'
    }
}

export function processMyTargets(
    targets: string[],
    processCallback: (target: string, userDir: string) => TaskEither<any, any>
): TaskEither<null, null> {
    return pipe(
        ensureMyUserDir(),
        chain((userDir: string) =>
            sequenceArray(
                targets.map((target: string) =>
                    processCallback(target, userDir)
                )
            )
        ),
        closedFold()
    )
}

export function saveMyTargets(targets: string[]): TaskEither<null, null> {
    return processMyTargets(targets, (target, userDir) =>
        wanderEnvBinder(save)(target, path.join(userDir, target))
    )
}

export function restoreMyTargets(targets: string[]): TaskEither<null, null> {
    return processMyTargets(targets, (target, userDir) =>
        wanderEnvBinder(restore)(target, path.join(userDir, target))
    )
}

export function restoreMyAllTargets(this: WanderEnv): TaskEither<null, null> {
    return pipe(
        ensureMyUserDir(),
        chain((myUserDir: string) =>
            pipe(
                wanderEnvBinder(getAllSavedFilePaths)(myUserDir),
                map((savedFilePaths: string[]) => ({
                    userDir: myUserDir,
                    savedFilePaths,
                }))
            )
        ),
        map(({ userDir, savedFilePaths }: UserSavedFilesEntry) => {
            return savedFilePaths.map((saveFilePath) => {
                const f = saveFilePath.substring(userDir.length + 1)
                return f.substring(0, f.length - this.saved_extension.length)
            })
        }),
        fold(
            () => left(null),
            (targets) => right(targets)
        ),
        chain((targets: string[]) =>
            processMyTargets(targets, (target, userDir) =>
                wanderEnvBinder(restore)(target, path.join(userDir, target))
            )
        )
    )
}
