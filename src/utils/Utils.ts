// Copyright (c) 2005-2017, Coveo Solutions Inc.

import * as _ from "underscore";

export class Utils {
    static isString(object: any) {
        return _.isString(object);
    }

    static isNonEmptyString(str: string): boolean {
        return _.isString(str) && str !== "";
    }

    static stringStartsWith(str: string, startsWith: string): boolean {
        return str.slice(0, startsWith.length) === startsWith;
    }

    static stringEndsWith(str: string, endsWith: string): boolean {
        return str.indexOf(endsWith, this.length - endsWith.length) >= 0;
    }

    static trim(str: string, character: string): string {
        const escapedCharacters = this.escapeForRegex(character);
        return str ? str.replace(new RegExp(
            `^[${escapedCharacters}]+|[${escapedCharacters}]+$`, "g"
        ), "") : str;
    }

    static escapeForRegex(str: string): string {
        return str.replace(/[\[\](){}?*+\^$\\.|\-]/g, "\\$&");
    }
}
