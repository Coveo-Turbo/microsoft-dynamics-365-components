import {
  $$,
  analyticsActionCauseList,
  Component,
  ComponentOptions,
  HashUtils,
  IAnalyticsNoMeta,
  IComponentBindings,
  IDoneBuildingQueryEventArgs,
  Initialization,
  ISettingsPopulateMenuArgs,
  l,
  QueryEvents,
  QueryStateModel,
  SettingsEvents,
} from "coveo-search-ui";
import { Crm, FormContextHandler } from "../../Initialization";
import { Insight } from "../../utils/Insight";
import { SVGDom } from "../../utils/SVGDom";
import { SVGIcons } from "../../utils/SVGUtils";
import { lazyComponent } from "@coveops/turbo-core";

export interface IOpenFullSearchOptions {
  text?: string;
  webResourceName?: string;
  renderInSettingsMenu?: boolean;
  fullPageContextDescription: string;
  addHiddenQuery: boolean;
  height: number;
  width: number;
}

interface IHashParameters {
  hq?: string;
  hd?: string;
  entity?: string;
  record?: string;
}

/**
 * The _OpenFullSearch_ component renders a link to the main Coveo Search Page.
 */
@lazyComponent
export class OpenFullSearch extends Component {
  static ID = "OpenFullSearch";
  /**
   * Possible options for the `OpenFullSearch` component
   * @componentOptions
   */
  static options: IOpenFullSearchOptions = {
    /**
     * Specifies the description to display when the full search page loads with a context filter.
     *
     * Default value is the localized string for `Context`.
     *
     * ```html
     * <div data-full-page-context-description='Context'></div>
     * ```
     */
    fullPageContextDescription: ComponentOptions.buildLocalizedStringOption({
      defaultValue: l("Context"),
    }),
    /**
     * Specifies the text content to add inside the icon HTML element.
     *
     * Default value is the localized string for `GoToFullSearch`.
     *
     * ```html
     * <div data-text='Go To Full Search'></div>
     * ```
     */
    text: ComponentOptions.buildLocalizedStringOption({
      defaultValue: l("GoToFullSearch"),
    }),
    /**
     * Specifies the name of the Coveo search page web resource to open.
     *
     * @deprecated This options is mostly kept for legacy reasons. If possible, you should avoid using it.
     */
    webResourceName: ComponentOptions.buildStringOption(),
    /**
     * Specifies whether the component should be rendered under the Coveo Settings component.
     *
     * Default value is `false`.
     */
    renderInSettingsMenu: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),

    /**
     * Specifies whether the query filter of the interface should be transmitted to the opened interface.
     *
     * Default value is 'false'.
     */
    addHiddenQuery: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),

    /**
     * Specifies the height of the window to open.
     *
     * Default value is '600'.
     */
    height: ComponentOptions.buildNumberOption({ defaultValue: 600 }),

    /**
     * Specifies the width of the window to open.
     *
     * Default value is '870'.
     */
    width: ComponentOptions.buildNumberOption({ defaultValue: 870 }),
  };

  private hash: IHashParameters;

  /**
   * Creates a new _OpenFullSearch_ component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the _OpenFullSearch_ component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  constructor(
    public element: HTMLElement,
    public options: IOpenFullSearchOptions,
    public bindings: IComponentBindings
  ) {
    super(element, OpenFullSearch.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      OpenFullSearch,
      options
    );

    this.render();
    this.setBaseHash();
    this.bind.onRootElement(
      QueryEvents.doneBuildingQuery,
      (args: IDoneBuildingQueryEventArgs) => {
        this.setNewHash(args);
      }
    );
  }

  /**
   * Opens the Coveo main search page.
   */
  public openFullSearch() {
    const stateValues = this.buildHash();
    const webResource: string =
      this.options.webResourceName || this.getResourceUrl();

    Crm.Navigation.openWebResource(`${webResource}#${stateValues}`, {
      width: this.options.width,
      height: this.options.height,
    } as Xrm.Navigation.OpenWebresourceOptions);

    this.usageAnalytics.logCustomEvent<IAnalyticsNoMeta>(
      analyticsActionCauseList.expandToFullUI,
      {},
      this.element
    );
  }

  private buildHash() {
    const baseState = this.queryStateModel.getAttributes();
    const state = { ...this.hash, ...baseState };
    return HashUtils.encodeValues(state);
  }

  private setBaseHash() {
    const entity = FormContextHandler.entityName;
    const record = entity ? FormContextHandler.recordId.toString() : null;

    this.hash = {
      entity,
      record,
    };
  }

  private setNewHash(args: IDoneBuildingQueryEventArgs) {
    const q = this.queryStateModel.get(QueryStateModel.attributesEnum.q);
    if (this.options.addHiddenQuery) {
      this.hash.hq = this.buildHiddenQuery(q, args);
      this.hash.hd = this.getHiddenQueryDescription();
    }
  }

  private buildHiddenQuery(q: string, args: IDoneBuildingQueryEventArgs) {
    if (Coveo.Utils.isNonEmptyString(q)) {
      return args.queryBuilder.computeCompleteExpressionPartsExcept(q)
        .withoutConstant;
    }
    return args.queryBuilder.computeCompleteExpressionParts().withoutConstant;
  }

  private getHiddenQueryDescription() {
    return Insight.context.expandQuery(this.options.fullPageContextDescription);
  }

  private render() {
    if (this.options.renderInSettingsMenu) {
      this.bind.onRootElement(
        SettingsEvents.settingsPopulateMenu,
        (args: ISettingsPopulateMenuArgs) => {
          args.menuData.push({
            text: this.options.text,
            className: "coveo-open-full-search",
            onOpen: () => this.openFullSearch(),
            svgIcon: SVGIcons.icons.external,
            svgIconClassName: "coveo-open-full-search-svg",
          });
        }
      );
    } else {
      const icon = $$(
        "span",
        { className: "coveo-icon coveo-open-full-search" },
        SVGIcons.icons.external
      );
      SVGDom.addClassToSVGInContainer(icon.el, "coveo-open-full-search-svg");
      const label = $$("span");
      label.text(this.options.text);
      const element = $$(this.element);
      element.append(label.el);
      element.append(icon.el);

      $$(this.element).on("click", () => this.openFullSearch());
    }
  }

  private getResourceUrl() {
    const splittedPath = window.location.pathname.split("coveo_/");
    return splittedPath.length > 1
      ? "coveo_/" + splittedPath[1]
      : "coveo_/searchpages/default.html";
  }
}
