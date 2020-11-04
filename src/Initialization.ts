import {
    buildFormContext,
    CrmClient,
    IFormContext,
} from "coveo-xrm";
import { instanciateCrm } from "./core/InitCrm";
import { FormContextHandlerImpl } from "./ui/Context/FormContextHandlerImpl";
import { ContextObjects as ContextObjectTemp } from "./utils/Liquid/ContextObjects";
import { LiquidFilters } from "./utils/Liquid/LiquidFilters";

export const ContextObjects = new ContextObjectTemp();
export const Filters = new LiquidFilters();
export const Crm: CrmClient = instanciateCrm();
export const Form: IFormContext = buildFormContext(parent['Xrm'], null);

const ContextHandler = new FormContextHandlerImpl(ContextObjects);
ContextHandler.setFormContext(Form);
export const FormContextHandler = ContextHandler;