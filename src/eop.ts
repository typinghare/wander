import Immutable from 'immutable'

/**
 * Type representing immutable elements, which can be:
 * - Primitive types (string, number, boolean)
 * - Immutable collections (Map, List, Set) with elements of type
 * `ImmutableElements`
 */
export type ImmutableElements =
    | string
    | number
    | boolean
    | Immutable.Map<any, ImmutableElements>
    | Immutable.List<ImmutableElements>
    | Immutable.Set<ImmutableElements>
    | unknown

export type EnvType<I> = Readonly<Record<string, I>>

/**
 * Type alias for an environment object where keys are strings and values are
 * of type `I`. By default, `I` is `ImmutableElements`.
 */
export type Env<T extends EnvType<I> = any, I = ImmutableElements> = T

/**
 * Type alias for a pure function that takes an array of arguments `A` and
 * returns a value of type `R`.
 */
export type PureFn<A extends unknown[], R> = (...args: A) => R

/**
 * Type alias for an impure function that:
 * - Takes an array of arguments `A`
 * - Uses the environment `E` as `this`
 * - Returns a value of type `R`
 *
 * The environment `E` must extend `Env`.
 */
export type ImpureFn<E extends Env, A extends unknown[], R> = (
    this: E,
    ...args: A
) => R

/**
 * Creates an environment object of type `T` with values of type `I`.
 *
 * @param env - The environment object to create.
 * @returns The same environment object.
 */
export function createEnv<E extends EnvType<I>, I = ImmutableElements>(
    env: E,
): Readonly<E> {
    return env
}

/**
 * Creates a binder function that converts an impure function into a pure
 * function
 * by binding it to a specific environment.
 *
 * @param impureFn - The impure function to bind.
 * @returns A pure function bound to the environment.
 */
export type EnvBinder<E> = <A extends unknown[], R>(
    impureFn: ImpureFn<E, A, R>,
) => PureFn<A, R>

/**
 * Returns an `EnvBinder` function that binds impure functions to the given
 * environment.
 *
 * @param env - The environment to bind impure functions to.
 * @returns A function that binds impure functions to the environment.
 */
export function createEnvBinder<E extends Env>(env: E): EnvBinder<E> {
    return function <A extends unknown[], R>(
        impureFn: ImpureFn<E, A, R>,
    ): PureFn<A, R> {
        return impureFn.bind(env)
    }
}
