import { Crm } from "./Initialization";

export interface IUserInfo {
  attributes?: any;
}

export class DynamicsUserInfoHandler {
  public retrieveFromServer(fetchXml: string): Promise<IUserInfo> {
    return Crm.WebApi.init()
      .resource("systemusers")
      .custom("fetchXml", encodeURI(fetchXml))
      .get()
      .build()
      .then(function (response) {
        var userInfo: IUserInfo = {};
        if (response.value != null && response.value.length > 0) {
          userInfo.attributes = response.value[0];
        }
        return userInfo;
      });
  }
}
