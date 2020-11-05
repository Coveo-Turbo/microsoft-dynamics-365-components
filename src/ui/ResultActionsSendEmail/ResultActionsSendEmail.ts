import {
  $$,
  ComponentOptions,
  IQueryResult,
  IResultsComponentBindings,
} from "coveo-search-ui";
import { CrmClient } from "coveo-xrm";
import { DynamicsErrorCodes, IDynamicsError } from "../../core/DynamicsError";
import { inject, Injectable } from "../../core/Injector";
import { IRecord } from "../../core/IRecord";
import { LinkedArticlesRequests } from "../../crmClient/requests/LinkedArticlesRequests";
import { Form, FormContextHandler } from "../../Initialization";
import { ResultOriginUtils } from "../../utils/SearchResults/ResultOriginUtils";
import { UUID } from "../../utils/UUID";
import { ResultActionBase } from "../ResultAction/ResultActionBase";
import { lazyDependentComponent } from "@coveops/turbo-core";

const iconSvg: string = require("./icon.svg").toString();

export interface IResultActionsSendEmailOptions {
  title: string;
  formId: string;
  openInNewWindow: boolean;
  useQuickCreateForm: boolean;
}

/**
 * The _ResultActionsSendEmail_ component allows sending an email to a customer.
 */
@lazyDependentComponent("ResultActionBase")
export class ResultActionsSendEmail extends ResultActionBase {
  static ID = "ResultActionsSendEmail";
  /**
   * Possible options for the `ResultActionsSendEmail` component
   * @componentOptions
   */
  static options: IResultActionsSendEmailOptions = {
    /**
     * Specifies the title displayed over the component when the result can be emailed.
     *
     * Default value is `Email`.
     */
    title: ComponentOptions.buildStringOption({ defaultValue: "Email" }),

    /**
     * Specifies whether to display the form in a new window.
     *
     * Default value is `false`.
     */
    openInNewWindow: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),

    /**
     * Specifies whether to open a Quick Create form.
     *
     * Default value is `false`.
     */
    useQuickCreateForm: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),

    /**
     * Specifies the ID of the form instance to display.
     */
    formId: ComponentOptions.buildStringOption(),
  };

  @inject(Injectable.CrmClient)
  private Crm: CrmClient;

  /**
   * Creates a new _Email_ component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the _Email_ component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   * @param result The result to associate with the component.
   */
  constructor(
    public element: HTMLElement,
    public options: IResultActionsSendEmailOptions,
    public bindings: IResultsComponentBindings,
    public result?: IQueryResult
  ) {
    super(element, ResultActionsSendEmail.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      ResultActionsSendEmail,
      options
    );

    debugger;

    if (this.display()) {
      this.render();
      $$(this.element).on("click", () => this.handleClick());
    } else {
      this.hide();
    }
  }

  display(): boolean {
    return (
      ResultOriginUtils.isKnowledgeArticleFromContextOrganization(
        this.result.uri
      ) && FormContextHandler.entityName === "incident"
    );
  }

  protected render() {
    super.render();
    const action = $$(
      "div",
      {
        className: "coveo-email-action",
        title: this.options.title.toLocaleString(),
      },
      $$(
        "div",
        {
          className: "coveo-icon",
        },
        iconSvg
      )
    );

    $$(this.element).append(action.el);
  }

  private handleClick(): void {
    this.linkAndOpenEmailForm().catch((error) => {
      this.Crm.Navigation.openErrorDialog({
        message: "An error occured when linking the record to case.",
        details: error ? error.message : "",
      });
    });
  }

  private async linkAndOpenEmailForm(): Promise<void> {
    const articleId = new UUID(ResultOriginUtils.recordId(this.result.uri));
    const shouldOpenEmailForm = await this.linkToCase(articleId);
    if (shouldOpenEmailForm) {
      const article = await this.fetchArticle(articleId);
      return this.openEmailForm(article);
    }
  }

  private linkToCase(articleId: UUID): Promise<boolean> {
    const incidentId = FormContextHandler.recordId;
    return LinkedArticlesRequests.link(articleId, incidentId)
      .catch((error) => this.handleLinkError(error))
      .then(
        (confirmResult: Xrm.Navigation.ConfirmResult) =>
          !confirmResult || confirmResult.confirmed
      );
  }

  private handleLinkError(error: Error): Promise<Xrm.Navigation.ConfirmResult> {
    if (error && error.message) {
      const errorMessage: IDynamicsError = JSON.parse(error.message).error;
      if (
        errorMessage &&
        errorMessage.code &&
        errorMessage.code === DynamicsErrorCodes.KBAlreadyLinked
      ) {
        return this.Crm.Navigation.openConfirmDialog(
          {
            title: "AssociationAlreadyExists".toLocaleString(),
            text: "AssociationAlreadyExistsText".toLocaleString(),
          },
          undefined
        );
      }
    }
    throw error;
  }

  private fetchArticle(articleId: UUID): Promise<IRecord> {
    return this.Crm.WebApi.init()
      .resource(`knowledgearticles(${articleId.toString()})`)
      .select(["title", "content"])
      .get()
      .build<IRecord>();
  }

  private openEmailForm(article: IRecord): Promise<void> {
    const titleAttribute = Form.getAttribute<Xrm.Attributes.StringAttribute>(
      "title"
    );
    return this.Crm.Navigation.openForm(
      {
        createFromEntity: {
          entityType: FormContextHandler.entityName,
          id: FormContextHandler.recordId.toString(),
          name: titleAttribute ? titleAttribute.getValue() : undefined,
        },
        entityName: "email",
        formId: this.options.formId,
        openInNewWindow: this.options.openInNewWindow,
        useQuickCreateForm: this.options.useQuickCreateForm,
      },
      {
        subject: article["title"],
        description: this.getArticleContent(article),
      }
    );
  }

  private getArticleContent(article: IRecord) {
    const rawContent = article["content"];
    const parser = document.createElement("div");
    parser.innerHTML = rawContent;

    return parser.innerText;
  }
}
