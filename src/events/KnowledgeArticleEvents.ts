export enum KnowledgeArticleEvents {
    doneFetchingKnowledgeArticles = "doneFetchingKnowledgeArticles"
}

export interface IDoneFetchingKnowledgeArticlesEventArgs {
    linkedKnowledgeArticles: string[];
}
