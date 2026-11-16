
import { BodyParams, Controller, Post, Req } from '@tsed/common';
import typeorm from 'typeorm';
import { Tools } from '@src/util/tools.js';
import ServerRoutes from './server.routes.js';
import { AuthorizationService } from '@src/services/authorization.service.js';

@Controller('/user')
export class UserRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(private authorizationService: AuthorizationService) {
    }

    /* ROUTES */
    
    /**
     * Get user by id.
     */
    @Post(`/`)
    public async getUser(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const user = req.tokenDecoded.user;
            return user;
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.USER, error);
            return null;
        }
    }

    /**
    * Get index of users.
    */
    @Post(`/index`)
    public async getUserIndex(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            return await this.authorizationService.user.index();
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.USER_INDEX, error);
            return null;
        }
    }

    /**
    * Get endpoints for microapp.
    */
    @Post(`/updateMetadata`)
    public async updateMetadata(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            return;
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.USER_UPDATE_METADATA, error);
            return null;
        }
    }

}
