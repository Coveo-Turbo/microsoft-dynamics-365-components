import { IQueryResult, Template } from "coveo-search-ui";

export class DefaultResultActionsTakeNoteTemplate extends Template {
    public instantiateToString(queryResult?: IQueryResult): string {
        return `<div><span>Marked as relevant: </span><span class=\"CoveoResultLink\"></span></div>`;
    }
}
