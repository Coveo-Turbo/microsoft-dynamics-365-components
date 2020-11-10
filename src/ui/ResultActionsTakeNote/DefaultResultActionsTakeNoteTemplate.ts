import { IQueryResult, Template } from "coveo-search-ui";

export class DefaultResultActionsTakeNoteTemplate extends Template {
    public instantiateToString(queryResult?: IQueryResult): string {
        return `<div><span>The following item has been marked as relevant: </span><br /><span class=\"CoveoResultLink\"></span> <br /><br /><span class=\"CoveoFieldValue\" data-field=\"@clickuri\"></span></div>`;
    }
}
