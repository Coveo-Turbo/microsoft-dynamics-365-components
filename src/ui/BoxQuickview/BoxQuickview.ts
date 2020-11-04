import {
    $$,
    Component,
    IQueryResult,
    IQuickviewOptions,
    IResultsComponentBindings,
    l,
    QueryUtils,
    Quickview
} from "coveo-search-ui";
import { SVGDom } from "../../utils/SVGDom";
import { SVGIcons } from "../../utils/SVGUtils";
import { IncludedInResultAction } from "../ResultAction/ResultAction";
import { lazyDependentComponent } from '@coveops/turbo-core';

/**
 * The _BoxQuickview_ component inherits the _Quickview_ component, and thus offers the same options(see [Coveo Component Quickview](https://coveo.github.io/search-ui/components/quickview.html)).
 */
@lazyDependentComponent('Quickview')
export class BoxQuickview extends Quickview implements IncludedInResultAction {
    static ID = "BoxQuickview";

    /**
     * Creates a new BoxQuickview component.
     * @param element The HTMLElement on which to instantiate the component.
     * @param options The options for the BoxQuickview component.
     * @param bindings The bindings that the component requires to function normally. If not set, these will be
     * automatically resolved (with a slower execution time).
     * @param result The result with which the component should be associated.
     */
    constructor(public element: HTMLElement, public options: IQuickviewOptions, bindings: IResultsComponentBindings, public result: IQueryResult) {
        super(element, options, bindings, result);
        $$(element).removeClass(Component.computeCssClassNameForType(Quickview.ID));
        if (!QueryUtils.hasHTMLVersion(result)) {
            this.logger.warn("Result has no HTML version... removing Quickview", result, this);
            $$(this.element).remove();
        }
    }

    public getTitle(): HTMLElement {
        const menuDiv = $$("div", { title: "Quickview", className: "coveo-box-quick-view-in-menu" });

        const icon = $$("div", { className: "coveo-icon" }, SVGIcons.icons.quickview);
        SVGDom.addClassToSVGInContainer(icon.el, "coveo-box-quick-view-icon");
        const caption = $$("div", { className: "coveo-caption" });
        caption.text(l("Quickview"));
        menuDiv.append(icon.el);
        menuDiv.append(caption.el);

        menuDiv.on("click", () => {
            this.open();
        });
        return menuDiv.el;
    }

    display(): boolean {
        return true;
    }
}
