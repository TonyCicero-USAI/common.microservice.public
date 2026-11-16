import {  DIContext } from "@tsed/di";


/* ATTRIBUTES */

/* METHODS */


export function onLogEnd(ctx: DIContext) {
  
  const logAllRequests = true;
  const res = ctx.getResponse();
  const req = ctx.getRequest();

  try {
    const url = res.req.originalUrl || res.req.url;

 
    if (url?.startsWith('/health/')) {
      // Disable logging for '/health/' routes so that the logs do not become cluttered from continuous health checks from kubernetes.
      return;
    }
    else {
      let status = res.statusCode.toString();
      if (res.statusMessage) {
        status += '-' + res.statusMessage;
      }
      console.log('[',new Date(),`] [${status}] ${res.req.method} ${url}`);
      if (res.req.method !== 'OPTIONS') {
        if (res.error || logAllRequests) {
          const user = req.tokenDecoded?.user;
          const organization = { name: req.tokenDecoded?.organizationPkId, pkId: req.tokenDecoded?.organizationPkId };

          // This is where logging can be expanded by sending logs to an external source or file.
          // User and organization information is also available via req.tokenDecoded.

          if (res.statusMessage) {
            status += '-' + res.statusMessage;
          }
        }
      }
      ctx.logger.flush();
    }
  }
  catch (error) {
    console.warn('Problem logging incoming request. ', error);
  }
}