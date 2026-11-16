declare module 'app-config' {

  export interface EnvironmentConfig {
    port?: number;
    httpPort?: string;
    s3Bucket?: {
      bucketName: string,
      accessKeyId?: string,
      secretAccessKey?: string,
      region?: string
    };
    s3BucketTopic?: {
      bucketName: string,
      accessKeyId?: string,
      secretAccessKey?: string,
      region?: string
    };
    ai?: {},
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
    integrations?:{
      blacklist?: string[], // list of hosts disallowed from being called
      whitelist?: string[], // list of hosts allowed to be called
    }, 
    logDirectory?: string,
    logMethod?: 'Socket' | 'ECK',
    logTransports?: ('Console' | 'File')[],
    maxUploadFileSizeInMb?: string,   // Maximum file size allowed for file uploading.
                                      // value should be a integer number. value 0 is for unlimited
                                      // If value is invalid number, value 0 (unlimited) will be set
    microservices: {
      core: {
        host: string,
        port: string,
        protocol: string,
      },
      file?: {
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
    tenantPkId?: string,
    [key: string]: any; // allow app private settings at App level
  }

  export interface AppConfig {
      /**
       * Name of the app
       * This will be used for: cookie name, pm2 process name
       */
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
}
