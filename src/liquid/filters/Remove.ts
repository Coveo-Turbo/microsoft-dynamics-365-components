import { ILiquidFilterFunction } from "../../utils/Liquid/LiquidFilters";
import { escapeStringRegExp } from "../../utils/StringUtils";

export const remove: ILiquidFilterFunction = (inputString: string, ...toRemove: string[]): string => {
    if (inputString && toRemove && toRemove.length > 0) {
        return [inputString, ...toRemove].reduce((accumulator: string, currentValue) => {
            const escapedString = escapeStringRegExp(currentValue);
            return accumulator.replace(new RegExp(escapedString, "g"), "");
        });
    } else {
        return "";
    }
};
