import {
  $$,
  Component,
  IQueryResult,
  IResultsComponentBindings,
} from "coveo-search-ui";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { IncludedInResultAction } from "./ResultAction";
import { lazyComponent } from "@coveops/turbo-core";

@lazyComponent
export abstract class ResultActionBase
  extends Component
  implements IncludedInResultAction {
  static ID = "ResultActionBase";

  constructor(
    public element: HTMLElement,
    type: string,
    bindings?: IResultsComponentBindings,
    public result?: IQueryResult
  ) {
    super(element, type, bindings);
  }

  protected render() {
    this.addTooltip();
  }

  getTitle(): HTMLElement {
    const menuDiv = $$("div", { className: "coveo-box-element-in-menu" });
    $$(this.element)
      .children()
      .forEach((child) => menuDiv.append(child));
    return menuDiv.el;
  }

  display(): boolean {
    return true;
  }

  hide() {
    $$(this.element).addClass(["coveo-hidden"]);
  }

  show() {
    $$(this.element).removeClass("coveo-hidden");
  }

  private addTooltip() {
    tippy(this.element, {
      content: this.options.title.toLocaleString(),
    });
  }
}
