import { Assert } from "../../utils/Assert";
import { IContextObject } from "./ContextObject";

export interface IContextObjects {
    register(name: string, object: IContextObject): void;
    get(name: string): IContextObject;
}

export class ContextObjects implements IContextObjects {
    private objects: { [name: string]: IContextObject } = {};

    register(name: string, object: IContextObject) {
        Assert.isNotNullOrEmpty(name);
        Assert.isDefined(object);

        this.objects[name.toLowerCase()] = object;
    }

    get(name: string): IContextObject {
        return this.objects[name.toLowerCase()];
    }
}
