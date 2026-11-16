import { Req, Res } from '@tsed/common';

export class ResponseObject {
  public resultCode: string;
  public resultError?: any;
  public resultErrorResolve?: any;
  public token: string;
  public static success(obj?: any, recordFound = true, message = '') {
    let resObj = new ResponseObject();
    resObj = Object.assign(resObj, obj);
    resObj.resultCode = recordFound ? 'S000' : 'W001';
    if (recordFound === false) {
      resObj.resultError = message || 'No record found';
    }
    return resObj;
  }
  public static error(errorObj: any, errorResolve?: any) {
    const resObj = new ResponseObject();
    resObj.resultCode = 'E000';
    resObj.resultError = errorObj;
    resObj.resultErrorResolve = errorResolve;
    return resObj;
  }
  public assignNewToken(res: Res) {
    if (res.outbound && res.outbound.nextToken) {
      if (!this.token) {
        this.token = res.outbound.nextToken;
      }
      delete res.outbound.nextToken;
    }
    if (res.apiKey) {
      delete res.apiKey;
    }
  }
  public assignNewTokenViaReq(req: Req) {
    if (req.token) {
      this.token = req.token;
    }
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ResponseFileObject {
  public path: string;
  public filename: string;
  public body?: any;
  constructor( path: string, filename: string, body?: any) {
    this.path = path;
    this.filename = filename;
    if (body) {
      this.body = body;
    }
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ResponseItem {
  public item: any;
  public message?: string; // some extra info; for example in case item is null

  constructor(data: any, message?: string) {
    this.item = data;
    if (message) {
      this.message = message;
    }
  }
}
