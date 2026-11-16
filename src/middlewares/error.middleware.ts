import { ErrorCode } from '../util/error-code.js';
import { Err, Inject, Middleware, Req, Res } from '@tsed/common';
import { Exception } from '@tsed/exceptions';
import { Forbidden, Unauthorized } from '@tsed/exceptions';

import { HttpException } from '@src/util/http-exception.js';
import { ResponseObject } from '@src/util/response-object.js';


@Middleware()
export class ErrorMiddleware {


    /**
     * Constructor.
     */
    public constructor() {
    }

    /**
     * Handle error arising from the server.
     */
    public use(@Err() error: any, @Req() req: Req, @Res() res: Res): any {
        console.log(error)
        // Checks if headers have already been sent to client.
        if (res.headersSent) { throw error; }

        res.error = error;
        const toHTML = (message = '') => message.replace(/\n/gi, '<br/>');

        let errorObj: any;
        let errorResolve: any;
        let code: number;

        // HTTP ERROR
        if (error instanceof HttpException) {
            if (error.status === ErrorCode.notFound) {
                // we send Error back to client. HTTP 200. Notes, the route had been terminated at the error
                const respObj = ResponseObject.error(error);
                respObj.assignNewToken(res);
                // nosemgrep javascript-xss-rule-express_xss G-160
                res.send(respObj);
                return;
            }
            errorObj = error;
            code = error.status;
        }
        else if (error instanceof Unauthorized) {
            errorObj = toHTML(error.message);
            errorResolve = error.body;
            code = error.status;
            const resObj1 = ResponseObject.error(errorObj, errorResolve);
            // nosemgrep javascript-xss-rule-express_xss G-161
            res.status(code).send(resObj1);
            // this.cookieService.removeApplicationCookie(res);
            return;
        }
        else if (error instanceof Forbidden || error instanceof Exception) {
            errorObj = toHTML(JSON.stringify(error.message));
            code = error.status;
        }
        else if (typeof error === 'string') {
            errorObj = toHTML(error);
            code = 404;
        } 
        else {
            errorObj = error;
            code = error.status || 500;
        }

        const resObj = ResponseObject.error(errorObj, errorResolve);
        resObj.assignNewToken(res);
        // nosemgrep javascript-xss-rule-express_xss G-162
        res.status(code).send(resObj);
        return;

    }
}
