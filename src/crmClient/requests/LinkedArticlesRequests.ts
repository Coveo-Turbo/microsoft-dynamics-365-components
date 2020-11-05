import { Crm } from "../../Initialization";
import { UUID } from "../../utils/UUID";

const knowledgeArticleIncidents = "knowledgearticleincidents";
const incidentTypeCode = 112;

export interface IKnowledgeArticleIncident {
    knowledgearticleincidentid: string;
}

export enum KnowledgeArticleIncidentProps {
    articleId = "_knowledgearticleid_value",
    incidentId = "_incidentid_value"
}

export class LinkedArticlesRequests {
    static fetch(incidentId: UUID): Promise<IKnowledgeArticleIncident[]> {
        return Crm.WebApi
            .init()
            .resource(knowledgeArticleIncidents)
            .filter(`incidentid/incidentid eq ${incidentId.toString()} and statecode eq 0`)
            .select([KnowledgeArticleIncidentProps.articleId])
            .get()
            .build<any>()
            .then(response => response.value.map(value => value));
    }

    static link(articleId: UUID, incidentId: UUID) {
        return Crm.WebApi
            .init()
            .resource("AssociateKnowledgeArticle")
            .post({
                AssociationRelationshipName: "knowledgearticlecategories",
                KnowledgeArticleId: articleId.toString(),
                RegardingObjectId: incidentId.toString(),
                RegardingObjectTypeCode: incidentTypeCode
            })
            .build();
    }

    static unlink(articleId: UUID, incidentId: UUID) {
        return Crm.WebApi
            .init()
            .resource("DisassociateKnowledgeArticle")
            .post({
                AssociationRelationshipName: "knowledgearticlecategories",
                KnowledgeArticleId: articleId.toString(),
                RegardingObjectId: incidentId.toString(),
                RegardingObjectTypeCode: incidentTypeCode
            })
            .build();
    }
}
