import { Initialization } from "coveo-search-ui";

export const fields = ["dycreatedbystring"];

export const registerFields = () => {
    Initialization.registerComponentFields("LinkToCase", fields);
};
