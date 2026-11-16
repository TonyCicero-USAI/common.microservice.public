import { Context, Middleware, MiddlewareMethods, Req, Res } from '@tsed/common';
import { BadRequest } from '@tsed/exceptions';

import { Util } from '@src/util/util.js';


/**
 * The Request Validation middleware checks that the request body passes validation rules.
 */
@Middleware()
export class RequestValidationMiddleware implements MiddlewareMethods {

    /* ATTRIBUTES */


    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
    }

    /* METHODS */

    /**
     * Check that the request body does not contain NoSQL injection.
     */
    public async use(@Req() req: Req, @Res() res: Res, @Context() ctx: Context) {
        try {
            const isBadRequest = Util.isBadRequest(req?.body);
            if (isBadRequest) {
                throw new BadRequest('Bad Request.');
            }
        } 
        catch (error) {
            throw new BadRequest('Bad Request.');
        }
    }

}
