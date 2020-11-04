import * as _ from "underscore";

export enum Injectable {
    CrmClient = "CrmClient"
}

export class Injector {
    private static registery: {[key: string]: any} = {};

    static getRegistered(key: string) {
        const registered = Injector.registery[key];
        if (registered) {
            return registered;
        } else {
            throw new Error(`Error: ${key} was not registered.`);
        }
    }

    static register(key: string, value: any) {
        Injector.registery[key] = value;
    }
}

const injectMethod = (...keys: string[]) => {
    return (target: any, key: string, descriptor: any) => {

        const originalMethod = descriptor.value;
        descriptor.value = function(...args: any[]) {
            const add = _.map(keys, (currentKey: string) => Injector.getRegistered(currentKey));
            args = args.concat(add);

            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};

const injectProperty = (...keys: string[]) => {
    return (target: any, key: string) => {
        const getter = () => Injector.getRegistered(keys[0]);

        // Delete property.
        if (delete this[key]) {
            // Create new property with getter and setter
            Object.defineProperty(target, key, {
                get: getter,
                enumerable: true,
                configurable: true,
            });
        }
    };
};

export const inject = (...keys: string[]) => {
    return (...args: any[]) => {
        const params = [];
        for (let i = 0; i < args.length; i++) {
            if (args[i]) {
                params.push(args[i]);
            }
        }
        switch (params.length) {
            case 2:
                return injectProperty(keys[0]).apply(this, args);
            case 3:
                return injectMethod(...keys).apply(this, args);
            default:
                throw new Error("Decorators are not valid here!");
        }
    };
};
