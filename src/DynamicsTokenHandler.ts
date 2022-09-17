import { Crm } from "./Initialization";
import * as Cookies from "js-cookie";
import { Utils } from "./utils/Utils";

export interface ISearchConfig {
    content?: string;
    searchToken: string;
    platformUrl: string;
    usageAnalyticsUrl?: string;
    userId?: string;
}

const SEARCH_CONFIG_COOKIE_NAME = "CoveoSearchConfig";
const DEFAULT_CONFIG_EXPIRATION_DELAY = 8 * 60 * 60 * 1000;
const GET_SEARCH_TOKEN = 'coveo_GetSearchConfig';

/**
 * @deprecated Use this instead : https://connect.coveo.com/s/article/7134
 */
export class DynamicsTokenHandler {

    // constructor() {
    //     this.getConfig().then( (arg: any) => {console.log(arg)});
    // }

    // public init(getTokenSuccessCallback: (data: ISearchConfig) => void){
    //     this.getConfig().then((data: ISearchConfig) => this.returnParam(data, getTokenSuccessCallback));
    // }

    // public returnParam(data: ISearchConfig, getTokenSuccessCallback: (data: ISearchConfig) => void){
    //     getTokenSuccessCallback(data);
    //     console.log('success');
    // }

    /**
     * @deprecated Use this instead : https://connect.coveo.com/s/article/7134
     */
    public getConfig(): Promise<ISearchConfig> {
        const config = this.tryGetConfigFromCookies();
        if (this.shouldRetrieveNewConfig(config)) {
            return this.retrieveConfigFromServer();
        }
        return Promise.resolve(config);
    }

    public tryGetConfigFromCookies(): ISearchConfig {
        let searchConfig: ISearchConfig;
        const cookie = Cookies.get(SEARCH_CONFIG_COOKIE_NAME);
        if (cookie) {
            searchConfig = JSON.parse(cookie);
        }

        return searchConfig;
    }

    public shouldRetrieveNewConfig(config: ISearchConfig): boolean {
        return !(config && config.searchToken && config.platformUrl) ||
            Crm.GlobalContext.userSettings.userId !== config.userId;
    }

    public retrieveConfigFromServer(): Promise<ISearchConfig> {
        return Crm.WebApi.init()
            .resource(GET_SEARCH_TOKEN)
            .post({})
            .build<ISearchConfig>()
            .then(data => {
                return this.setSearchConfigCookie(data);
            });
    }

    public setSearchConfigCookie(config: ISearchConfig): ISearchConfig {
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + DEFAULT_CONFIG_EXPIRATION_DELAY);

        config.platformUrl = Utils.ensureEndsWithSlash(config.platformUrl);
        config.userId = Crm.GlobalContext.userSettings.userId;

        Cookies.set(SEARCH_CONFIG_COOKIE_NAME,
            JSON.stringify(config),
            {
                expires: expiration,
                domain: window.location.hostname
            }
        );

        return config;
    }

}