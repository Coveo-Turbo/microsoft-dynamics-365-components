// https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/org-service/web-service-error-codes
export enum DynamicsErrorCodes {
    KBAlreadyLinked = "0x80060861"
}

export interface IDynamicsError extends Error {
    code: string;
}
