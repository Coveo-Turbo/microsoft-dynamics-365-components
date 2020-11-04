import { Assert } from "../../utils/Assert";

export interface ILiquidFilterFunction {
    (...args: any[]): string;
}

export class LiquidFilters {
    private filters: { [templateName: string]: ILiquidFilterFunction } = {};

    registerFilter(name: string, filter: ILiquidFilterFunction) {
        Assert.isNotNullOrEmpty(name);
        Assert.isDefined(filter);

        this.filters[name.toLowerCase()] = filter;
    }

    getFilter(name: string): ILiquidFilterFunction {
        return this.filters[name.toLowerCase()];
    }
}
