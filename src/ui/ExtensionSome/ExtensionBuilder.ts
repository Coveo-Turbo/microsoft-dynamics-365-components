import * as _ from "underscore";

export interface IExtensionArgument {
    key: string;
    value: string;
    argWithQuote?: boolean;
}

export class ExtensionBuilder<T> {
    private params: IExtensionArgument[] = [];

    constructor(public name: string, public withQuote: boolean = true) {}

    public withParamConditional(addParam: boolean, key: keyof T, value: any, argWithQuote?: boolean): ExtensionBuilder<T> {
        if (addParam) {
            this.withParam(key, value, argWithQuote);
        }
        return this;
    }

    public withParam(key: keyof T, value: any, argWithQuote?: boolean): ExtensionBuilder<T> {
        this.params.push({
            key: key as string,
            value,
            argWithQuote
        });
        return this;
    }

    public build(): string {
        return `$${this.name}(${this.buildParam()})`;
    }

    private buildParam(): string {
        const defaultQuote = this.withQuote ? "'" : "";
        return this.params.map(param => {
            if (param.value.replace) {
                param.value = param.value.replace(/\'/g, "");
            }
            return `${param.key}: ${this.argumentToString(param, defaultQuote)}`;
        }).join(", ");
    }

    private argumentToString(arg: IExtensionArgument, defaultQuote: string): string {
        let quote = defaultQuote;

        if (arg.argWithQuote !== undefined) {
            // Overrides the behaviour of the ExtensionBuilder for this argument.
            quote = arg.argWithQuote ? "'" : "";
        }
        return quote + arg.value + quote;
    }
}
