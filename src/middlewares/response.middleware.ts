import { Context, Middleware, MiddlewareMethods, Req, Res, UseAfter } from '@tsed/common';
import { Description, Returns } from '@tsed/schema';
import { Type, useDecorators } from '@tsed/core';

import { ArrayResponse, NotFoundResponse } from '@src/entity/model/response-model.js';

import { ResponseFileObject, ResponseItem, ResponseObject } from '@src/util/response-object.js';

@Middleware()
export class ResponseMiddleware implements MiddlewareMethods {

    /* METHODS */

    // PUBLIC METHODS

    /**
     * Wrap the http response.
     */
    public use(@Req() req: Req, @Res() res: Res, @Context() $ctx: Context) {
        const result = $ctx.data;
        if (result && result.constructor === Array) {
            // const resObj = ResponseObject.success({ results: result });
            const resObj = new ArrayResponse(result);
            resObj.assignNewToken(res);
            return (resObj);
        }

        if (this.isEmpty(result)) {
            // const resObj = ResponseObject.success(result, false);
            const resObj = new NotFoundResponse();
            resObj.assignNewToken(res);
            return (resObj);
        }

        if (result instanceof ResponseFileObject) {
            if (result.body) {
                res.setHeader('Content-Disposition', 'attachment; filename=' + result.filename);
                res.setHeader('cache-control', 'public, max-age=0, attachment; filename=' + result.filename);
                res.attachment(result.path);
                return result.body.pipe(res);
                // return ;
            }
            setTimeout(() => {
                return res.download(
                    result.path,
                    result.filename,
                    {
                        headers: {
                            'Content-Disposition': 'attachment; filename=' + result.filename,
                            'cache-control': 'public, max-age=0, attachment; filename=' + result.filename
                        }
                    },
                    (err) => {
                        if (err) {
                            return console.error(`${req.url} error`, err);
                            // const resObj = ResponseObject.error(err);
                            // return res.send(resObj);
                        } else {
                            return console.debug(`${req.url} success`);
                        }
                    }
                );
            });
        }

        if (result instanceof ResponseItem) {
            if (this.isEmpty(result.item)) {
                const resObj = ResponseObject.success(result, false, result.message);
                resObj.assignNewToken(res);
                return (resObj);
            }
            const obj = ResponseObject.success({result: result.item}, true);
            obj.assignNewToken(res);
            return (obj);
        }

        const respObj = ResponseObject.success(result, true);
        respObj.assignNewToken(res);
        return (respObj);

    }

    // PRIVATE METHODS

    /**
     * Checks if object has no properties.
     */
    private isEmpty(obj: any) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

}

/**
 * Returns Object.
 */
export function ReturnsObject(description: string = '', type?: Type<any>): Function {
    const decorators: Function[] = [];
    if (type) {
        decorators.push(Returns(200).Description('OK'));
    }

    if (description) {
        decorators.push(Description(description));
    }

    decorators.push(UseAfter(ResponseMiddleware));
    return useDecorators(...decorators);
}
