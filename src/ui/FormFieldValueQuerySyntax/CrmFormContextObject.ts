import { IFormContext } from "coveo-xrm";
import { IContextObject } from "../../utils/Liquid/ContextObject";
import { LookupFieldContextObject } from "./LookupFieldContextObject";
import { OptionSetFieldContextObject } from "./OptionSetFieldContextObject";

export class CrmFormContextObject implements IContextObject {
    constructor(private formContext: IFormContext) {}

    get(key: string): string | IContextObject {
        const attribute = this.formContext.getAttribute<Xrm.Attributes.Attribute>(key);
        return this.handleAttribute(attribute);
    }

    protected handleAttribute(attribute: Xrm.Attributes.Attribute) {
        const value = attribute ? attribute.getValue() : null;
        let outputAttribute: string | IContextObject = "";
        if (value) {
            outputAttribute = this.tryHandlingLookupAttribute(attribute);

            if (!outputAttribute) {
                outputAttribute = this.tryHandlingOptionSetAttributes(attribute);
            }

            if (!outputAttribute) {
                outputAttribute = this.tryHandlingPureValueAttributes(attribute);
            }
        }

        return outputAttribute;
    }

    private tryHandlingLookupAttribute(lookUpAttribute: Xrm.Attributes.Attribute) {
        const lookup = lookUpAttribute as Xrm.Attributes.LookupAttribute;
        if (lookup.getIsPartyList) {
            // Attribute is a lookup
            return new LookupFieldContextObject(lookup);
        }
        return null;
    }

    private tryHandlingOptionSetAttributes(attribute: Xrm.Attributes.Attribute) {
        const optionSetAttribute = attribute as Xrm.Attributes.OptionSetAttribute;
        if (optionSetAttribute.getText) {
            // Attribute is an option set
            return new OptionSetFieldContextObject(optionSetAttribute);
        }
        return null;
    }

    private tryHandlingPureValueAttributes(attribute: Xrm.Attributes.Attribute) {
        const value = attribute.getValue();
        if (value instanceof Date) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
            return ((value as Date).getTime() / 1000).toString();
        }
        return value.toString ? value.toString() : "";
    }
}
