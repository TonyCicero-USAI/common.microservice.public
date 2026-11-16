import typeorm from 'typeorm';

import { BodyParams, Controller, Get,  Req } from '@tsed/common';
import { Tools } from '@src/util/tools.js';
import ServerRoutes from './server.routes.js';

/**
 * Health routes are publically accessible endpoints used by kubernetes to determine the status of pods.
 */
@Controller('/health')
export class HealthRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
    }

    /* ROUTES */

    /**
     * Ready.
     */
    @Get('/livez')
    public async live(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            return {
                serverTime: new Date(),
                message: 'Service is Live!',
            };
        }
        catch(error) {
            Tools.handleError(ServerRoutes.ROUTES.HEALTH_LIVE, error);
            return null;
        }
    }

    /**
     * Ready.
     */
    @Get('/readyz')
    public async ready(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            return {
                serverTime: new Date(),
                message: 'Service is Active!',
            };
        }
        catch(error) {
            Tools.handleError(ServerRoutes.ROUTES.HEALTH_READY, error);
            return null;
        }
    }
    
}
