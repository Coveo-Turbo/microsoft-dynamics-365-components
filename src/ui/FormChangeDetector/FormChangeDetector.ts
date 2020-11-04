import { Component, IComponentBindings } from "coveo-search-ui";
import { FormContextHandler } from "../../Initialization";
import {
  AttributeType,
  ControlType,
} from "../../utils/CrmFormControlConstants";
import { lazyComponent } from "@coveops/turbo-core";

export interface IFormChangeDetectorOptions {
  enableSearchAsYouType?: boolean;
}

/**
 * The _CoveoFormChangeDetector_ component triggers a new Coveo search query when a CRM attribute changes.
 */
@lazyComponent
export class FormChangeDetector extends Component {
  static ID = "FormChangeDetector";

  /**
   * The options for the FormChangeDetector.
   * @componentOptions
   */
  public static options: IFormChangeDetectorOptions = {
    /**
     * Specifies whether to enable the Search as You Type feature. If `true`, the Coveo search interface updates its search results as user types.
     * If `false`, a new query is triggered only when a form element loses focus.
     *
     * Default value is `false`.
     * @deprecated The method `addOnKeyPress` on the Dynamics Client API has been deprecated: https://docs.microsoft.com/en-us/dynamics365/get-started/whats-new/customer-engagement/important-changes-coming#some-client-apis-are-deprecated
     */
    enableSearchAsYouType: Coveo.ComponentOptions.buildBooleanOption({
      defaultValue: false,
      section: "SearchAsYouType",
    }),
  };

  /**
   * Creates a new FormChangeDetector component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the FormChangeDetector component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   */
  constructor(
    public element: HTMLElement,
    public options: IFormChangeDetectorOptions,
    public bindings?: IComponentBindings
  ) {
    super(element, FormChangeDetector.ID, bindings);

    if (FormContextHandler.isContextDefined) {
      this.initializeEvents();
    }
  }

  private initializeEvents(): void {
    FormContextHandler.controls.forEach((control) =>
      this.setListenerOnControl(control)
    );
  }

  private setListenerOnControl(control: Xrm.Page.Control): void {
    if (this.isTextInputControl(control)) {
      if (this.options.enableSearchAsYouType) {
        (control as Xrm.Page.AutoLookupControl).addOnKeyPress(() =>
          this.updateSearch()
        );
      } else {
        (control as Xrm.Page.LookupControl)
          .getAttribute()
          .addOnChange(() => this.updateSearch());
      }
    } else if (this.isLookupControl(control)) {
      (control as Xrm.Page.LookupControl)
        .getAttribute()
        .addOnChange(() => this.updateSearch());
    }
  }

  private updateSearch(): void {
    this.queryController.executeQuery();
  }

  private isTextInputControl(control: Xrm.Page.Control): boolean {
    return (
      control.getControlType() === ControlType.Standard &&
      !!(control as Xrm.Page.StandardControl).getAttribute &&
      !!(control as Xrm.Page.StandardControl).getAttribute() &&
      (control as Xrm.Page.StandardControl)
        .getAttribute()
        .getAttributeType() === AttributeType.String
    );
  }

  private isLookupControl(control: Xrm.Page.Control): boolean {
    return (
      (control.getControlType() === ControlType.Standard ||
        control.getControlType() === ControlType.Lookup) &&
      !!(control as Xrm.Page.LookupControl).getAttribute &&
      !!(control as Xrm.Page.LookupControl).getAttribute()
    );
  }
}
