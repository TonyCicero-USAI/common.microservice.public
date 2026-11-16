import 'module-alias/register.js';
import 'es6-shim';
import 'reflect-metadata';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { importProviders } from '@tsed/components-scan';
import { PlatformBuilder } from '@tsed/common';
import { PlatformExpress } from '@tsed/platform-express';
import path from 'path';

import * as App from '@app/app.js';
import { Server } from '@src/server.js';
import { StartupService } from './services/startup.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = __dirname;


/* ENVIRONMENTS */

if (!process.env['NODE_ENV']) {
  console.error('NODE_ENV not set');
  process.exit(1);
}

/* START SERVER */

let platform: PlatformBuilder;
export const Platform = platform;

/**
 * Bootstrap.
 */
async function bootstrap() {
    try {
        const scannedProviders = await importProviders({
            mount: {
              '/': [path.join(rootDir, '../app/routes/**/*'), `${rootDir}/routes/**/*`]
            },
            imports: [
                path.join(rootDir, '../app/middlewares/**/**{.ts,.js}'),
                path.join(rootDir, '../app/services/**/**{.ts,.js}'),
                `${rootDir}/middlewares/**/*{.ts,.js}`,
                `${rootDir}/services/**/*{.ts,.js}`,
                `${rootDir}/microservices/**/*{.ts,.js}`
            ],
        });

        platform = await PlatformExpress.bootstrap(Server, { ...scannedProviders, logger: { disableRoutesSummary: true } });
        global.injector = platform.injector;
        if (App['bootstrap']) { await App['bootstrap'](platform); }
        const startupService = platform.injector.get<StartupService>(StartupService);
        const success = await startupService.start();
        if (success) {
            await platform.listen();
        }
    } 
    catch (er) {
        console.error(er);
    }
}

bootstrap();
