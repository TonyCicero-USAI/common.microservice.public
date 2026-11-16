import { BodyParams, Context, Controller, Post, Req, Res, Session } from '@tsed/common';
import typeorm from 'typeorm';
import { Unauthorized } from '@tsed/exceptions';

import { Tools } from '@src/util/tools.js';

import ServerRoutes from './server.routes.js';
import { JwtService } from '@src/services/jwt.service.js';
import { CookieService } from '@src/services/cookie.service.js';
import { AuthorizationService } from '@src/services/authorization.service.js';


@Controller('/authentication')
export class AuthenticationRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private authorizationService: AuthorizationService,
        private cookieService: CookieService,
        private jwtService: JwtService) {

    }

    /* ROUTES */

    /**
     * Route to refresh cookie.
     */
    @Post('/keepAlive')
    public async keepAlive(@Req() req: Req, @Res() res: Res, @Session() session: any, @BodyParams() body: typeorm.ObjectLiteral): Promise<any> {
        try {
            const cookieName = process.env.COOKIE_NAME || "cookie";
            const host =  process.env.COOKIE_DOMAIN || 'http://localhost:4500';
            let token = this.cookieService.getCookie(req, cookieName);
            if (token) {
                token = await this.authorizationService.security.jwt.renew(token);
                if (token) {
                    this.cookieService.setCookie(res, host, cookieName, token);
                }
            }

            return {timeStamp: new Date()};
        }
        catch(e) {
            Tools.handleError(ServerRoutes.ROUTES.AUTHENTICATION_KEEP_ALIVE, e);
            return;
        }
    }

    /**
     * Redirect the user to the specified path.
     */
    @Post('/redirect')
    public async redirect(@Req() req: Req, @Res() res: Res, @Session() session: any, @BodyParams() body: typeorm.ObjectLiteral): Promise<any> {
        try {
            const path = body.path;
            const token = req.tokenDecoded;
            const protocol = (token.domain === 'localhost') ? 'http' : 'https';
            const domain = (token.domain === 'localhost') ? 'localhost:4200' : token.domain;
            const link = `${protocol}://${domain}/${path}`;
    
            return {
                domain: domain ? link : 'https://usai.io'
            };
        }
        catch(e) {
            Tools.handleError(ServerRoutes.ROUTES.AUTHENTICATION_REDIRECT, e);
            return;
        }
    }

    /**
     * Verify JWT and add the JWT to a cookie.
     */
    @Post('/signin')
    public async signin(@Req() req: Req, @Res() res: Res, @Context() ctx: Context, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { token } = req.body;

            if (token) {
                const decoded = this.jwtService.verify(token);

                if (decoded) {
                    const host =  process.env.COOKIE_DOMAIN || 'http://localhost:4500';
                    const cookieName = process.env.COOKIE_NAME || "cookie";
                    this.cookieService.setCookie(res, host, cookieName, token);
                    res.redirect((process.env.AUTHORIZED_REDIRECT || host) + '/signin')
                }

                return decoded;
            }
        }
        catch(e) {
            Tools.handleError(ServerRoutes.ROUTES.AUTHENTICATION_SIGNIN, e);
            return;
        }
    }

    /**
     * Logout of the system and destroy the session.
     */
    @Post('/signout')
    public async signout(@Req() req: Req, @Res() res: Res, @BodyParams() body: typeorm.ObjectLiteral) {
        
        const host =  process.env.COOKIE_DOMAIN || 'http://localhost:4500';
        const cookieName = process.env.COOKIE_NAME || "cookie";
        this.cookieService.removeCookie(res, host, cookieName);
        let link = process.env.UNAUTHORIZED_REDIRECT || '';

        throw new Unauthorized('Logout', { redirect: link }); // let the client redirect
    }
}
