import { Crm } from "./Initialization";

export interface IXMLData {
  attributes?: any;
}

export class DynamicsFetchXMLHandler {
  public retrieveFromServer(resource: string,fetchXml: string): Promise<IXMLData> {
    return Crm.WebApi.init()
      .resource(resource)
      .custom("fetchXml", encodeURI(fetchXml))
      .get()
      .build()
      .then(function (response) {
        var data: IXMLData = {};
        if (response.value != null && response.value.length > 0) {
          data.attributes = response.value;
        }
        return data;
      });
  }
}
