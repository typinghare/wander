import { fold, left, right, TaskEither } from 'fp-ts/lib/TaskEither.js'
import { Task } from 'fp-ts/lib/Task.js'
import { Either } from 'fp-ts/lib/Either.js'
import { wanderEnvBinder } from './env.js'
import { logUnknown } from './log.js'

export class UnknownError extends Error {
    public constructor(err: unknown) {
        super(`${err}`)
        this.name = 'UnknownError'
    }
}

export function wrapUnknownError(
    message: string
): (err: unknown) => UnknownError {
    return function (err: unknown) {
        return new UnknownError(message.replace('{}', String(err)))
    }
}

export function closedFold<A>(
    callback?: (result: A) => void
): (ma: TaskEither<Error, A>) => Task<Either<null, null>> {
    return fold(
        (err: Error | null) => {
            if (err) {
                wanderEnvBinder(logUnknown)(err)
            }
            return left(null)
        },
        (result: A) => {
            if (callback) {
                callback(result)
            }
            return right(null)
        }
    )
}
