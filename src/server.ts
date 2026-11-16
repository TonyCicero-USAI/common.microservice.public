// EXPORTS

export const schema = [];
export const DATA_SOURCES = [];
export const dataSources = [];

// IMPORTS 

import bodyParser from 'body-parser';
import compress from 'compression';
import typeorm from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { AfterRoutesInit } from '@tsed/common';
import { BeforeInit } from '@tsed/common';
import { BeforeRoutesInit } from '@tsed/common';
import { Configuration } from '@tsed/common';
import { Inject } from '@tsed/common';
import { PlatformAcceptMimesMiddleware } from '@tsed/common';
import { PlatformApplication } from '@tsed/common';
import { registerProvider } from '@tsed/common';
import { Logger } from '@tsed/logger';
import { Unauthorized } from '@tsed/exceptions';

import '@tsed/platform-express';
import "@tsed/platform-multer";

import cookieParser from 'cookie-parser';
import cors from 'cors';
import methodOverride from 'method-override';
import { MongoDriver } from 'typeorm/driver/mongodb/MongoDriver.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { initConfig } from '@app/app.js';
import { EnvironmentConfig } from 'app-config';

import { Tools } from './util/tools.js';

import { ErrorMiddleware } from './middlewares/error.middleware.js';
import { RequestValidationMiddleware } from './middlewares/requestValidation.middleware.js';
import { SessionMiddleware } from './middlewares/session.middleware.js';

import { Util } from './util/util.js';

import "@tsed/platform-log-request";
import { onLogEnd } from './middlewares/log.middleware.js';

initConfig();

// VARIABLES

const appName = global.config.appName;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = __dirname;

// START DEV MONGODB SERVER

if (global.config?.get('devMongoServer')?.enabled) {
    const mongod = await MongoMemoryServer.create({instance: {port: global.config.get('devMongoServer').port}});
}


// INITIALIZE DATABASE

MongoDriver.prototype['buildConnectionOptions'] = function() {
    const mongoOptions = {};
    const extendedValidOptionNames = [...this.validOptionNames, 'autoEncryption'];
    for (let index = 0; index < extendedValidOptionNames.length; index++) {
        const optionName = extendedValidOptionNames[index];
        if (this.options.extra && optionName in this.options.extra) {
            mongoOptions[optionName] = this.options.extra[optionName];
        } 
        else if (optionName in this.options) {
            mongoOptions[optionName] = this.options[optionName];
        }
    }
    return mongoOptions;
};

const typeormConfig: typeorm.DataSourceOptions[] = global.config.get('databases'); // setup database connections
const sslFiles = ['sslCA', 'sslKey', 'sslCert']; // load any ssl certificates for the default db
for (const sslFile of sslFiles) {
    const keyFile = global.config.get('databases')[0][sslFile];
    if (keyFile) {
        typeormConfig.forEach(e => e[sslFile] = keyFile);
    }
}

for (let dbConfigIndex = 0; dbConfigIndex < typeormConfig.length; dbConfigIndex++) {
    dataSources.push(new typeorm.DataSource(typeormConfig[dbConfigIndex]));
    DATA_SOURCES[dbConfigIndex] = Symbol.for(typeormConfig[dbConfigIndex].name);
    
    registerProvider<typeorm.DataSource>({
        provide: DATA_SOURCES[dbConfigIndex],
        type: "typeorm:datasource",
        deps: [Logger],
        async useAsyncFactory(logger: Logger) {
            try {
                await dataSources[dbConfigIndex].initialize();        
                logger.info("Connected to the database: " + dataSources[dbConfigIndex]?.options.database);        
                return dataSources[dbConfigIndex];
            } catch (error) {
                logger.info("Error connecting to the database: " + dataSources[dbConfigIndex]?.options.database);
                logger.error(error);     
                if (!dataSources[dbConfigIndex]?.options.isOptional) {
                    process.exit(1);
                }
            }
        },
        hooks: {
            $onDestroy(dataSource) {
                return dataSource.isInitialized && dataSource.close();
            }
        }
    });
}

// CORS

const CORS_DEFAULT: { origin: any[]; credentials?: boolean } = { origin: [] };
const CORS_OPTIONS = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        // allow local host in dev env
        if (['dev', 'development'].includes(process.env.NODE_ENV) &&
            origin.startsWith('http://localhost')) {
            return callback(null, true);
        }

        // allow mobile apps to connect.
        if (global.config.get('mobileBypass') && (origin.startsWith('http://localhost') || origin.startsWith('ionic://localhost'))) {
            return callback(null, true);
        }

        // allow origins from *<Environment>.unitedsolutions.io that use https, and do not have nested subdomains.
        // This should only allow domains associated with the current environment.
        // nosemgrep: detect-non-literal-regexp G-168
        const regex = new RegExp(`https:\/\/(?!(www)|(chat)|(connect))(^|^[^:]+:\/\/|[^\.]+\.)${Util.escapeRegex(process.env.USAI_DOMAIN || '')}$`)
        // nosemgrep javascript-dos-rule-regex_dos
        if(regex.test(origin.toLowerCase())) {
            return callback(null, true);
        }
        else {
            callback(new Unauthorized('Origin blocked by CORS policy, origin: ', origin));
        }
    },
    credentials: CORS_DEFAULT.credentials || true
};

/*************
 * Get maximum upload file size from app.ts
 *************/
function getMaxUploadFileSize() {
    // we get the max file size from app.ts
    const maxString = global.config.get('maxUploadFileSizeInMb');
    if (!maxString) {
        // no setting maxUploadFileSizeInMb. We return 0, meaning unlimited
        return 0;
    } else {
        try {
            // convert to number and then to bytes
            return (+maxString) * 1024 *1024;
        } catch (error) {
            // skip
        }
        if (Number.isNaN(maxString)) {
            // The setting maxUploadFileSizeInMb is invalid number. We return 0, meaning unlimited
            return 0;
        }
    }
}

// START SERVER

@Configuration({
    acceptMimes: ['application/json'],
    appSettings: global.config.get(),
    httpPort: global.config.get('port'),
    port: global.config.get('port') || 4200,
    rootDir,
    debug: true,
    typeorm: typeormConfig,
    logger: {
        logRequest: true,

        /**
         * A function to alter the log object before it's logged.
         * @optional
         */
        onLogResponse: onLogEnd
     },
    // middlewares: [LogIncomingRequest],
    multer: getMaxUploadFileSize() ? {
        limits: {
            // 12/24/24 - HPHAN - Add configurable setting "Maximum Upload File Size" for Uploading
            fileSize: getMaxUploadFileSize() // in bytes
        }
    } : undefined
})
export class Server implements BeforeInit, BeforeRoutesInit, AfterRoutesInit {

    @Configuration() settings: Configuration;
    @Inject() app: PlatformApplication;

    /* ATTRIBUTE */

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(        
        @Configuration() private readonly configuration: Configuration,
        private logger: Logger) {

        this.logger.info("Starting the Server ...");
        
    }

    /* EVENT HANDLING */

    /**
     * Before Init.
     */
    public $beforeInit() {


    }

    /**
     * Register the middleware before the routes have been initialized.
     */
    public $beforeRoutesInit(): void | Promise<any> {
        const envConfig: EnvironmentConfig = global.config.get();
        this.app
            .use(cookieParser(envConfig.keys.cookieKey))
            .use(cors(CORS_OPTIONS))
            .use(PlatformAcceptMimesMiddleware)
            .use(compress({}))
            .use(methodOverride())
            .use(bodyParser.json({ limit: '2048mb' }))
            .use(bodyParser.urlencoded({ limit: '2048mb', extended: true }))
            .use(Tools.excludePaths(['health', 'authentication/signin', ...global.config.publicRoutes || []]), SessionMiddleware)
            .use(RequestValidationMiddleware)
            // .use(CustomPlatformLogMiddleware)
            .use((req, res, next) => {
                res.setHeader('Cache-control', 'no-store');
                res.setHeader('Pragma', 'no-cache');
                next();
            });

        if (this['middlewareLoaderOverride']) {
            const sortedGlobals = this['middlewareLoaderOverride'].sort((a, b) => a.index - b.index);
            sortedGlobals.forEach(item => this.app.use(item.middleware));
            this.logger.info (
                `Added ${sortedGlobals.length} global middlewares:\n
                ${
                    sortedGlobals.map(item =>
                        `┌${'─'.repeat(item.name.length + 2)}┬${'─'.repeat(`${item.index}`.length + 2)}┐\n` +
                        `│ \x1b[36m${item.name}\x1b[0m │ ${item.index} │\n` +
                        `└${'─'.repeat(item.name.length + 2)}┴${'─'.repeat(`${item.index}`.length + 2)}┘`
                    ).join('\n')
                }`
            );
        } 
        else {
            this.logger.info(`Added 0 global middlewares.`);
        }
    }

    /**
     * Register the middlewares after the routes have been initialized.
     */
    public $afterRoutesInit(): void | Promise<any> {        
        this.app.use(ErrorMiddleware); // error handler should go last
    }


}
