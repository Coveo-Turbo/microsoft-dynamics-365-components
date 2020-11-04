export interface ISemantic {
    attribute: IAttribute;
    filters: IFilter[];
    htmlEscape: boolean;
}

export interface IAttribute {
    cleanToken: string;
    tokens: string[];
    isRawString: boolean;
}

export interface IFilter {
    name: string;
    parameters?: string[];
}

export interface IFormSyntaxParser {
    /**
     * Matches tokens in an expression.
     * @param expression The expression that may include tokens.
     * @param result The matches.
     */
    match(expression: string): string[];

    /**
     * Translates an expression to its semantic.
     * @param expression The expression to be translated.
     * @param result The resulting semantic.
     */
    translate(expression: string): ISemantic;
}

export interface IFormSyntaxInterpreter {
    /**
     * Translates a semantic to a resulting query.
     * @param semantic The semantic to be translated.
     * @param result The resulting query.
     */
    translate(semantic: ISemantic): string;
}
