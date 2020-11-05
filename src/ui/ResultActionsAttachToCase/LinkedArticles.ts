import { $$ } from "coveo-search-ui";
import { IKnowledgeArticleIncident, KnowledgeArticleIncidentProps, LinkedArticlesRequests } from "../../crmClient/requests/LinkedArticlesRequests";
import { IDoneFetchingKnowledgeArticlesEventArgs, KnowledgeArticleEvents } from "../../events/KnowledgeArticleEvents";
import { UUID } from "../../utils/UUID";

export class LinkedArticles {
    private linkedArticleRequest: Promise<void>;
    private linkedKnowledgeArticles: IKnowledgeArticleIncident[] = [];
    private root: HTMLElement;
    private incidentId: UUID;

    constructor(incidentId: UUID,
                root: HTMLElement) {
        this.incidentId = incidentId;
        this.root = root;
    }

    isLinked(articleId: UUID) {
        let isLinked = false;
        if (this.linkedArticleRequest) {
            if (this.linkedKnowledgeArticles.some(article => article[KnowledgeArticleIncidentProps.articleId] === articleId.toString())) {
                isLinked = true;
            }
        } else {
            this.retrieveLinkedArticles();
        }
        return isLinked;
    }

    link(articleId: UUID) {
        return LinkedArticlesRequests
            .link(articleId, this.incidentId)
            .then(() => this.refresh());
    }

    unlink(articleId: UUID) {
        return LinkedArticlesRequests
            .unlink(articleId, this.incidentId)
            .then(() => this.refresh());
    }

    refresh() {
        return this.retrieveLinkedArticles();
    }

    private retrieveLinkedArticles() {
        this.linkedArticleRequest = LinkedArticlesRequests
            .fetch(this.incidentId)
            .then((linkedKnowledgeArticles: IKnowledgeArticleIncident[]) => {
                this.linkedKnowledgeArticles = linkedKnowledgeArticles;
                $$(this.root)
                    .trigger(KnowledgeArticleEvents.doneFetchingKnowledgeArticles, {
                        linkedKnowledgeArticles: linkedKnowledgeArticles.map(article => article[KnowledgeArticleIncidentProps.articleId])
                    } as IDoneFetchingKnowledgeArticlesEventArgs);
            });
        return this.linkedArticleRequest;
    }
}
