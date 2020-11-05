import {
  $$,
  Component,
  ComponentOptions,
  HashUtils,
  IComponentBindings,
  l,
} from "coveo-search-ui";
import { CrmClient } from "coveo-xrm";
import { inject, Injectable } from "../../core/Injector";
import { IRecord } from "../../core/IRecord";
import { Annotations } from "../../core/ODataConstants";
import { FormContextHandler } from "../../Initialization";
import { InsightEvents } from "../../models/QueryStateModel";
import { ContextAttributes } from "./ContextAttributes";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { lazyComponent } from "@coveops/turbo-core";

export interface IContextFacetOptions {
  logicalName: string;
  identifierAttribute: string;
  attributes: string[];
  additionalAttributes: string[];
}

/**
 * The _ContextFacet_ component allows using a Dynamics context in an interface that does not contain any.
 */
@lazyComponent
export class ContextFacet extends Component {
  static ID = "ContextFacet";

  /**
   * The options for the ContextFacet.
   * @componentOptions
   */
  static options: IContextFacetOptions = {
    /**
     * Specifies the logical name of the entity for which to render the facet.
     *
     * Default value is `incident`.
     */
    logicalName: ComponentOptions.buildStringOption({
      defaultValue: "incident",
    }),

    /**
     * Specifies the record attribute that constitutes the label displayed in the facet header.
     *
     * Default value is `ticketnumber`.
     */
    identifierAttribute: ComponentOptions.buildStringOption({
      defaultValue: "ticketnumber",
    }),

    /**
     * Specifies the attributes to display in the facet.
     *
     * Default values are `title`, `createdon`, `statuscode`, `_ownerid_value`.
     */
    attributes: ComponentOptions.buildListOption<string>({
      defaultValue: ["title", "createdon", "statuscode", "_ownerid_value"],
    }),

    /**
     * By default, for optimal performance, a context facet displays a limited set of attributes. This option specifies additional attributes to retrieve and display in the facet.
     */
    additionalAttributes: ComponentOptions.buildListOption<string>(),
  };

  @inject(Injectable.CrmClient)
  private crm: CrmClient;

  /**
   * Creates a new ContextFacet component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the ContextFacet component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  constructor(
    public element: HTMLElement,
    public options: IContextFacetOptions,
    public bindings: IComponentBindings,
    public _window?: Window
  ) {
    super(element, ContextFacet.ID, bindings);
    this._window = this._window || window;
    this.options = ComponentOptions.initComponentOptions(
      element,
      ContextFacet,
      options
    );

    const stateEntity = HashUtils.getValue(
      ContextAttributes.entity,
      HashUtils.getHash(this._window)
    );
    if (stateEntity === this.options.logicalName) {
      this.initializeStateAttribute();
      this.retrieveRecord();
    } else {
        this.logger.info('No entity detected.');
    }
  }

  private triggerContextRetrievedEvent() {
    $$(this.root).trigger(InsightEvents.contextRetrieved);
  }

  private async retrieveRecord(): Promise<void> {
    const entity = this.queryStateModel.get(ContextAttributes.entity);
    const id = this.queryStateModel.get(ContextAttributes.record);
    if (!entity || !id) {
      return;
    }

    let collectionName: string;
    try {
      collectionName = await FormContextHandler.getEntitySetName(
        this.crm.WebApi,
        entity
      );
    } catch (error) {
      this.logger.warn(
        `An error occured while retrieving the definition of entity "${entity}".`
      );
      this.logger.warn(error);
      return;
    }

    try {
      await this.requestRecord(collectionName, id).then((record) =>
        this.setContextRecord(record, entity, id)
      );
    } catch (error) {
      this.logger.warn(
        `An error occured while retrieving record of type "${entity}" with ID "${id}".`
      );
      this.logger.warn(error);
    }

    this.triggerContextRetrievedEvent();
  }

  private requestRecord(collectionName: string, id: string): Promise<IRecord> {
    const odata = this.crm.WebApi.init();
    return odata
      .resource(`${collectionName}(${id})`)
      .select([
        ...this.options.attributes,
        this.options.identifierAttribute,
        ...this.options.additionalAttributes,
      ])
      .withHeader({
        name: "Prefer",
        value: `odata.include-annotations=${Annotations.formattedValue}`,
      })
      .get()
      .build<IRecord>();
  }

  private setContextRecord(record: IRecord, entity: string, recordId: string) {
    FormContextHandler.setAsyncFormContext(record, entity, recordId);
    this.render(record);
    this.queryController.executeQuery();
  }

  private initializeStateAttribute() {
    const stateEntity = HashUtils.getValue(
      ContextAttributes.entity,
      HashUtils.getHash(this._window)
    );
    const stateRecord = HashUtils.getValue(
      ContextAttributes.record,
      HashUtils.getHash(this._window)
    );
    this.queryStateModel.registerNewAttribute(
      ContextAttributes.entity,
      undefined
    );
    this.queryStateModel.registerNewAttribute(
      ContextAttributes.record,
      undefined
    );
    this.queryStateModel.set(ContextAttributes.entity, stateEntity);
    this.queryStateModel.set(ContextAttributes.record, stateRecord);
  }

  private render(record: IRecord) {
    this.renderHeader(record);
    this.renderContent(record);
    this.show();
  }

  private renderHeader(record: IRecord) {
    const header = $$("div", {
      className: "coveo-context-header",
      title: l("ContextFacetTooltip"),
    });
    const headerFrom = $$(
      "div",
      { className: "coveo-context-header-from" },
      "Opened from"
    );
    const headerEntity = $$(
      "div",
      { className: "coveo-context-header-entity" },
      l(this.options.logicalName)
    );
    const headerEntityIdentifier = $$(
      "span",
      { className: "identifier" },
      record[this.options.identifierAttribute]
    );

    headerEntity.append(headerEntityIdentifier.el);
    header.append(headerFrom.el);
    header.append(headerEntity.el);

    tippy(header.el, {});

    $$(this.element).append(header.el);
  }

  private renderContent(record: IRecord) {
    const attributes = this.options.attributes;
    if (attributes.length > 0) {
      const middle = Math.ceil(attributes.length / 2);
      const leftAttributes = attributes.slice(0, middle);
      const rightAttributes = attributes.slice(middle, attributes.length);

      const content = $$("div", { className: "coveo-context-content" });
      const contentCol1 = $$("div", { className: "coveo-context-col" });
      const contentCol2 = $$("div", { className: "coveo-context-col" });

      leftAttributes
        .map((attribute) => this.getRenderedValueDisplay(attribute, record))
        .forEach((attribute) => {
          contentCol1.append(attribute);
        });

      rightAttributes
        .map((attribute) => this.getRenderedValueDisplay(attribute, record))
        .forEach((attribute) => {
          contentCol2.append(attribute);
        });

      content.append(contentCol1.el);
      content.append(contentCol2.el);

      $$(this.element).append(content.el);
    }
  }

  private getRenderedValueDisplay(
    attribute: string,
    record: IRecord
  ): HTMLElement {
    const value =
      record[`${attribute}@${Annotations.formattedValue}`] || record[attribute];

    const contextAttribute = $$("div", {
      className: "coveo-context-attribute",
    });
    const contextTitle = $$(
      "div",
      { className: "coveo-context-title", title: l(attribute) },
      l(attribute)
    );
    const contextValue = $$(
      "div",
      { className: "coveo-context-value", title: value },
      value
    );

    contextAttribute.append(contextTitle.el);
    contextAttribute.append(contextValue.el);

    return contextAttribute.el;
  }

  private show() {
    $$(this.element).addClass(["coveo-active"]);
  }
}
