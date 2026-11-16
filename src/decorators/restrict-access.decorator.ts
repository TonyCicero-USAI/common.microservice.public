
import { Context, Middleware, Req, Res, UseBefore } from '@tsed/common';
import { useDecorators } from '@tsed/core';
import { Exception, Forbidden } from '@tsed/exceptions';

/**
 * @RestrictAccess Decorator.
 * Restricts a route to only system admins.
 */
export function RestrictAccess(): Function {
    return useDecorators(
        UseBefore(RestrictAccessMiddleware)
    );
}

@Middleware()
export class RestrictAccessMiddleware {

    /* ATTRIBUTES */

    /* CONSTRUCTOR */


    /**
     * Constructor.
     */
    constructor() { }

    /* METHODS */

    /**
     * Entry point for the middleware.
     */
    public async use(@Req() req: Req, @Res() res: Res, @Context() ctx: Context): Promise<any> {
        try {
      
            const user = req.tokenDecoded?.user;

            if (!user.isSysAdmin) {
                throw new Forbidden('Unauthorized');
            }

        } catch (error) {
            throw new Exception(500, error);
        }
    }
}
