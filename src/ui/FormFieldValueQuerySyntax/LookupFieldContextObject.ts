import { IContextObject } from "../../utils/Liquid/ContextObject";

export class LookupFieldContextObject implements IContextObject {
    constructor(private attribute: Xrm.Attributes.LookupAttribute) {}

    get(key: string): string | IContextObject {
        const value = this.attribute.getValue();
        if (!value) {
            return "";
        }

        if (key === "id") {
            return value[0].id || "";
        }

        if (key === "name") {
            return value[0].name || "";
        }

        return "";
    }
}
