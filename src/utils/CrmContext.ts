import { EventTypes, IAttributeWithValue, IContext } from "./IContext";
import { IQueryTranslator } from "./IQueryTranslator";

export class CrmContext implements IContext {

    constructor(private translator: IQueryTranslator) {}

    buildEventName(eventType: EventTypes, eventName: string): string {
        return `state:${eventType}:${eventName}`;
    }

    getAttributeValue(token: string): IAttributeWithValue {
        return this.translator.translateToken(token);
    }

    expandQuery(query: string): string {
        return this.translator.expandQuery(query);
    }
}
