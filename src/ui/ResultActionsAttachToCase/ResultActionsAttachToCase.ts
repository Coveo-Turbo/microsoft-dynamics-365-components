import {
  $$,
  analyticsActionCauseList,
  Dom,
  IQueryResult,
  IResultsComponentBindings,
} from "coveo-search-ui";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import {
  IDoneFetchingKnowledgeArticlesEventArgs,
  KnowledgeArticleEvents,
} from "../../events/KnowledgeArticleEvents";
import { Form, FormContextHandler } from "../../Initialization";
import { ResultOriginUtils } from "../../utils/SearchResults/ResultOriginUtils";
import { SVGDom } from "../../utils/SVGDom";
import { SVGIcons } from "../../utils/SVGUtils";
import { UUID } from "../../utils/UUID";
import { ResultActionBase } from "../ResultAction/ResultActionBase";
import { LinkedArticles } from "./LinkedArticles";
import { LinkedArticlesSingleton } from "./LinkedArticlesSingleton";
import { lazyDependentComponent } from "@coveops/turbo-core";

const activeClass = "active";
export const AssociatedKnowledgeArticlesControlId =
  "Associated_KnowledgeArticles";

export interface IResultActionsAttachToCaseOptions {
  linkTitle?: string;
  linkCaption?: string;
  unlinkTitle?: string;
  unlinkCaption?: string;
}

/**
 * The _ResultActionsAttachToCase_ component allows linking a CRM knowledge article to a case.
 */
@lazyDependentComponent("ResultActionBase")
export class ResultActionsAttachToCase extends ResultActionBase {
  static ID = "ResultActionsAttachToCase";

  private linkButton: Dom;
  private unlinkButton: Dom;
  private resultId: UUID;
  private linkedArticles: LinkedArticles;
  private canLink: boolean;
  private canUnlink: boolean;

  /**
   * Possible options for the `ResultActionsAttachToCase` component
   * @componentOptions
   */
  static options: IResultActionsAttachToCaseOptions = {
    /**
     * Specifies the title displayed over the component when the knowledge article can be linked to the case.
     *
     * Default value is `Link to case`
     */
    linkTitle: Coveo.ComponentOptions.buildStringOption({
      defaultValue: "Link to case",
    }),
    /**
     * Specifies the caption displayed beside the component when the knowledge article can be linked to the case.
     *
     * Default value is `Link to case`
     */
    linkCaption: Coveo.ComponentOptions.buildStringOption({
      defaultValue: "Link to case",
    }),
    /**
     * Specifies the title displayed over the component when the knowledge article can be unlinked from the case.
     *
     * Default value is `Unlink from case`
     */
    unlinkTitle: Coveo.ComponentOptions.buildStringOption({
      defaultValue: "Unlink from case",
    }),
    /**
     * Specifies the caption displayed beside the component when the knowledge article can be unlinked from the case.
     *
     * Default value is `Unlink from case`
     */
    unlinkCaption: Coveo.ComponentOptions.buildStringOption({
      defaultValue: "Unlink from case",
    }),
  };

  /**
   * Creates a new _ResultActionsAttachToCase_ component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the _ResultActionsAttachToCase_ component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   * @param result The result to associate the component with.
   */
  constructor(
    public element: HTMLElement,
    public options: IResultActionsAttachToCaseOptions,
    public bindings?: IResultsComponentBindings,
    public result?: IQueryResult
  ) {
    super(element, ResultActionsAttachToCase.ID, bindings);
    this.options = Coveo.ComponentOptions.initComponentOptions(
      element,
      ResultActionsAttachToCase,
      options
    );
    this.canLink = false;
    this.canUnlink = false;

    this.render();
    if (this.display()) {
      this.linkedArticles = LinkedArticlesSingleton.getInstance(this.root);
      this.resultId = new UUID(ResultOriginUtils.recordId(result.uri));
      this.setActiveState();
      this.bindEvents();
    } else {
      this.hide();
    }
  }

  getTitle(): HTMLElement {
    const menuDiv = $$("div", { className: "coveo-link-to-case-in-menu" });
    $$(this.element)
      .children()
      .forEach((child) => menuDiv.append(child));
    return menuDiv.el;
  }

  display(): boolean {
    const formType = Form.ui.getFormType();
    return (
      ResultOriginUtils.isKnowledgeArticleFromContextOrganization(
        this.result.uri
      ) &&
      FormContextHandler.entityName === "incident" &&
      formType !== XrmEnum.FormType.Undefined &&
      formType !== XrmEnum.FormType.Create
    );
  }

  /**
   * Links a search result to the context case.
   */
  public link(): Promise<void> {
    return this.linkedArticles.link(this.resultId).then(() => {
      this.logLinkedToCase();
      this.refreshCrmFormControls();
    });
  }

  /**
   * Unlinks a search result from the context case.
   */
  public unlink(): Promise<void> {
    return this.linkedArticles.unlink(this.resultId).then(() => {
      this.logUnlinkedFromCase();
      this.refreshCrmFormControls();
    });
  }

  protected render(): void {
    this.renderLink();
    this.renderUnlink();
  }

  private renderLink() {
    const icon = $$("div", { className: "coveo-icon" }, SVGIcons.icons.attach);
    SVGDom.addClassToSVGInContainer(icon.el, "coveo-icon-for-link-svg");

    const caption = $$("div", { className: "coveo-caption" });
    caption.text(this.options.linkCaption.toLocaleString());

    const div = $$("div", {
      className: "link-button",
      title: this.options.linkTitle.toLocaleString(),
    });
    div.append(icon.el);
    div.append(caption.el);
    this.linkButton = div;

    $$(this.element).append(div.el);

    tippy(div.el, {
      content: this.options.linkTitle.toLocaleString(),
    });
  }

  private renderUnlink() {
    const icon = $$(
      "div",
      { className: "coveo-icon" },
      SVGIcons.icons.unattach
    );
    SVGDom.addClassToSVGInContainer(icon.el, "coveo-icon-for-unlink-svg");

    const caption = $$("div", { className: "coveo-caption" });
    caption.text(this.options.unlinkCaption.toLocaleString());

    const div = $$("div", {
      className: "unlink-button",
      title: this.options.unlinkTitle.toLocaleString(),
    });
    div.append(icon.el);
    this.unlinkButton = div;
    div.append(caption.el);

    $$(this.element).append(div.el);

    tippy(div.el, {
      content: this.options.unlinkTitle.toLocaleString(),
    });
  }

  private setActiveState() {
    const isLinked = this.linkedArticles.isLinked(this.resultId);
    if (isLinked) {
      this.displayUnlink();
      this.canLink = false;
      this.canUnlink = true;
    } else {
      this.displayLink();
      this.canLink = true;
      this.canUnlink = false;
    }
  }

  private bindEvents() {
    this.bind.onRootElement(
      KnowledgeArticleEvents.doneFetchingKnowledgeArticles,
      (args: IDoneFetchingKnowledgeArticlesEventArgs) => {
        this.setActiveState();
      }
    );
    $$(this.element).on("click", () => this.handleClick());
  }

  private handleClick() {
    if (this.canLink) {
      this.link();
    } else if (this.canUnlink) {
      this.unlink();
    }
  }

  private displayUnlink() {
    this.linkButton.removeClass(activeClass);
    this.unlinkButton.addClass(activeClass);
  }

  private displayLink() {
    this.linkButton.addClass(activeClass);
    this.unlinkButton.removeClass(activeClass);
  }

  private logLinkedToCase() {
    const metaData = {
      documentTitle: this.result.title,
      documentUrl: this.result.clickUri,
      author: this.result.raw.dycreatedbystring,
    };

    this.usageAnalytics.logClickEvent(
      analyticsActionCauseList.caseAttach,
      metaData,
      this.result,
      this.root
    );

    this.usageAnalytics.logCustomEvent(
      analyticsActionCauseList.caseAttach,
      metaData,
      this.root
    );
  }

  private logUnlinkedFromCase() {
    const metaData = {
      articleID: this.resultId.toString(),
      caseID: FormContextHandler.recordId.toString(),
      resultUriHash: this.result.raw.urihash,
      author: this.result.raw.dycreatedbystring,
    };

    this.usageAnalytics.logCustomEvent(
      analyticsActionCauseList.caseDetach,
      metaData,
      this.root
    );
  }

  private refreshCrmFormControls() {
    const kbControl: Xrm.Controls.GridControl = Form.getControl<
      Xrm.Controls.GridControl
    >(AssociatedKnowledgeArticlesControlId);
    if (kbControl) {
      kbControl.refresh();
    }
  }
}
