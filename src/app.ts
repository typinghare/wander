import { Command } from 'commander'
import { restoreMyAllTargets, restoreMyTargets, saveMyTargets } from './file.js'
import { printAllUsersSavedFiles, printMySavedFiles } from './print.js'
import { Task } from 'fp-ts/Task'
import { Either } from 'fp-ts/Either'
import { wanderEnvBinder } from './env.js'

export const program = new Command()

program
    .version('v2.0.0', '-v, --version', 'Display the version')
    .helpOption('-h, --help', 'Display help for Wander')
    .description('A modern solution for addressing settings files conflict')

program
    .command('list')
    .description('Display saved files')
    .option('--all', "List all users' saved files", false)
    .action(async (options: { all: boolean }) => {
        const fn: Task<Either<null, null>> = options.all
            ? printAllUsersSavedFiles()
            : printMySavedFiles()
        fn.call(null)
    })

program
    .command('save')
    .description('Save a file to Wander storage')
    .argument('<target...>', 'The path of the target file to save')
    .action(async (targets: string[]) => {
        saveMyTargets(targets).call(null)
    })

program
    .command('restore')
    .description('Restore a file from Wander storage')
    .argument(
        '[target...]',
        'The path of the target file to restore; when ignored, restore all saved files'
    )
    .action(async (targets: string[]) => {
        const fn: Task<Either<null, null>> =
            targets.length === 0
                ? wanderEnvBinder(restoreMyAllTargets)()
                : restoreMyTargets(targets)
        fn.call(null)
    })
