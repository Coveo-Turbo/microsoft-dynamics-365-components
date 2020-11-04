export enum DynamicsErrorCodes {
    KBAlreadyLinked = "0x80060861"
}

export interface IDynamicsError extends Error {
    code: string;
}
