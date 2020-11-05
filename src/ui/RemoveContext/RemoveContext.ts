import {
  analyticsActionCauseList,
  Component,
  Dom,
  IAnalyticsCaseContextAddMeta,
  IAnalyticsCaseContextRemoveMeta,
  IComponentBindings,
  l,
} from "coveo-search-ui";
import { FormContextHandler } from "../../Initialization";
import { InsightEvents } from "../../models/QueryStateModel";
import { lazyComponent } from "@coveops/turbo-core";

export interface IRemoveContextOptions {
  active?: boolean;
  label?: string;
}

/**
 * The RemoveContext component allows disabling the Dynamics contextual search.
 */
@lazyComponent
export class RemoveContext extends Component {
  static ID = "RemoveContext";

  /**
   * Possible options for the `RemoveContext` component
   * @componentOptions
   */
  static options: IRemoveContextOptions = {
    /**
     * Specifies whether the switch is active by default. i.e., whether the context is disabled by default.
     *
     * Default value is `false`
     */
    active: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false }),
    /**
     * Specifies the label of the switch.
     *
     * Default value is `Remove context`
     */
    label: Coveo.ComponentOptions.buildStringOption({
      defaultValue: l("RemoveContext"),
    }),
  };

  private contextSwitch: Dom;
  private contextSwitchBtn: Dom;

  /**
   * Creates a new RemoveContext component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the RemoveContext component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  constructor(
    public element: HTMLElement,
    public options: IRemoveContextOptions,
    public bindings?: IComponentBindings
  ) {
    super(element, RemoveContext.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(
      element,
      RemoveContext,
      options
    );

    this.queryStateModel.registerNewAttribute(
      InsightEvents.disableContext,
      false
    );
    this.bindings.queryStateModel.set(
      InsightEvents.disableContext,
      !!this.options.active
    );
    this.render();
    this.bind.onQueryState(
      "change:",
      InsightEvents.disableContext,
      (args: Coveo.IAttributeChangedEventArg) => this.toggleSwitch(args.value)
    );
  }

  private render(): void {
    this.contextSwitch = Coveo.$$("label", {
      className: "coveo-slide-toggle-label",
    });
    const label = Coveo.$$("span", { className: "toggle-label" });
    label.text(this.options.label);

    this.contextSwitch.el.appendChild(label.el);
    const input = Coveo.$$("input", {
      className: "coveo-slide-toggle",
      type: "checkbox",
    }).el;
    if (this.isContextDisabled()) {
      (input as HTMLInputElement).checked = true;
    }
    this.contextSwitch.el.appendChild(input);
    this.contextSwitchBtn = Coveo.$$("button");
    this.contextSwitch.el.appendChild(this.contextSwitchBtn.el);
    this.element.appendChild(this.contextSwitch.el);

    this.setListenerOnSwitch();
  }

  private isContextDisabled(): boolean {
    return this.queryStateModel.get(InsightEvents.disableContext);
  }

  private setListenerOnSwitch(): void {
    this.element.addEventListener("change", () => {
      const nextCheckedState = !this.isContextDisabled();

      this.bindings.queryStateModel.set(
        InsightEvents.disableContext,
        nextCheckedState
      );
      this.sendContextChangedEventToAnalytics(nextCheckedState);
      this.queryController.executeQuery();
    });
    this.contextSwitchBtn.on("click", () => {
      this.contextSwitch.trigger("change");
    });
  }

  private toggleSwitch(activate: boolean): void {
    (this.contextSwitch.find("input") as HTMLInputElement).checked = activate;
  }

  private sendContextChangedEventToAnalytics(checked: boolean): void {
    if (FormContextHandler.isContextDefined) {
      if (checked) {
        this.usageAnalytics.logSearchEvent<IAnalyticsCaseContextRemoveMeta>(
          analyticsActionCauseList.casecontextRemove,
          { caseID: FormContextHandler.recordId.toString() }
        );
      } else {
        this.usageAnalytics.logSearchEvent<IAnalyticsCaseContextAddMeta>(
          analyticsActionCauseList.casecontextAdd,
          { caseID: FormContextHandler.recordId.toString() }
        );
      }
    } else {
      this.logger.warn("Context removed or added, but no context exists.");
    }
  }
}
