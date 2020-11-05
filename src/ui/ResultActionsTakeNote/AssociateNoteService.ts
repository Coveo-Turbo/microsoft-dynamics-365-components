export const ANNOTATIONS = "annotations";
import { Crm } from "../../Initialization";
import { UUID } from "../../utils/UUID";

export interface INoteRecordParams {
    notetext: string;
}

export class AssociateNote {
    public static createNoteAndAssociate(
        recordId: UUID,
        entityName: string,
        setName: string,
        notetext: string): Promise<void> {

        const createRecordData = { notetext } as INoteRecordParams;
        createRecordData[`objectid_${entityName}@odata.bind`] = `/${setName}(${recordId.toString()})`;

        return Crm.WebApi.createRecord(ANNOTATIONS, createRecordData);
    }
}
