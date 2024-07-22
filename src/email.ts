import { exec } from 'node:child_process'
import { promisify } from 'util'
import { validate } from 'email-validator'

/**
 * Fetches the global Git email address configured on the system.
 *
 * This function executes the `git config --global user.email` command to
 * retrieve the global email address set in the Git configuration. It then
 * validates the email address to ensure it is correctly formatted. If an error
 * occurs during the execution or if the email address is invalid, it logs
 * relevant error messages and exits the process.
 *
 * Upon successful retrieval and validation of the email address, the provided
 * callback function is called with the valid email address.
 *
 * @returns void
 */
export async function fetchGitEmail(): Promise<string> {
    const command: string = 'git config --global user.email'
    const execPromise = promisify(exec)
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout, stderr } = await execPromise(command)
            if (stderr !== '') {
                console.log('Fail to fetch git email: ' + stderr)
                console.log('Check if you have done the following: ')
                console.log('1. Installed git')
                console.log('2. Set global git email using ' +
                    '"git config --global user.email <your-email-address>"')
                reject(stderr)
            }

            const email: string = stdout.trim()
            const isEmailValid: boolean = validate(email)
            if (isEmailValid) {
                resolve(email)
            } else {
                console.log(`Invalid email address: ${email}`)
                console.log('Check if you have done the following: ')
                console.log('1. Installed git')
                console.log('2. Set global git email using ' +
                    '"git config --global user.email <your-email-address>"')
                reject(stderr)
                reject(stderr)
            }
        } catch (error) {
            reject(error)
        }
    })
}
