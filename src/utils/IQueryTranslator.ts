import { IAttributeWithValue } from "./IContext";

export interface IQueryTranslator {
    expandQuery(value: string): string;
    translateToken(token: string): IAttributeWithValue;
}
