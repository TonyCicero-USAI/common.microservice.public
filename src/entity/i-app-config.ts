export interface EnvironmentConfig {
    isAuthorizationDisabled?: boolean;
    port?: number;
    httpPort?: string;
    s3Bucket?: {
        bucketName: string,
        accessKeyId?: string,
        secretAccessKey?: string,
        region?: string
    };
    databases?: {
        name: string,
        type: any,
        host: string,
        hostReplicaSet?: string,
        port: number,
        database: string,
        entities: any[],
        logging?: boolean,
        useNewUrlParser?: boolean,
        useUnifiedTopology?: boolean,
        replicaSet?: any,
        authSource?: string,
        username?: string,
        password?: string,

        ssl?: boolean,
        sslValidate?: boolean,

        sslCA?: any,
        sslCert?: any,
        sslKey?: any,

        autoEncryption?: any,

        isOptional?: boolean

    }[];
    integrations?: {
        blacklist?: string[], // list of hosts disallowed from being called
        whitelist?: string[], // list of hosts allowed to be called
    },
    microservices: {
        authorization? :{
            host: string,
            port: string,
            protocol: string,  
        },
        [key: string]: any
    }
    keys: {
        cookieKey: string,
        [key: string]: string
    };
    [key: string]: any; // allow app private settings at App level
}
export interface IAppConfig {
    appName: string;
    appPkId: string;

    apiRoutes?: string[];
    defaultAppAdminRoutes?: string[];
    defaultOrgAdminRoutes?: string[];
    defaultUserRoutes?: string[];
    publicRoutes?: string[];


    [key: string]: any; // allow app to add additional settings
    env?: {
        dev: EnvironmentConfig,
        release: EnvironmentConfig,
        [key: string]: EnvironmentConfig, // extra env for unit test, smoke test
    };

    get(key?: string): any;
  }