
import { Tools } from '@src/util/tools.js';
import fr from 'follow-redirects';
import * as HTTP from 'http';
import * as HTTPS from 'https';
import FormData from 'form-data';

export class AbstractService {

    constructor() {}


    /**
     * DELETE request.
     */
    protected async deleteRequest(path = '/', hostname: string, port: number, protocol_: string, format: 'string' | 'buffer' = 'string',  headers={}): Promise<any> {
        if (Tools.verifyHostname(hostname)) {
            const protocol = protocol_?.toLowerCase() === 'http' ? fr.http : fr.https;
            return await new Promise((resolve, reject) => {
                setTimeout(() => { resolve([]); }, 20000);

                const agent = new protocol.Agent({
                    host: hostname,
                    port,
                    path,
                    rejectUnauthorized: false
                });

                const options = {
                    'method': 'DELETE',
                    'hostname': hostname,
                    'port': port,
                    'path': path,
                    'headers': {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    'agent': agent,
                    'maxRedirects': 20,
                    'maxContentLength': Infinity,
                    'maxBodyLength': Infinity
                };

                //console.log('GET OPTIONS:', options)

                const req = protocol.request(options, (res) => {
                    const chunks = [];

                    res.on('data', (chunk) => {
                        chunks.push(chunk);
                    });

                    res.on('end', (chunk) => {
                        const bodyGroup = Buffer.concat(chunks);
                        if (format === 'string') {
                            resolve(bodyGroup.toString());
                        }
                        else {
                            resolve(bodyGroup);
                        }
                    });

                    res.on('error', (error) => {
                        console.error(error);
                        // reject(error);
                    });
                });


                //req.write();

                req.on('error', (error) => {
                    console.error(error);
                    resolve([]);
                });

                req.end();
            });
        }
        else {
            console.error(`/services/abstract/deleteRequest error: Calling ${hostname} is not allowed.`)
        }
    }

    public async post(path = '/', body: any, hostname: string, port: number, protocol_: string, headers={}, timeout=300000, format: 'string' | 'buffer' = 'string'): Promise<any> {

        if (Tools.verifyHostname(hostname)) {
            const protocol = protocol_ === 'http' ? fr.http : fr.https;
            return await new Promise((resolve, reject) => {
                setTimeout(() => { resolve(undefined); }, timeout);
    
                const agent = new protocol.Agent({
                    host: hostname,
                    port,
                    path,
                    rejectUnauthorized: false
                });
    
                const options = {
                    'method': 'POST',
                    'hostname': hostname,
                    'port': port,
                    'path': path,
                    'headers': {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    'agent': agent,
                    'maxRedirects': 20,
                    'maxContentLength': Infinity,
                    'maxBodyLength': Infinity
                };
    
                const req = protocol.request(options, (res) => {
                    const chunks = [];
    
                    res.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
    
                    res.on('end', (chunk) => {
                        const bodyGroup = Buffer.concat(chunks);
                        if (format === 'string') {
                            resolve(bodyGroup.toString());
                        }
                        else {
                            resolve(bodyGroup);
                        }
                    });
    
                    res.on('error', (error) => {
                        console.error(error);
                        // reject(error);
                    });
                });
    
                if (body instanceof FormData) {
                    body.pipe(req);
                }
                else {
                    req.write(JSON.stringify(body || {}));
                }
    
                req.on('error', (error) => {
                    console.error(error);
                    resolve(undefined);
                });
    
                req.end();
            });
        }
        else {
            console.error(`/services/abstract/post error: Calling ${hostname} is not allowed.`)
        }
    }

    /**
     * Make Put request
     */
    public async put(path = '/', body: any, hostname: string, port: number, protocol_: string, headers={}): Promise<any> {

        if (Tools.verifyHostname(hostname)) {
            const protocol = protocol_ === 'http' ? fr.http : fr.https;
            return await new Promise((resolve, reject) => {
                setTimeout(() => { resolve(undefined); }, 300000);
    
                const agent = new protocol.Agent({
                    host: hostname,
                    port,
                    path,
                    rejectUnauthorized: false
                });
    
                const options = {
                    'method': 'PUT',
                    'hostname': hostname,
                    'port': port,
                    'path': path,
                    'headers': {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    'agent': agent,
                    'maxRedirects': 20,
                    'maxContentLength': Infinity,
                    'maxBodyLength': Infinity
                };
    
                const req = protocol.request(options, (res) => {
                    const chunks = [];
    
                    res.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
    
                    res.on('end', (chunk) => {
                        const bodyGroup = Buffer.concat(chunks);
                        resolve(bodyGroup.toString());
                    });
    
                    res.on('error', (error) => {
                        console.error(error);
                        // reject(error);
                    });
                });
    
                const postData = JSON.stringify(body || {});
    
                // nosemgrep javascript-xss-rule-express_xss G-177
                req.write(postData);
    
                req.on('error', (error) => {
                    console.error(error);
                    resolve(undefined);
                });
    
                req.end();
            });
        }
        else {
            console.error(`/services/abstract/put error: Calling ${hostname} is not allowed.`)
        }
    }

    /**
     * GET request.
     */
    protected async getRequest(path = '/', hostname: string, port: number, protocol_: string, format: 'string' | 'buffer' = 'string',  headers={}): Promise<any> {
        const protocol = protocol_?.toLowerCase() === 'http' ? fr.http : fr.https;
        return await new Promise((resolve, reject) => {
            setTimeout(() => { resolve([]); }, 20000);

            const agent = new protocol.Agent({
                host: hostname,
                port,
                path,
                rejectUnauthorized: false
            });

            const options = {
                'method': 'GET',
                'hostname': hostname,
                'port': port,
                'path': path,
                'headers': {
                    'Content-Type': 'application/json',
                    ...headers
                },
                'agent': agent,
                'maxRedirects': 20,
                'maxContentLength': Infinity,
                'maxBodyLength': Infinity
            };

            //console.log('GET OPTIONS:', options)

            const req = protocol.request(options, (res) => {
                const chunks = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', (chunk) => {
                    const bodyGroup = Buffer.concat(chunks);
                    if (format === 'string') {
                        resolve(bodyGroup.toString());
                    }
                    else {
                        resolve(bodyGroup);
                    }
                });

                res.on('error', (error) => {
                    console.error(error);
                    // reject(error);
                });
            });


            //req.write();

            req.on('error', (error) => {
                console.error(error);
                resolve([]);
            });

            req.end();
        });
    }
}
