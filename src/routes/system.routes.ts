
import { BodyParams, Controller, Post, Req } from '@tsed/common';
import typeorm from 'typeorm';
import { Tools } from '@src/util/tools.js';
import ServerRoutes from './server.routes.js';

@Controller('/system')
export class SystemRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
    }

    /* ROUTES */
    
    /**
     * Get all app settings for microapp.
     */
    @Post(`/settings`)
    public async getAppSettings() {

        return { };
    }

    /**
    * Get endpoints for microapp.
    */
    @Post(`/getEndpoints`)
    public async getEndpoints(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            return {

            };
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.SYSTEM_GET_ENDPOINTS, error);
            return null;
        }
    }

}
