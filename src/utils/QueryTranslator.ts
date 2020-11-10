// Copyright (c) 2005-2017, Coveo Solutions Inc.

import { IAttributeWithValue } from "./IContext";
import { IQueryTranslator } from "./IQueryTranslator";
import { IFormSyntaxInterpreter, IFormSyntaxParser } from "./Liquid/IFormSyntaxParser";

export class QueryTranslator implements IQueryTranslator {
    constructor(private parser: IFormSyntaxParser, private interpreter: IFormSyntaxInterpreter) {}

    public expandQuery(value: string): string {
        let outputValue: string = value;
        if (value) {
            const matches = this.parser.match(value);
            const values = matches.map(match => this.translateToken(match));
            matches.forEach((match: string, index: number) => {
                outputValue = outputValue.replace(match, values[index].value);
            });
        }
        return outputValue;
    }

    public translateToken(token: string): IAttributeWithValue {
        const meaning = this.parser.translate(token);
        const value = this.interpreter.translate(meaning);

        return {
            name: meaning.attribute.cleanToken,
            value
        };
    }
}
