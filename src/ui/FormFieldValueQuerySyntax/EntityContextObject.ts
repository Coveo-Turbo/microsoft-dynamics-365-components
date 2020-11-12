import { IContextObject } from "../../utils/Liquid/ContextObject";
import { UUID } from "../../utils/UUID";
import { CrmFormContextObject } from "./CrmFormContextObject";

export class EntityContextObject extends CrmFormContextObject {
    get(key: string): string | IContextObject {
        let value: string | IContextObject = "";
        if (parent.Xrm) {
            let entity = null;
            try {
                entity = parent.Xrm.Page.data.entity;
            } catch {
                console.log("No entity on page. returning empty string.");
                return "";
            }
            if (key === "id") {
                value = new UUID(entity.getId()).toString();
            } else {
                const attribute = entity.attributes.get(key);
                value = this.handleAttribute(attribute);
            }
        }
        return value;
    }
}
