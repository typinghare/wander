import { TaskEither } from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js'
import { ensureUserDir } from './file.js'
import { WanderEnv } from './env.js'

export function listUserFiles(
    this: WanderEnv,
    email: string
): TaskEither<Error, string> {
    return pipe(ensureUserDir.call(this, email))
}
