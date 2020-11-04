export class EventTypes {
    static Change = "change";
}

export interface IContext {
    getAttributeValue(attributeName: string): IAttributeWithValue;
    buildEventName(eventType: EventTypes, eventName: string): string;
    expandQuery(query: string): string;
}

export interface IAttributeWithValue {
    name: string;
    value: string;
}
