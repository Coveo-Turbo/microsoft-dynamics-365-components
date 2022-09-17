import { Crm } from "./Initialization";
import * as Cookies from "js-cookie";
import { Utils } from "./utils/Utils";

const SEARCH_CONFIG_COOKIE_NAME = "CoveoSessionInformation";
const DEFAULT_CONFIG_EXPIRATION_DELAY = 1 * 60 * 60 * 1000;
var ACTION_NAME = "cvo_crm_GetSearchToken";

export class DynamicsServiceTokenHandler {

    public async getSearchToken(searchHub: String): Promise<string> {
      var serverURL = window.parent.Xrm.Page.context.getClientUrl();
      var data = {'cvo_crm_SearchHub' : searchHub};
      const response = await fetch(serverURL + "/api/data/v9.2/" + ACTION_NAME, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json; charset=utf-8",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0"
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });
      return response.json();
    }

}