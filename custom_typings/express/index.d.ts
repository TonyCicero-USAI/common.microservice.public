import * as e from 'express';

declare module 'express' {

    interface Request {
        connection: any;
        token: any;
        tokenDecoded: any;
        tokenPayload: any;
        files: any;
        user: any;
        headers: any;
        method: any;
        body: any;
        url;
        inbound: any;
        role: any;
    }

    interface Response {
        locals: any;
        body: any;
        error: any;
        outbound: any;
        apiKey: any;
    }
}
