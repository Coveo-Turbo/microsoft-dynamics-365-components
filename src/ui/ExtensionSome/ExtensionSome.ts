import {
    ComponentOptions,
    IBuildingQueryEventArgs,
    IComponentBindings,
    Initialization,
    QueryEvents
} from "coveo-search-ui";
import { Insight } from "../../utils/Insight";
import { ContextualComponent, IContextualComponentOptions } from "../ContextualComponent/ContextualComponent";
import { ExtensionBuilder } from "./ExtensionBuilder";

export interface IExtensionSomeOptions extends IContextualComponentOptions {
    keywords: string[];
    best?: number;
    match?: number | string;
    maximum?: number;
    isContextual?: boolean;
}

/**
 * The ExtensionSome component adds a [$some query extension](https://developers.coveo.com/x/ZQMv#StandardQueryExtensions-$some) to inject at query time.
 *
 * A $some query matches a subset of a list of provided keywords depending on the provided arguments.
 */
export class ExtensionSome extends ContextualComponent {
    static ID = "ExtensionSome";

    /**
     * The options for the ExtensionSome.
     * @componentOptions
     */
    static options: IExtensionSomeOptions = {
        /**
         * Specifies a list of fields or texts from which to extract keywords.
         *
         * It is possible to inject contextual field values using the [Liquid syntax](https://docs.coveo.com/en/478).
         */
        keywords: ComponentOptions.buildListOption<string>(),
        /**
         * Either an absolute or a percentage value specifying that only the X best keywords among those provided are to be matched
         * Keywords that are less prevalent in the index are considered better than those that are very common.
         *
         * Default value is `5`.
         */
        best: ComponentOptions.buildNumberOption({ defaultValue: 5 }),
        /**
         * Either an absolute or a percentage value specifying that items containing only X or more keywords of those provided are to be matched.
         *
         * Default value is `5`.
         */
        match: ComponentOptions.buildNumberOption({ defaultValue: 5 }),
        /**
         * The maximum number of keywords to use. If a larger number of keywords is provided, the extra keywords are ignored.
         *
         * Default value is `100`.
         */
        maximum: ComponentOptions.buildNumberOption(),
        /**
         * Whether the expression contains context dependant values.
         *
         * Default value is `true`.
         */
        isContextual: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        /**
         * Whether the expression should be disabled when context is disabled.
         *
         * Default value is `true`.
         */
        disableOnNonContextualSearch: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        /**
         * Specifies whether the component should be disabled if the user has typed something in the searchbox..
         *
         * Default value is `true`.
         */
        disableOnUserQuery: ComponentOptions.buildBooleanOption({ defaultValue: true })
    };

    /**
     * Creates a new ExtensionSome component.
     * @param element The HTMLElement on which to instantiate the component.
     * @param options The options for the ExtensionSome component.
     * @param bindings The bindings that the component requires to function normally. If not set, these will be
     * automatically resolved (with a slower execution time).
     */
    constructor(public element: HTMLElement, public options: IExtensionSomeOptions, bindings: IComponentBindings) {
        super(element, options, bindings, ExtensionSome.ID);
        this.options = ComponentOptions.initComponentOptions(element, ExtensionSome, options);

        this.initializeEvents();

        if (!this.options.keywords || this.options.keywords.length === 0) {
            this.logger.error(`${ExtensionSome.ID} does not define keywords.`);
        } else {
            this.bind.onRootElement(QueryEvents.buildingQuery, (args: IBuildingQueryEventArgs) => this.handleBuildingQuery(args));
        }
    }

    public getBuilder(): ExtensionBuilder<IExtensionSomeOptions> {
        let keywords: string[];
        if (this.options.isContextual) {
            keywords = this.options.keywords
                .map(keyword => Insight.context.getAttributeValue(keyword))
                .filter(attribute => attribute.value)
                .map(attribute => attribute.value);
        } else {
            keywords = this.options.keywords.filter(attribute => !!attribute);
        }

        return keywords.length > 0
            ? new ExtensionBuilder<IExtensionSomeOptions>("some")
                .withParam("keywords", keywords.join(" "))
                .withParamConditional(!_.isUndefined(this.options.best), "best", this.options.best)
                .withParamConditional(!_.isUndefined(this.options.match), "match", this.options.match)
                .withParamConditional(!_.isUndefined(this.options.maximum), "maximum", this.options.maximum)
            : null;
    }

    public handleBuildingQuery(args: IBuildingQueryEventArgs): void {
        const queryBuilder = args.queryBuilder;
        if (this.enabled(queryBuilder)) {
            const builder = this.getBuilder();
            const query = builder
                ? builder.build()
                : null;
            if (query) {
                queryBuilder.advancedExpression.add(query);
            }
        }
    }
}
Initialization.registerAutoCreateComponent(ExtensionSome);
