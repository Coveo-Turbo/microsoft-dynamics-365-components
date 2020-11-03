import {
    $$,
    Component,
    ComponentOptions,
    Dom,
    Initialization,
    IQueryResult,
    IResultsComponentBindings,
    ResultListEvents
} from "coveo-search-ui";
import * as _ from "underscore";

import { lazyComponent } from '@coveops/turbo-core';



export interface IResultActionOptions {
    menuDelay: number;
}

export interface IncludedInResultAction {
    getTitle(): HTMLElement;
    display(): boolean;
}

@lazyComponent
/**
 * The _ResultAction_ component displays a small actionable button for a given search result. When clicked, the button displays other subcomponents in a menu, such as the `BoxQuickview` Component.
 *
 * **Note:**
 * > For more information on how to implement your own custom actions inside this component, see [Creating Custom Actions for an Insight Panel or a Custom Box](https://docs.coveo.com/en/413).
 *
 * ```html
 * <div class='CoveoResultAction'>
 *   <!-- Include other components here, such as the BoxQuickView component -->
 * </div>
 * ```
 */
export class ResultAction extends Component {
    static ID = "ResultAction";

    /**
     * The available options for ResultAction
     * @componentOptions
     */
    static options: IResultActionOptions = {
        /**
         * Specifies the delay, in milliseconds, before the menu disappears when the user's mouse leaves the menu icon.
         *
         * Minimum value is `0`.
         *
         * Default value is `300`.
         */
        menuDelay: ComponentOptions.buildNumberOption({ defaultValue: 300, min: 0 })
    };

    private menu: Dom;
    private container: Dom;
    private closeTimeout: number;
    private isOpened: boolean = false;

    /**
     * Creates a new ResultAction component.
     * @param element The HTMLElement on which to instantiate the component.
     * @param options The options for the ResultAction component.
     * @param bindings The bindings that the component requires to function normally. If not set, these will be
     * automatically resolved (with a slower execution time).
     * @param result The result with which the component should be associated.
     */
    public constructor(public element: HTMLElement, public options: IResultActionOptions, public bindings?: IResultsComponentBindings, public result?: IQueryResult) {
        super(element, ResultAction.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, ResultAction, options);

        this.renderParents();
        this.renderChildren(result);
    }

    private renderParents(): void {
        const controlSquares = $$("div", { className: "coveo-result-action-squares" });
        for (let i = 1; i <= 3; i++) {
            const square = $$("div", { className: "coveo-result-action-square" });
            controlSquares.append(square.el);
        }
        this.menu = $$("div", { className: "coveo-box-result-action-menu" });
        this.container = $$("div", { className: "coveo-box-result-action-container" });
        const elementDom = $$(this.element);
        elementDom.append(controlSquares.el);
        elementDom.append(this.menu.el);
        elementDom.append(this.container.el);

        $$(this.element).on("click", () => {
            if (this.isOpened) {
              this.close();
            } else {
              this.open();
            }
        });

        $$(this.element).on("mouseleave", () => this.mouseleave());
        $$(this.element).on("mouseenter", () => this.mouseenter());
    }

    private renderChildren(result?: IQueryResult): void {
        const replaceElementsOnce = _.once(() => {
            const toMove: HTMLElement[] = [];
            _.each(this.element.children, (child: HTMLElement) => {
                if (this.doesImplementIncludedInterface(child) && Coveo.get(child)["display"]()) {
                    toMove.push(child);
                }
            });
            if (toMove.length > 0) {
                toMove.forEach((elem: HTMLElement) => {
                    const menuItem = $$("div", { className: "coveo-box-result-action-menu-item" });
                    this.menu.append(menuItem.el);
                    menuItem.append(Coveo.get(elem)["getTitle"]());
                    this.container.append(elem);
                });
            } else {
                this.logger.warn("ResultAction is empty or has no inner elements with which it can populate... removing the component", result, this);
                $$(this.element).remove();
            }
        });
        this.bind.onRootElement(ResultListEvents.newResultsDisplayed, () => replaceElementsOnce());
        $$(this.menu).on("mouseleave", () => this.mouseleave());
        $$(this.menu).on("mouseenter", () => this.mouseenter());
    }

    /**
     * Opens the **Settings** popup menu.
     */
    public open(): void {
        this.isOpened = true;
        this.menu.addClass("coveo-opened");
    }

    /**
     * Closes the **Settings** popup menu.
     */
    public close(): void {
        this.isOpened = false;
        if (this.menu) {
            this.menu.removeClass("coveo-opened");
        }
    }

    private doesImplementIncludedInterface(elem: HTMLElement): boolean {
        const elemAsComponent = Coveo.get(elem);
        return elemAsComponent && elemAsComponent["getTitle"];
    }

    private mouseleave(): void {
        window.clearTimeout(this.closeTimeout);
        this.closeTimeout = window.setTimeout(() => {
            this.close();
        }, this.options.menuDelay);
    }

    private mouseenter(): void {
        window.clearTimeout(this.closeTimeout);
    }
}
