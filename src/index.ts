import * as process from 'node:process'
import { resolveAction } from './actions.js'
import fs from 'fs-extra'
import chalk from 'chalk'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const command: string = process.argv.length > 2 ?
    process.argv[2].toLowerCase().trim() :
    '--help'
const args: string[] = process.argv.slice(3)

const commands_description = {
    list: 'Display all users and saved entries.',
    save: 'Save a file/directory to Wander storage.',
    restore: 'Restore a file/directory from Wander storage.',
    help: 'Display detailed usage for a specific command.',
} as const

const commands_detailed_description = {
    save: 'This command first fetches the user\'s Git email using ' +
        '"git config --global user.email" command, and compute the ' +
        'destination path. The user\'s root directory is ' +
        '".wander/<email>". The target file/directory will then copy ' +
        'recursively to the destination path.',
    restore: 'This command serves as the reverse process of save. It moves ' +
        'the file/directory from the destination path to the target path.',
} as const

switch (command) {
    case '-v':
    case '--version':
        const dirname = path.dirname(fileURLToPath(import.meta.url))
        const packageJsonContent: string
            = fs.readFileSync(path.join(dirname, '..', 'package.json'), 'utf-8')
        const packageObject = JSON.parse(packageJsonContent)
        const version: string = packageObject['version']
        const author: string = packageObject['author']['name']
        const email: string = packageObject['author']['email']

        console.log(`Wander v${version} \nby ${author} (${email})`)
        break
    case '-h':
    case '--help':
        console.log('Usage: wander [-v | --version] [-h | --help] <command> [<args>]\n')
        console.log(`Commands: \n`)

        for (const [command, description] of Object.entries(commands_description)) {
            console.log('  ' + chalk.magenta(command.padEnd(12, ' '))
                + chalk.yellow(description))
        }

        break
    case 'help':
        switch (args[0]) {
            case 'list':
                console.log(chalk.magenta('list'))
                console.log(chalk.yellow(commands_description.list))
                break
            case 'save':
                console.log(chalk.magenta('save') + chalk.blue(' <target>'))
                console.log(chalk.yellow(commands_description.save))
                console.log()
                console.log(commands_detailed_description.save)
                break
            case 'restore':
                console.log(chalk.magenta('restore') + chalk.blue(' <target>'))
                console.log(chalk.yellow(commands_description.restore))
                console.log()
                console.log(commands_detailed_description.restore)
                break
            default:
                console.log('Unknown command: ' + command)
                console.log('Use "wander --help" to display the usages.')
        }
        break
    case 'list':
    case 'save':
    case 'restore':
        resolveAction(command, args)
        break
    default:
        console.log('Unknown command: ' + command)
        console.log('Use "wander --help" to display the usages.')
        process.exit(1)
}
