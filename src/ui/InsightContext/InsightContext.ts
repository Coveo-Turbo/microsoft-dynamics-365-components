import {
  ComponentOptions,
  IBuildingQueryEventArgs,
  IComponentBindings,
  PipelineContext,
  QueryEvents,
} from "coveo-search-ui";
import { each, isArray, isString } from "underscore";
import { IAttributeWithValue } from "../../utils/IContext";
import { Insight } from "../../utils/Insight";
import { lazyDependentComponent } from "@coveops/turbo-core";

export interface IInsightContextOptions {
  fieldsToInclude: string[];
}

/**
 * The _InsightContext_ component is similar to the _PipelineContext_ component, the difference being that the _InsightContext_ component is used to inject CRM form field values into the query context.
 */
@lazyDependentComponent("PipelineContext")
export class InsightContext extends PipelineContext {
  static ID = "InsightContext";

  /**
   * The options for the InsightContext.
   * @componentOptions
   */
  static options: IInsightContextOptions = {
    /**
     * Specifies a list of fields to include in the context.
     *
     * It is possible to inject contextual field values using the [Liquid syntax](https://docs.coveo.com/en/478).
     */
    fieldsToInclude: ComponentOptions.buildListOption<string>(),
  };

  /**
   * Creates a new InsightContext component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the InsightContext component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  public constructor(
    public element: HTMLElement,
    public options: IInsightContextOptions,
    public bindings: IComponentBindings
  ) {
    super(element, InsightContext.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      InsightContext,
      options
    );

    if (this.options.fieldsToInclude) {
      this.bind.onRootElement(
        QueryEvents.buildingQuery,
        (args: IBuildingQueryEventArgs) => {
          this.options.fieldsToInclude.forEach((field: string) => {
            const value: IAttributeWithValue = Insight.context.getAttributeValue(
              field
            );
            if (value.value && value.name == "formid") {
              args.queryBuilder.addContextValue(value.name, value.value);
              args.queryBuilder.addContextValue(value.name+"_formated", value.value.replace(/-/g,''));
            } else if (value.value) {
              args.queryBuilder.addContextValue(value.name, value.value);
            }
          });
        }
      );
    } else {
      this.logger.warn(
        `No context attributes to include. Either remove the ${InsightContext.ID} component or include some fields.`
      );
    }
  }

  public getContextValue(key: string): string | string[] {
    const contextValue = super.getContextValue(key);
    if (isArray(contextValue)) {
      const contextValues = [];
      each(contextValue, (value) => {
        contextValues.push(this.getDynamicsModifiedData(value));
      });
      return contextValues;
    } else if (isString(contextValue)) {
      return this.getDynamicsModifiedData(contextValue);
    }
    return "";
  }

  private getDynamicsModifiedData(field: string) {
    try {
      const value: IAttributeWithValue = Insight.context.getAttributeValue(
        field
      );
      return value.value;
    } catch (error) {
      const exc: Error = error;
      this.logger.warn(
        `An error occurred while parsing the parameter "${field}". Injecting raw value instead: ${exc.message}`
      );
      return field;
    }
  }
}
