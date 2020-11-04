import { CrmClient, GlobalContext, IGlobalContext, Navigation, NavigationV8, NullGlobalContext, NullNavigation, WebApiService } from "coveo-xrm";

export const instanciateCrm = () => {
    const xrm = window['Xrm'];
    const xrmContext = xrm && xrm.Utility.getGlobalContext
        ? xrm.Utility.getGlobalContext()
        : xrm
            ? xrm.Page.context
            : window['GetGlobalContext']
                ? window['GetGlobalContext']()
                : null;
    const context: IGlobalContext = xrmContext
        ? new GlobalContext(xrmContext)
        : new NullGlobalContext();
    const webApi = new WebApiService(context);
    const navigation = parent['Xrm']
        ? parent['Xrm'].Navigation
            ? new Navigation(parent['Xrm'])
            : new NavigationV8(parent['Xrm'])
        : new NullNavigation();
    return new CrmClient(context, webApi, navigation);
};
