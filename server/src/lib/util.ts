export const hasAll = <T extends string>(obj: Record<string | number, string>, ...val: T[]): obj is Record<T, string> =>
    !val.some(it => !obj[it])