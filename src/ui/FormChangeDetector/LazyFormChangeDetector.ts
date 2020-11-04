import {
    IComponentDefinition,
    LazyInitialization
} from "coveo-search-ui";

export const lazyFormChangeDetector = (): void => {
    LazyInitialization.registerLazyComponent("FormChangeDetector", () => {
        return new Promise((resolve, reject) => {
            require.ensure(["./FormChangeDetector"], () => {
                const loaded = require<IComponentDefinition>("./FormChangeDetector.ts")["FormChangeDetector"];
                resolve(loaded);
            }, LazyInitialization.buildErrorCallback("FormChangeDetector", resolve), "FormChangeDetector");
        });
    });
};
