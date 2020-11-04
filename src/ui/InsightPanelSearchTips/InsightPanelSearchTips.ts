import {
  Component,
  IComponentBindings,
  ComponentOptions,
  $$,
  l,
} from "coveo-search-ui";
import { lazyComponent } from "@coveops/turbo-core";

export interface IInsightPanelSearchTipsOptions {}

/**
 * The _CoveoInsightPanelSearchTips_ component renders search tips to be displayed when no results are found.
 */
@lazyComponent
export class InsightPanelSearchTips extends Component {
  static ID = "InsightPanelSearchTips";
  static options: IInsightPanelSearchTipsOptions = {};

  constructor(
    public element: HTMLElement,
    public options: IInsightPanelSearchTipsOptions,
    public bindings: IComponentBindings
  ) {
    super(element, InsightPanelSearchTips.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      InsightPanelSearchTips,
      options
    );
    this.render();
  }

  private render() {
    const innerWrapper = $$("span", {});
    const searchTips = $$(
      "div",
      { className: "coveo-query-summary-search-tips-info" },
      l("SearchTips")
    );
    const searchTipsList = $$("ul", {});

    searchTipsList.append($$("li", {}, l("TypingSomethingRemovesContext")).el);
    searchTipsList.append($$("li", {}, l("CheckSpelling")).el);
    searchTipsList.append($$("li", {}, l("TryUsingFewerKeywords")).el);

    innerWrapper.append(searchTips.el);
    innerWrapper.append(searchTipsList.el);

    $$(this.element).append(innerWrapper.el);
  }
}
