import {
  $$,
  analyticsActionCauseList,
  ComponentOptions,
  Initialization,
  IInitializationParameters,
  IQueryResult,
  IResultsComponentBindings,
  Template,
} from "coveo-search-ui";
// import { CrmClient } from "coveo-xrm";
// import { inject, Injectable } from "../../core/Injector";
import { Form, FormContextHandler, Crm } from "../../Initialization";
import { SVGDom } from "../../utils/SVGDom";
import { SVGIcons } from "../../utils/SVGUtils";
import { ResultActionBase } from "../ResultAction/ResultActionBase";
import { AssociateNote } from "./AssociateNoteService";
import { DefaultResultActionsTakeNoteTemplate } from "./DefaultResultActionsTakeNoteTemplate";
import { lazyDependentComponent } from "@coveops/turbo-core";

export interface IResultActionsTakeNoteOptions {
  title?: string;
  caption?: string;
  contentTemplate?: Template;
  removeHtmlTags?: boolean;
}

/**
 * The _ResultActionsTakeNote_ component allows adding a note about a given search result on the context record.
 */
@lazyDependentComponent("ResultActionBase")
export class ResultActionsTakeNote extends ResultActionBase {
  static ID = "ResultActionsTakeNote";
  // @inject(Injectable.CrmClient)
  // private crmClient: CrmClient;

  /*
   * The options for the ResultActionsTakeNote component.
   * @componentOptions
   */
  static options: IResultActionsTakeNoteOptions = {
    /**
     * Specifies the title displayed over the component when a note can be attached to the entity.
     *
     * Default value is `Mark as relevant`.
     */
    title: Coveo.ComponentOptions.buildStringOption({
      defaultValue: `Mark as relevant`,
    }),
    /**
     * Specifies the caption displayed beside the component when a note can be attached to the entity.
     *
     * Default value is `Mark as relevant`.
     */
    caption: Coveo.ComponentOptions.buildStringOption({
      defaultValue: `Mark as relevant`,
    }),
    /**
     * Specifies a custom template to use when creating a new note.
     *
     * * **Note:**
     * > You can use [`CoreHelpers`]{@link ICoreHelpers} methods in your content template.
     *
     * You can specify a previously registered template to use by referring either to its HTML `id` attribute or to a
     * CSS selector (see [`TemplateCache`]{@link TemplateCache}).
     *
     * **Example:**
     *
     * * Specifying a previously registered template by referring to its HTML `id` attribute:
     *
     * ```html
     * <div class="CoveoResultActionsTakeNote" data-template-id="myContentTemplateId"></div>
     * ```
     *
     * * Specifying a previously registered template by referring to a CSS selector:
     *
     * ```html
     * <div class='CoveoResultActionsTakeNote' data-template-selector=".myContentTemplateSelector"></div>
     * ```
     *
     * If you do not specify the custom content template, the component uses its default template.
     */
    contentTemplate: Coveo.ComponentOptions.buildTemplateOption({
      selectorAttr: "data-template-selector",
      idAttr: "data-template-id",
    }),
    /**
     * Specifies if the HTML tags should be removed from the contentTemplate.
     *
     * Default value is `true`.
     */
    removeHtmlTags: Coveo.ComponentOptions.buildBooleanOption({
      defaultValue: true,
    }),
  };
  noteContent: Coveo.Dom;
  /**
   * Creates a new ResultActionsTakeNote component.
   * @param element The HTMLElement on which to instantiate the component.
   * @param options The options for the ResultActionsTakeNote component.
   * @param bindings The bindings that the component requires to function normally. If not set, these will be
   * automatically resolved (with a slower execution time).
   * @param result The result to associate the component with.
   */
  constructor(
    public element: HTMLElement,
    public options: IResultActionsTakeNoteOptions,
    bindings?: IResultsComponentBindings,
    public result?: IQueryResult
  ) {
    super(element, ResultActionsTakeNote.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      ResultActionsTakeNote,
      options
    );
    if (!this.options.contentTemplate) {
      this.options.contentTemplate = new DefaultResultActionsTakeNoteTemplate();
    }

    this.render();
    if (!this.display()) {
      this.hide();
    }
  }

  prepareResultActionsTakeNoteComponent(): Promise<Coveo.Dom> {
    const elementPromise: Promise<HTMLElement> = this.options.contentTemplate.instantiateToElement(
      this.result
    ) as Promise<HTMLElement>;
    return elementPromise
      ? elementPromise.then((element: HTMLElement) => {
          this.noteContent = $$(element);
          const initOptions = this.searchInterface.options;
          const initParameters: IInitializationParameters = {
            options: initOptions,
            bindings: this.getBindings(),
            result: this.result,
          };
          return Initialization.automaticallyCreateComponentsInside(
            this.noteContent.el,
            initParameters
          ).initResult.then(() => $$(element));
        })
      : Promise.resolve<Coveo.Dom>(undefined);
  }

  protected render() {
    super.render();
    const icon = $$("div", { className: "coveo-icon" }, SVGIcons.icons.note);
    SVGDom.addClassToSVGInContainer(icon.el, "coveo-icon-for-take-note-svg");

    const caption = $$("div", { className: "coveo-caption" });
    caption.text(this.options.caption.toLocaleString());

    const menuDiv = $$("div", { className: "take-note" });
    menuDiv.append(icon.el);
    menuDiv.append(caption.el);

    $$(this.element).append(menuDiv.el);
    $$(this.element).on("click", () => this.handleClick());
  }

  public getTitle(): HTMLElement {
    const menuDiv = $$("div", { className: "coveo-box-take-note-in-menu" });
    $$(this.element)
      .children()
      .forEach((child) => menuDiv.append(child));
    return menuDiv.el;
  }

  display(): boolean {
    const formType = Form.ui.getFormType();
    return (
      formType !== XrmEnum.FormType.Undefined &&
      formType !== XrmEnum.FormType.Create &&
      FormContextHandler.isContextDefined
    );
  }

  handleClick() {
    return FormContextHandler.getCurrentEntitySetName(Crm.WebApi)
      .then((setName) => {
        return this.prepareResultActionsTakeNoteComponent().then(() => {
          const note = this.options.removeHtmlTags
            ? this.noteContent.el.innerText
            : this.noteContent.el.innerHTML;
          return AssociateNote.createNoteAndAssociate(
            FormContextHandler.recordId,
            FormContextHandler.entityName,
            setName,
            note.trim()
          );
        });
      })
      .then(() => {
        this.logResultActionsTakeNote();
        this.refreshNotesControl();
      })
      .catch((error) => this.logger.error(`Unable to create note: ${error}.`));
  }

  private logResultActionsTakeNote() {
    const metaData = {
      documentTitle: this.result.title,
      documentUrl: this.result.clickUri,
      author: this.result.raw["dyowneridstring"],
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

  private refreshNotesControl() {
    const timeline = Form.getControl<Xrm.Controls.GridControl>("Timeline");
    if (timeline) {
      timeline.refresh();
    }
  }
}
