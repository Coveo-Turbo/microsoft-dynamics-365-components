import { EventTypes, IAttributeWithValue, IContext } from "./IContext";
import { IQueryTranslator } from "./IQueryTranslator";

export class DefaultQueryTranslator implements IQueryTranslator {
    expandQuery(value: string): string {
        return value;
    }
    translateToken(token: string): IAttributeWithValue {
        return {
            name: token,
            value: ""
        };
    }
}

export class DefaultContext implements IContext {
    buildEventName(eventType: EventTypes, eventName: string): string {
        return `${eventType}:${eventName}`;
    }

    getAttributeValue(attributeName: string): IAttributeWithValue {
        return {
            name: attributeName,
            value: ""
        };
    }
    expandQuery(query: string): string {
        return "";
    }
}

export class Insight {
    public static context: IContext = new DefaultContext();
}
