export const defaultContextObject = "form";

export interface IContextObject {
    get(key: string): string | IContextObject;
}

export class ContextObject implements IContextObject {
    constructor(private values: { [key: string]: string | IContextObject }) {}

    get(key: string): string | IContextObject {
        return this.values[key];
    }
}
