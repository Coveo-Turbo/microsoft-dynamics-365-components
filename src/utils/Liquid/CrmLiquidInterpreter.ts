import { Assert } from "../Assert";
import { Utils } from "../Utils";
import { defaultContextObject, IContextObject } from "./ContextObject";
import { ContextObjects } from "./ContextObjects";
import { IFilter, IFormSyntaxInterpreter, ISemantic } from "./IFormSyntaxParser";
import { LiquidFilters } from "./LiquidFilters";

export class CrmLiquidInterpreter implements IFormSyntaxInterpreter {
    constructor(private contextObjects: ContextObjects, private filters: LiquidFilters) {}

    translate(semantic: ISemantic): string {
        if (semantic.attribute.isRawString) {
            return semantic.attribute.tokens[0];
        }
        const rawValue = this.getFieldValueFromFieldName(semantic.attribute.tokens);

        const filteredValue = (semantic.filters || []).reduce(this.applyFilter.bind(this), rawValue) as string;

        return semantic.htmlEscape
            ? this.cleanHtmlFromSentence(filteredValue)
            : filteredValue;
    }

    private getFieldValueFromFieldName(fieldName: string[]): string | IContextObject {
        const keys = fieldName.reverse();
        let key = keys.pop();
        if (!key) {
            throw new Error("Invalid attribute");
        }

        let obj = this.contextObjects.get(key);
        let fieldValue: string | IContextObject;
        if (obj) {
            key = keys.pop();
            if (!key) {
                throw new Error("Invalid attribute");
            }
        } else {
            obj = this.contextObjects.get(defaultContextObject);
        }
        fieldValue = obj.get(key);

        if (!fieldValue) {
            console.log(`Object with key "${key}" does not exists.`);
            return "";
        }

        return this.fieldValueToString(fieldValue, keys);
    }

    private fieldValueToString(currentValue: string | IContextObject,
                               keys: string[]): string | IContextObject {
        // Handles cases such as field1.prop1.prop2
        let returnValue = currentValue;
        while (keys.length > 0) {
            const key = keys.pop();
            const currentContext = returnValue as IContextObject;
            if (!currentContext.get) {
                return "";
            }

            returnValue  = currentContext.get(key);
        }

        return returnValue;
    }

    private applyFilter(value: string, filter: IFilter): string {
        const filterFunction = this.filters.getFilter(filter.name);
        Assert.check(!!filterFunction, `Unknown filter: "${filter.name}"`);
        return filterFunction(value, ...filter.parameters);
    }

    private cleanHtmlFromSentence(sentence: string): string {
        Assert.check(Utils.isString(sentence), `${sentence} is not a string. You might want to validate your filter.`);
        return sentence.replace(/[\[\]""\(\),\.@=<>:]/g, "");
    }
}
