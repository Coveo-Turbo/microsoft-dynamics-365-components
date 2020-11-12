import { IContextObject } from "../../utils/Liquid/ContextObject";

export class OptionSetFieldContextObject implements IContextObject {
    constructor(private attribute: Xrm.Attributes.OptionSetAttribute) {}

    get(key: string): string | IContextObject {
        if (key === "value") {
            const value = this.attribute.getValue();
            return value ? value.toString() : "";
        }

        if (key === "text") {
            return this.attribute.getText();
        }

        return "";
    }
}
