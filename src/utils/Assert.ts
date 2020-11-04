// Copyright (c) 2005-2017, Coveo Solutions Inc.

import { Utils } from "./Utils";

export const DEFAULT_ASSERTION_FAILURE_MESSAGE = "Assertion Failed!";

export class Assert {
    static fail(message?: string): void {
        throw new PreconditionFailure(message || DEFAULT_ASSERTION_FAILURE_MESSAGE);
    }

    static check(condition: boolean, message?: string): void {
        if (!condition) {
            Assert.fail(message);
        }
    }

    static isNotNullOrEmpty(object: string): void {
        Assert.check(Utils.isNonEmptyString(object), "Value should be a non-empty string.");
    }

    static isDefined(object: any): void {
        Assert.check(!!object, "Value should not be null or undefined");
    }
}

export class PreconditionFailure extends Error {
    constructor(public message: string) {
        super(message);
    }
}
