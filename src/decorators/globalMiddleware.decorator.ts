import { Middleware } from '@tsed/common';
import { useDecorators } from '@tsed/core';
import { InternalServerError } from '@tsed/exceptions';

import { ErrorMiddleware } from '@src/middlewares/error.middleware.js';
import { Server } from '@src/server.js';

// tslint:disable: ban-types
/**
 * This class decorator is for middleware. It will use the middleware class's "use" function in the server automatically for every request.
 * Usage:
 * Use as a decorator instead of using @Middleware().
 * { Req, Res } from '@tsed/common' MUST be passed into the use function of the global middleware.
 * @param priorityIndex Determines when in the queue of all current global middleware where your middleware will be placed.
 * If left empty it will be placed at the end. This will be left empty in Most cases.
 */
export function GlobalMiddleware(priorityIndex?: number): Function {
    useDecorators(Middleware());
    return function globalMiddleware<T extends new(...args: any[]) => {}>(constructor: T) {
        const previousGlobal = Server.prototype['middlewareLoaderOverride'] ? Server.prototype['middlewareLoaderOverride'] : [];
        const useWrapper = async (...args: any[]) => {
            const foundReq = args.find(arg => arg.constructor.name === 'IncomingMessage');
            const foundRes = args.find(arg => arg.constructor.name === 'ServerResponse');
            try {
                await constructor.prototype.use(...args);
            } catch (error) {
                if (!foundRes) throw new InternalServerError(`Global Middleware Error in class ${constructor.name}. Make sure use has a Req/Res parameter. `);
                return await ErrorMiddleware.prototype.use(error, foundReq, foundRes);
            }
            if ( !foundReq || !foundReq.next ) throw new InternalServerError(`Global Middleware Error in class ${constructor.name}. Make sure use has a Req parameter. `);
            return foundReq.next();
        };
        Server.prototype['middlewareLoaderOverride'] = [
            ...previousGlobal,
            { middleware: useWrapper, index: priorityIndex == null ? Number.POSITIVE_INFINITY : priorityIndex, name: constructor.name }
        ];
    };
}
