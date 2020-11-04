import { IRecord } from "../../core/IRecord";
import { IContextObject } from "./ContextObject";

export class AsyncContextObject implements IContextObject {
    constructor(private record: IRecord, private id: string) {}

    get(key: string): string | IContextObject {
        if (key === "id") {
            return this.id;
        }
        if (this.record[key]) {
            return this.record[key].toString();
        }
        if (this.record[`_${key}_value`]) {
            return new AsyncLookupContextValue(
                this.record[`_${key}_value@OData.Community.Display.V1.FormattedValue`],
                this.record[`_${key}_value`]
            );
        }
        return "";
    }
}

export class AsyncLookupContextValue implements IContextObject {
    constructor(private name: string, private rawValue: string) {}

    get(key: string): string | IContextObject {
        if (key === "name") {
            return this.name;
        } else if (key === "value") {
            return this.rawValue;
        }
        return "";
    }
}
