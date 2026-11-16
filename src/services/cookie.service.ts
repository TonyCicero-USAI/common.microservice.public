
import { CookieOptions, Request, Response } from 'express';
import { Service } from '@tsed/common';


export interface ICookieConfig {
    applicationCookie: string;
    reauthCookie: string;
    expireTime: number;
    httpOnly: boolean;
    secure: boolean;
    signed: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
}

@Service()
export class CookieService {

    /* ATTRIBUTES */

    private cookieName = 'us-ai-cookie';

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
    }

    /* METHODS */

    /**
     * Get the cookie from the request.
     */
    public getCookie(req: Request, name: string) {
        return req.cookies[name];
    }

    /**
     * Remove the global cookie.
     */
    public removeCookie(res: Response, host: string, cookieName: string) {
        const isDev = ['dev', 'development'].includes(process.env.NODE_ENV);
        
        const options = {
            domain : isDev ? 'localhost' : process.env.COOKIE_DOMAIN,
            path : '/'
        };

        this.cookieName = cookieName;
        res.clearCookie(this.cookieName, options);
    }

    /**
     * Set the global cookie.
     */
    public setCookie(res: Response, host: string, cookieName: string, cookieValue: string, maxAge?: number) {
        const isDev = ['dev', 'development'].includes(process.env.NODE_ENV);

        const options: CookieOptions = {
            domain : isDev ? 'localhost' : process.env.COOKIE_DOMAIN,
            path : '/',
            secure: isDev ? false : true,
            httpOnly: isDev ? false : true,
            sameSite: 'strict',
            signed: false,
            maxAge: maxAge || 900000, // 15 x 60 x 1,000
        };


        this.cookieName = cookieName;
        return res.cookie(this.cookieName, cookieValue, options);
    }

}
