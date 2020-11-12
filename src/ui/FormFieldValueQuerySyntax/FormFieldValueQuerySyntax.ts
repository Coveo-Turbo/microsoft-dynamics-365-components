import { Component, IComponentBindings } from "coveo-search-ui";
import {
  ContextObjects,
  Filters,
  Form,
  FormContextHandler,
} from "../../Initialization";
import { remove } from "../../liquid/filters/Remove";
import { CrmContext } from "../../utils/CrmContext";
import { Insight } from "../../utils/Insight";
import { defaultContextObject } from "../../utils/Liquid/ContextObject";
import { CrmLiquidInterpreter } from "../../utils/Liquid/CrmLiquidInterpreter";
import { LiquidParser } from "../../utils/Liquid/LiquidParser";
import { QueryTranslator } from "../../utils/QueryTranslator";
import { CrmFormContextObject } from "./CrmFormContextObject";
import { EntityContextObject } from "./EntityContextObject";
import { lazyComponent } from "@coveops/turbo-core";

// Workaround to https://coveord.atlassian.net/browse/IE-245.
export interface IFormFieldValueQuerySyntaxOptions {
  title?: string;
}

/**
 * The _FormFieldValueQuerySyntax_ component enables usage of the [Liquid query syntax](https://docs.coveo.com/en/478).
 */
@lazyComponent
export class FormFieldValueQuerySyntax extends Component {
  static ID = "FormFieldValueQuerySyntax";

  public static options: IFormFieldValueQuerySyntaxOptions = {
    title: Coveo.ComponentOptions.buildStringOption(),
  };

  /**
   * Creates a new FormFieldValueQuerySyntax component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the FormFieldValueQuerySyntax component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  constructor(
    public element: HTMLElement,
    public options: any,
    public bindings?: IComponentBindings
  ) {
    super(element, FormFieldValueQuerySyntax.ID, bindings);

    const translator = new QueryTranslator(
      new LiquidParser(),
      new CrmLiquidInterpreter(ContextObjects, Filters)
    );
    if (FormContextHandler.isContextDefined) {
      ContextObjects.register(
        defaultContextObject,
        new CrmFormContextObject(Form)
      );
      ContextObjects.register("record", new EntityContextObject(Form));
    }
    Insight.context = new CrmContext(translator);
    Filters.registerFilter("remove", remove);
  }
}
