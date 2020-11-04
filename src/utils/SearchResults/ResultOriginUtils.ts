import { Crm } from "../../Initialization";

export interface ICrmItemUri {
    orgUniqueId: string;
    entityName: string;
    recordId: string;
}

const knowledgeArticle = "KnowledgeArticle";

export class ResultOriginUtils {
    static isKnowledgeArticleFromContextOrganization(itemUri: string): boolean {
        const parsedUri = ResultOriginUtils.parseItemUri(itemUri);
        return parsedUri
            && parsedUri.entityName.toLowerCase() === knowledgeArticle.toLowerCase()
            && parsedUri.orgUniqueId.toLowerCase() === Crm.GlobalContext.getOrgUniqueName();
    }

    static resultBelongsToContextOrganization(itemUri: string) {
        const parsedUri = ResultOriginUtils.parseItemUri(itemUri);
        return parsedUri
            && parsedUri.orgUniqueId.toLowerCase() === Crm.GlobalContext.getOrgUniqueName();
    }

    static recordId(itemUri: string) {
        const parsedUri = ResultOriginUtils.parseItemUri(itemUri);
        return parsedUri
            ? parsedUri.recordId
            : "";
    }

    static parseItemUri(uri: string): ICrmItemUri {
        const match = /Organization:(\w*)\/Entity:(\w*)\/Record:(\w*)/g.exec(uri);
        if (match && match.length === 4) {
            return {
                orgUniqueId: match[1],
                entityName: match[2],
                recordId: match[3]
            };
        }
        return null;
    }
}
