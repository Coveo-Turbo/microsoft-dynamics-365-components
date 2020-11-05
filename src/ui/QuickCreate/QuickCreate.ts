import {
  $$,
  ComponentOptions,
  IAnalyticsNoMeta,
  IQueryResult,
  IResultsComponentBindings,
  IStringMap,
  IViewAsHtmlOptions,
  Utils,
} from "coveo-search-ui";
import { Crm } from "../../Initialization";
import { SVGDom } from "../../utils/SVGDom";
import { SVGIcons } from "../../utils/SVGUtils";
import { ResultActionBase } from "../ResultAction/ResultActionBase";
import { lazyDependentComponent } from "@coveops/turbo-core";

export interface IFormParameterValue {
  field?: string;
  value?: string;
}

export interface IQuickCreateOptions {
  entityId?: string;
  entityName?: string;
  formId?: string;
  title?: string;
  caption?: string;
  useQuickCreateForm?: boolean;
  openInNewWindow?: boolean;
  formParameters?: IStringMap<IFormParameterValue>;
  maximumDocumentSize?: number;
}

/**
 * The _QuickCreate_ component opens a CRM form for users to create a new record.
 * This component can also be rendered inside a [search result template](https://docs.coveo.com/en/413). In such case, clicking the component opens a form and populates it with search result field values.
 */
@lazyDependentComponent("ResultActionBase")
export class QuickCreate extends ResultActionBase {
  static ID = "QuickCreate";

  /**
   * QuickCreate component options
   * @componentOptions
   */
  static options: IQuickCreateOptions = {
    /**
     * Specifies the ID of the entity record to display the form for.
     */
    entityId: ComponentOptions.buildStringOption(),
    /**
     * Specifies the logical name of the entity to display the form for.
     *
     * Default value is `knowledgearticle`.
     */
    entityName: ComponentOptions.buildStringOption({
      defaultValue: "knowledgearticle",
    }),
    /**
     * Specifies the ID of the form instance to be displayed.
     */
    formId: ComponentOptions.buildStringOption(),
    /**
     * Specifies the title displayed when hovering over the component.
     */
    title: ComponentOptions.buildStringOption({
      defaultValue: "Create a new record",
    }),
    /**
     * Specifies the caption displayed when the component is rendered in the result action list.
     */
    caption: ComponentOptions.buildStringOption({
      defaultValue: "Create a new record",
    }),
    /**
     * Specifies whether to open a Quick Create form.
     *
     * Default value is `true`.
     */
    useQuickCreateForm: ComponentOptions.buildBooleanOption({
      defaultValue: true,
    }),
    /**
     * Specifies whether to display form in a new window.
     *
     * Default value is `false`.
     */
    openInNewWindow: ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),

    /**
     * Specifies an array of fields to prepopulate in the opened form.
     *
     *
     * **Examples:**
     *
     * You can set the option in the 'init' call:
     * ```javascript
     * var myformParameters = {
     *   "title" : { "field": "@title"},
     *   "content" : { "value": "Hello World"},
     *   [ ... ]
     * };
     *
     * Coveo.init(document.querySelector('#search'), {
     *    QuickCreate : {
     *        formParameters : myformParameters
     *    }
     * })
     * ```
     *
     * Or directly in the markup:
     * ```html
     * <!-- Ensure that the double quotes are properly handled in data-form-parameters. -->
     * <div class='CoveoQuickCreate' data-form-parameters='{"title" : { "field": "@title"}, "content" : { "value": "Hello World"}}'></div>
     * ```
     */
    formParameters: ComponentOptions.buildJsonOption<
      IStringMap<IFormParameterValue>
    >(),
    /**
     * Specifies the maximum preview size that the index should return.
     *
     * Default value is `0`, and the index returns the entire preview. Minimum value is `0`.
     */
    maximumDocumentSize: ComponentOptions.buildNumberOption({
      defaultValue: 0,
      min: 0,
    }),
  };

  /**
   * Creates a new QuickCreate component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the QuickCreate component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   * @param result The result with which the component should be associated.
   */
  public constructor(
    public element: HTMLElement,
    public options: IQuickCreateOptions,
    public bindings?: IResultsComponentBindings,
    public result?: IQueryResult
  ) {
    super(element, QuickCreate.ID, bindings);

    this.options = ComponentOptions.initComponentOptions(
      element,
      QuickCreate,
      options
    );

    this.render();
  }

  openQuickCreateForm() {
    return this.openForm(null);
  }

  getDocumentBodyAndOpenQuickCreateForm() {
    const endpoint = this.queryController.getEndpoint();

    const queryObject = _.extend(
      {},
      this.getBindings().queryController.getLastQuery()
    );
    const callOptions: IViewAsHtmlOptions = {
      queryObject: queryObject,
      requestedOutputSize: this.options.maximumDocumentSize,
    };

    return endpoint
      .getDocumentHtml(this.result.uniqueId, callOptions)
      .then((html: HTMLDocument) => this.openForm(html));
  }

  openForm(documentHtml: HTMLDocument) {
    return new Promise<void>((resolve, reject) => {
      Crm.Navigation.openForm(
        {
          entityId: this.options.entityId,
          entityName: this.options.entityName,
          formId: this.options.formId,
          useQuickCreateForm: this.options.useQuickCreateForm,
          openInNewWindow: this.options.openInNewWindow,
        },
        this.getFormProperties(documentHtml)
      ).then(
        () => resolve(),
        (error) => reject(error)
      );
    });
  }

  private getFormProperties(documentHtml: HTMLDocument) {
    if (this.result && this.options.formParameters) {
      const output = {};
      Object.keys(this.options.formParameters).forEach((key) => {
        const field = this.options.formParameters[key].field;
        let value = this.options.formParameters[key].value;

        if (field === "body" && documentHtml) {
          value = documentHtml.body.innerText;
        } else if (field) {
          value = this.getValue(field);
        }

        if (value) {
          output[key] = _.escape(value);
        }
      });

      return output;
    }
    return null;
  }

  private getValue(field: string) {
    let value = Utils.getFieldValue(this.result, field);
    if (!_.isArray(value) && _.isObject(value)) {
      value = null;
    }
    return value;
  }

  getTitle(): HTMLElement {
    const menuDiv = $$("div", { className: "coveo-quickcreate-in-menu" });
    $$(this.element)
      .children()
      .forEach((child) => menuDiv.append(child));
    return menuDiv.el;
  }

  protected render() {
    super.render();
    const iconForQuickCreate = $$(
      "div",
      { className: "coveo-icon-for-quickcreate coveo-icon" },
      SVGIcons.icons.add
    );
    SVGDom.addClassToSVGInContainer(
      iconForQuickCreate.el,
      "coveo-icon-for-quickcreate-svg"
    );

    const captionInMenu = $$("div", { className: "coveo-caption" });
    captionInMenu.text(this.options.caption.toLocaleString());

    const div = $$("div", { className: "coveo-quickcreate" });
    div.append(iconForQuickCreate.el);
    div.append(captionInMenu.el);
    $$(this.element).append(div.el);

    this.bindClick();
  }

  private bindClick() {
    $$(this.element).on("click", (event: Event) => {
      event.stopPropagation();
      this.result && this.result.hasHtmlVersion
        ? this.getDocumentBodyAndOpenQuickCreateForm()
        : this.openQuickCreateForm();
      this.logToUsageAnalytics();
    });
  }

  private logToUsageAnalytics() {
    this.bindings.usageAnalytics.logCustomEvent<IAnalyticsNoMeta>(
      { name: "createItem", type: this.options.entityName },
      {},
      this.element
    );
  }
}
