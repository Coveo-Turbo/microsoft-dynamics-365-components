import { FormContextHandler } from "../../Initialization";
import { UUID } from "../../utils/UUID";
import { LinkedArticles } from "./LinkedArticles";

export class LinkedArticlesSingleton {
    private static linkedArticles: LinkedArticles;
    private static lastId: UUID;

    static getInstance(root: HTMLElement): LinkedArticles {
        if (!this.linkedArticles || !this.lastId.equals(FormContextHandler.recordId)) {
            this.linkedArticles = new LinkedArticles(FormContextHandler.recordId, root);
            this.lastId = FormContextHandler.recordId;
        }
        return this.linkedArticles;
    }
}
