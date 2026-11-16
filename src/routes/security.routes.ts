
import { BodyParams, Controller, Post, Req } from '@tsed/common';
import typeorm from 'typeorm';
import { Tools } from '@src/util/tools.js';
import ServerRoutes from './server.routes.js';
import { AuthorizationService } from '@src/services/authorization.service.js';
import { CheckAccess } from '@src/decorators/check-access.decorator.js';

@Controller('/security')
export class SecurityRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(private authorizationService: AuthorizationService) {
    }

    /* ROUTES */
    
    /**
     * Check if the user has access to a route.
     */
    @Post(`/checkAccess`)
    public async checkAccess(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { assetPkId, rolePkId, checks, route, type } = body;
            const organizationPkId = req.tokenDecoded.organizationPkId;
            const user = req.tokenDecoded.user;

            if (global.config.get('isAuthorizationDisabled')) { 
                // If authorization is disabled, then we allow all check access calls by default.
                return { isPermissioned: true };
            }
            else {
                return await this.authorizationService.security.checkAccess(organizationPkId, user.pkId, checks, assetPkId, rolePkId, route, type);
            }

        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.SECURITY_CHECK_ACCESS, error);
            return { isPermissioned: false };
        }
    }

    /**
     * Assign a role to a user.
     */
    @Post(`/role/assign`)
    @CheckAccess()
    public async assignRole(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { userPkId, assetPkId, rolePkId } = body;
            const organizationPkId = req.tokenDecoded.organizationPkId;
            return await this.authorizationService.security.role.assign(organizationPkId, rolePkId, userPkId, assetPkId);
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.SECURITY_ROLE_ASSIGN, error);
            return { isPermissioned: false };
        }
    }

    /**
     * Unassign role from a user.
     */
    @Post(`/role/unassign`)
    @CheckAccess()
    public async unassignRole(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { userPkId, assetPkId, rolePkId } = body;
            const organizationPkId = req.tokenDecoded.organizationPkId;
            return await this.authorizationService.security.role.unassign(organizationPkId, rolePkId, userPkId, assetPkId);
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.SECURITY_ROLE_ASSIGN, error);
            return { isPermissioned: false };
        }
    }

    /**
     * List the roles for an application and organization.
     */
    @Post(`/role/list`)
    @CheckAccess()
    public async listRoles(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const organizationPkId = req.tokenDecoded.organizationPkId;
            return await this.authorizationService.security.role.list(organizationPkId);
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.SECURITY_ROLE_ASSIGN, error);
            return { isPermissioned: false };
        }
    }


}
