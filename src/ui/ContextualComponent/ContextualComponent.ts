import {
  Component,
  IAttributeChangedEventArg,
  IComponentBindings,
  QueryBuilder,
} from "coveo-search-ui";
import { FormContextHandler } from "../../Initialization";
import { InsightEvents } from "../../models/QueryStateModel";
import { EventTypes } from "../../utils/IContext";
import { Insight } from "../../utils/Insight";
import { lazyComponent } from "@coveops/turbo-core";

export interface IContextualComponentOptions {
  disableOnNonContextualSearch: boolean;
  disableOnUserQuery: boolean;
}

@lazyComponent
export class ContextualComponent extends Component {
  public isDisabledFromContextualQuery = false;
  static ID = "ContextualComponent";

  /**
   * The options for the ContextualComponent.
   * @componentOptions
   */
  public static options: IContextualComponentOptions = {
    disableOnNonContextualSearch: Coveo.ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),
    disableOnUserQuery: Coveo.ComponentOptions.buildBooleanOption({
      defaultValue: false,
    }),
  };

  /**
   * Creates a new ContextualQueryFilter component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the ContextualQueryFilter component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  public constructor(
    public element: HTMLElement,
    public options: IContextualComponentOptions,
    public bindings: IComponentBindings,
    id: string = ContextualComponent.ID
  ) {
    super(element, id, bindings);
  }

  protected initializeEvents() {
    if (this.options.disableOnNonContextualSearch) {
      this.bind.onRootElement(
        Insight.context.buildEventName(
          EventTypes.Change,
          InsightEvents.disableContext
        ),
        (args: IAttributeChangedEventArg) => {
          this.isDisabledFromContextualQuery = args.value;
        }
      );
    }
  }

  public enabled(queryBuilder: QueryBuilder) {
    if (!FormContextHandler.isContextDefined) {
      return false;
    }
    if (this.isDisabledFromContextualQuery) {
      return false;
    }
    return this.options.disableOnUserQuery
      ? queryBuilder.expression.isEmpty()
      : true;
  }
}
