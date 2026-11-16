
import { AuthorizationService } from '@src/services/authorization.service.js';

import { Tools } from '@src/util/tools.js';
import { Context, Middleware, Req, Res, UseBefore } from '@tsed/common';
import { StoreSet, useDecorators } from '@tsed/core';
import { Exception, Forbidden } from '@tsed/exceptions';


/**
 * @CheckAccess Decorator.
 * Checks access to a specific route and applie body parameter validation.
 */
export function CheckAccess(): Function {
    return useDecorators(
        UseBefore(CheckAccessMiddleware)
    );
}

@Middleware()
export class CheckAccessMiddleware {

    /* ATTRIBUTES */

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private authorizationService: AuthorizationService) { }

    /* METHODS */

    /**
     * Entry point for the middleware.
     */
    public async use(@Req() req: Req, @Res() res: Res, @Context() ctx: Context): Promise<any> {
        try {
            const organizationPkId = req.tokenDecoded?.organizationPkId;
            const user = req.tokenDecoded?.user;

            if (!global.config.get('isAuthorizationDisabled')) { 
                let result:any = await this.authorizationService.security.checkAccess(organizationPkId, user.pkId, ['Route'], undefined, undefined, req.url, 'Server', req.body);
                if (Tools.isValidJson(result) && typeof result === 'string') {result = JSON.parse(result)}

                if (!result.isPermissioned) {
                    throw new Forbidden('Unauthorized');
                }
            }

        } catch (error) {
            throw new Exception(500, error);
        }
    }
}