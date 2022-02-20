import { v4 as uuidv4 } from "uuid";

export const hasAll = <T extends string>(obj: Record<string | number, string>, ...val: T[]): obj is Record<T, string> =>
    !val.some(it => !obj[it])

export type UniqueId = string;

export const generateUniqueId = (): UniqueId => uuidv4().slice(0, 8)