import { ContextObjects } from "../../Initialization";
import { FormContextHandlerImpl } from "./FormContextHandlerImpl";

// Note: This class exists solely to maintain backward compatibility with 'FormContextHandlerImpl'.
export class FormContextHandler extends FormContextHandlerImpl {
    constructor() {
        super(ContextObjects);
    }
}
