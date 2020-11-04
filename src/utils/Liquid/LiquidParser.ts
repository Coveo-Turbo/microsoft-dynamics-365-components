import { Assert } from "../Assert";
import { Utils } from "../Utils";
import { IAttribute, IFilter, IFormSyntaxParser, ISemantic } from "./IFormSyntaxParser";

const invalidLiquidExpression = "Value is an invalid Liquid expression";
const maybeQuotedValueRegex = /"(.*)"|'(.*)'|(.+)/;

export class LiquidParser implements IFormSyntaxParser {
    match(expression: string): string[] {
        Assert.isNotNullOrEmpty(expression);

        const matches: string[] = expression.match(/\{\{(.*?)\}\}/g);
        return matches || [];
    }

    translate(expression: string): ISemantic {
        Assert.isNotNullOrEmpty(expression);
        Assert.check(Utils.stringStartsWith(expression, "{{"), `${invalidLiquidExpression}: ${expression}`);
        Assert.check(Utils.stringEndsWith(expression, "}}"), `${invalidLiquidExpression}: ${expression}`);

        const [attribute, ...extensions] = expression.replace("{{", "").replace("}}", "").trim().split("|");

        return {
            attribute: this.translateAttribute(attribute.trim()),
            filters: extensions.map(extension => this.processExtension(extension)),
            htmlEscape: true
        };
    }

    private processExtension(extension: string): IFilter {
        Assert.check(Utils.isNonEmptyString(extension), invalidLiquidExpression);

        // tslint:disable-next-line:prefer-const
        let [extensionName, attributes, ...reminder]: string[] = extension.split(":");
        attributes = [attributes].concat(reminder).join("");

        return {
            name: extensionName.trim(),
            parameters: this.processExtensionArguments(attributes)
        };
    }

    private processExtensionArguments(argumentsString: string): string[] {
        if (!argumentsString) {
            return [];
        }
        return argumentsString
            .split(",")
            .map(str => maybeQuotedValueRegex.exec(str.trim()))
            .filter(match => !!match && match.length === 4) // full match + the 3 regex groups
            .map(match => match[1] || match[2] || match[3]);
    }

    private translateAttribute(attribute: string): IAttribute {
        const isRawString: boolean = !!(attribute.match(/^(".*")|('.*')$/g)); // begins and ends with " or '
        let token = Utils.trim(attribute, "\"");
        token = Utils.trim(token, "'");
        const tokens = isRawString
            ? [token]
            : token.split(".");

        const cleanToken = tokens.join("");

        return {
            cleanToken,
            tokens,
            isRawString
        };
    }
}
