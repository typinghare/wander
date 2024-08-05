import { promisify } from 'util'
import { exec } from 'node:child_process'
import { validate } from 'email-validator'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither.js'
import { UnknownError, wrapUnknownError } from './error.js'

/**
 * Retrieves the Git user email from the global Git configuration.
 *
 * This function executes the command `git config user.email` to fetch the email
 * address configured for Git. It validates the email format using a validation
 * function. If the email is valid, it resolves with the email address;
 * otherwise, it rejects with an error indicating the email is invalid. In
 * case of execution errors, it rejects with the corresponding error.
 *
 * @returns A promise that resolves to the Git user email.
 * @throws If the email is invalid or if an error occurs during command
 *         execution.
 */
export async function getGitUserEmailUsingExec(): Promise<string> {
    const command: string = 'git config user.email'
    const execPromise = promisify(exec)
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout } = await execPromise(command)
            const email: string = stdout.trim()
            const isEmailValid: boolean = validate(email)
            if (!isEmailValid) {
                reject(new Error('Invalid email: ' + email))
            }

            resolve(email)
        } catch (err: unknown) {
            reject(err)
        }
    })
}

export function getGitUserEmail(): TaskEither<UnknownError, string> {
    return tryCatch(
        () => getGitUserEmailUsingExec(),
        wrapUnknownError('Fail to get user email: {}')
    )
}
