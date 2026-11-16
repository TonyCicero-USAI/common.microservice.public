import { Context, Middleware, MiddlewareMethods, Req, Res } from '@tsed/common';
import { Unauthorized } from '@tsed/exceptions';

import { JWT } from '@src/entity/model/jwt.js';
import { Tools } from '@src/util/tools.js';
import { Util } from '@src/util/util.js';
import { User } from '@src/entity/user.js';

import { AuthorizationService } from '@src/services/authorization.service.js';
import { CookieService } from '@src/services/cookie.service.js';
import { JwtService } from '@src/services/jwt.service.js';


export interface IToken {
    sid: string;
    domain: string;
    organizationName: string;
    organizationPkId: string;
    user: User;
}


/**
 * The session middleware processes the cookie passed from the authentication
 * microservice. All microapps using the common code uses the same us-ai-cookie.
 * By doing this, users can easily switch between applications. Also, each
 * microapp may have its own cookie for anything but authentication.
 */
@Middleware()
export class SessionMiddleware implements MiddlewareMethods {

    /* ATTRIBUTES */


    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private authorizationService: AuthorizationService,
        private cookieService: CookieService,
        private jwtService: JwtService) {

    }

    /* METHODS */


    /**
     * Start the session by processing the cookie. If the cookie exists and
     * the system can read it, then the user has been successfully authenticated
     * from the authentication microservice.
     */
    public async use(@Req() req: Req, @Res() res: Res, @Context() ctx: Context) {
        try {
            console.log('/src/middlewares/session isAuthorizationDisabled=', global.config.get('isAuthorizationDisabled'))
            if (global.config.get('isAuthorizationDisabled')) {
                // If authorization is disabled, we will not call the authorization service to 
                // get the user and organization information. We will also allow 'Guest' users.
                const user = new User();
                let organizationPkId;
                const cookieName = process.env.COOKIE_NAME || 'cookie';
                const cookie = this.cookieService.getCookie(req, cookieName);
                const verifiedToken = cookie ? this.jwtService.verify(cookie) : undefined;
                if (verifiedToken) {
                    const jwt = new JWT(verifiedToken);
                    const audiences = jwt.listAudiences();
                    organizationPkId = audiences.find(audience_ => audience_.referenceType === 'Organization')?.referencePkId;
                    user.pkId = jwt.sub_id.id;
                    user.firstName = jwt.sub;
                    user.email = jwt.sub;
                }
                else {
                    user.firstName = 'Guest';
                    user.lastName = 'User';
                }

                const payload: IToken = {
                    sid : Util.uuid(),
                    user,
                    organizationName : organizationPkId ? organizationPkId : "Shared",
                    organizationPkId : organizationPkId ? organizationPkId : "shared",
                    domain : ''
                };
                req.tokenDecoded = payload;
            }
            else {
                const cookieName = process.env.COOKIE_NAME || 'cookie';
                const cookie = this.cookieService.getCookie(req, cookieName);
                if (cookie) {
                    const verifiedToken = this.jwtService.verify(cookie);
                    if (verifiedToken) {
                        const jwt = new JWT(verifiedToken);
                        const audiences = jwt.listAudiences();
                        let userPkId = jwt.sub_id.id;
                        let user = await this.authorizationService.user.get(userPkId);
                        if (user && Tools.isValidJson(user)) {
                            if (typeof user === 'string') { user = JSON.parse(user); }

                            // If an organization audience claim is present in the token, then we must call the authorization
                            // service to retrieve organization information such as the name. If no organization claim is present
                            // then we will set the organizationPkId and organization to 'Shared' for compatibility reasons.
                            let organizationPkId = audiences.find(audience_ => audience_.referenceType === 'Organization')?.referencePkId;
                            let organization;
                            if (organizationPkId) {
                                organization = await this.authorizationService.organization.get(organizationPkId);
                                if (organization && Tools.isValidJson(organization)) {
                                    if (typeof organization === 'string') { organization = JSON.parse(organization); }
                                }
                            }


                            // The decoded token information is added to the request object under the 'tokenDecoded' field
                            // so that all requests have access to the user and organizationization information.
                            const payload: IToken = {
                                sid : Util.uuid(),
                                user,
                                organizationName : organization?.name || "Shared",
                                organizationPkId : organization?.pkId || "shared",
                                domain : ''
                            };
                            req.tokenDecoded = payload;
                        }
                        else {
                            throw new Unauthorized('User not found or does not have permission', { redirect: process.env.UNAUTHORIZED_REDIRECT || '' });
                        }
                    }
                }
                else {
                    throw new Unauthorized('Invalid Token.', { redirect: process.env.UNAUTHORIZED_REDIRECT || '' });
                }
            }
        } 
        catch (error) {
            console.log('/middlwares/session error:', error);
            throw new Unauthorized(error || 'Invalid Token.', { redirect: process.env.UNAUTHORIZED_REDIRECT || '' });
        }
    }

}
