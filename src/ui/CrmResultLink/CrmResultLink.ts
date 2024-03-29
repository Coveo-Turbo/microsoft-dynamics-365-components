import {
  $$,
  ComponentOptions,
  IQueryResult,
  IResultLinkOptions,
  IResultsComponentBindings,
  ResultLink,
} from "coveo-search-ui";
import { Crm } from "../../Initialization";
import { ResultOriginUtils } from "../../utils/SearchResults/ResultOriginUtils";
import { lazyDependentComponent } from '@coveops/turbo-core';

export interface ICrmResultLinkOptions extends IResultLinkOptions {
  alwaysUseXrmApi?: boolean;
  openInNewWindow?: boolean;
}


/**
 * The _CrmResultLink_ component ensures CRM search results URLs are properly configured with respect to the CRM context.
 */
@lazyDependentComponent('ResultLink')
export class CrmResultLink extends ResultLink {
  static ID = "CrmResultLink";

  /**
   * Possible options for the `CrmResultLink` component
   * @componentOptions
   */
  static options: ICrmResultLinkOptions = {
    /**
     * Specifies whether to use the XRM API or not.
     * When this option is set to `true` external result links are opened using [Xrm.Navigation.openUrl](https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-navigation/openurl).
     * Setting it to `false` leverages web browser capabilities when using the Dynamics 365 `web` client.
     *
     * Default value is `false`.
     */
    alwaysUseXrmApi: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),
    openInNewWindow: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),
  };

  /**
   * Creates a new `CrmResultLink` component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the `ResultLink` component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   * @param result The result with which to associate the component.
   */
  constructor(
    public element: HTMLElement,
    public options: ICrmResultLinkOptions,
    public bindings: IResultsComponentBindings,
    public result: IQueryResult
  ) {
    super(
      element,
      ComponentOptions.initComponentOptions(element, CrmResultLink, options),
      bindings,
      result
    );
  }

  protected bindEventToOpen() {
    $$(this.element).on("click", () => {
      if (
        ResultOriginUtils.resultBelongsToContextOrganization(this.result.uri)
      ) {
        const resultUri = ResultOriginUtils.parseItemUri(this.result.uri);
        Crm.Navigation.openForm(
          {
            entityName: resultUri.entityName,
            entityId: resultUri.recordId,
            openInNewWindow: this.options.openInNewWindow,
          },
          null
        );
      } else {
        if (
          this.options.alwaysUseXrmApi ||
          Crm.GlobalContext.client.getClient() !== "Web"
        ) {
          Crm.Navigation.openUrl(this.result.clickUri);
        } else {
          window.open(this.result.clickUri, "_blank");
        }
      }
    });
    return true;
  }
}