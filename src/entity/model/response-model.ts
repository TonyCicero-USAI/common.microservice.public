import { Res } from '@tsed/common';
import { CollectionOf, Example, Property } from '@tsed/schema';
import { WebUrl } from './web-url.js';

export class BaseResponse {
 
  public resultCode: string;
  public token: string;
  public assignNewToken(res: Res) {
    if (res.outbound && res.outbound.nextToken) {
      this.token = res.outbound.nextToken;
    }
    if (res.apiKey) {
      delete res.apiKey;
    }
  }
}

// tslint:disable-next-line: max-classes-per-file
export class SuccessResponse extends BaseResponse {
  @Example('S000')
  public resultCode = 'S000';
}

// tslint:disable-next-line: max-classes-per-file
export class NotFoundResponse extends BaseResponse {
  @Example('W001')
  public resultCode = 'W001';
  @Example('Data not found')
  public resultMessage = 'Data not found';
}

// tslint:disable-next-line: max-classes-per-file
export class ErrorResponse extends BaseResponse {
 
  @Example('E000')
  public resultCode = 'E000';
 
  public resultError?: any;
}

// tslint:disable-next-line: max-classes-per-file
export class BadRequestResponse extends ErrorResponse {
  @Example('Bad request on parameter')
  public resultError?: any;
}

// tslint:disable-next-line: max-classes-per-file
export class ArrayResponse<T> extends SuccessResponse {
 
  public results: T[];
 
  public resultMessage?: string;
 
  public resultsCount?: number;
  constructor(results: T[]) {
    super();
    this.results = results;
    if (!results) {
      this.resultCode = 'W001';
      this.resultMessage = 'Data not found';
      this.resultsCount = 0;
      return;
    }
      this.resultCode = 'S000';
      this.resultsCount = results.length;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class WebUrlsResponseModel extends ArrayResponse<WebUrl> {

  @CollectionOf(WebUrl)
  public results: WebUrl[];
}
