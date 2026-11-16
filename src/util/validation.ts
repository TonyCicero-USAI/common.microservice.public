import {  ObjectId } from 'mongodb';

import { ErrorCode } from '@src/util/error-code.js';
import { HttpException } from '@src/util/http-exception.js';

export class Validation {

  public static throw(validationMessage: string, errorCode = ErrorCode.badRequest) {
    throw new HttpException(errorCode, validationMessage);
  }

  // if value is NULL, throw exception
  public static ifNull(value: any, validationMessage: string, errorCode = ErrorCode.badRequest) {
    if (!value) {
      throw new HttpException(errorCode, validationMessage ? validationMessage : 'Missing data');
    }
  }

  // if value is NULL, throw exception
  public static ifNullOrEmpty(value: any, validationMessage: string, errorCode = ErrorCode.badRequest): any {
    if (!value) {
      throw new HttpException(errorCode, validationMessage ? validationMessage : 'Missing data');
    }
    if (Object.entries(value).length === 0 && value.constructor === Object) {
      throw new HttpException(errorCode, validationMessage ? validationMessage : 'Missing data');
    }
  }
  // if value exists or is true, throw exception
  public static ifTrue(value: boolean, validationMessage: string, errorCode = ErrorCode.forbidden) {
    if (value) {
      throw new HttpException(errorCode, validationMessage);
    }
  }
  // if value is null or empty array, throw exception
  public static ifNotFound(value: any, validationMessage: string = 'No record found', errorCode = ErrorCode.notFound) {
    if (!value) {
      throw new HttpException(errorCode, validationMessage);
    }
    if (value && value.constructor === Array && value.length) {
      throw new HttpException(errorCode, validationMessage);
    }
  }
  // if email is invalid
  public static ifInvalidEmail(email: string, validationMessage: string, errorCode = ErrorCode.badRequest) {
    Validation.ifNull(email, 'Email is required.');
    const vendorEmail = [];
    const fedEmail = [];
    vendorEmail[0] = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    fedEmail[0] = vendorEmail[0];
    fedEmail[1] = /^\w.*\w.(gov|mil)+$/;
    const pattern = vendorEmail;
    // tslint:disable-next-line: prefer-for-of
    for (let ctr = 0; ctr < pattern.length; ctr++) {
      if (!email.match(pattern[ctr])) {
        throw new HttpException(errorCode, validationMessage);
      }
    }
  }
  // if name is invalid
  public static ifInvalidName(name: string, validationMessage: string, errorCode = ErrorCode.badRequest) {
    Validation.ifNull(name, validationMessage);
    const validName = /^[A-Za-z ,.'-]{3,}$/;
    if (!name.match(validName)) {
      throw new HttpException(errorCode, validationMessage);
    }
  }

  // if value exists or is true, throw exception
  public static ifDbOperationSucceeded(
    dbResponse: any, validationMessage?: string, expectedRowCount = 1) {
    if (!dbResponse) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB operation failed.');
    }
    const dbResult = dbResponse.result;
    // expected format of DB response is {n:<infected row count>, ok: 1}
    if (!dbResult) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB operation failed.');
    }
    if (!dbResult.n && !dbResult.ok) {
      // format is not {n:<infected row count>, ok: 1}
      throw new HttpException(ErrorCode.serverError, validationMessage || 'dbResponse format is not ecpected.');
    }
    // Now, format is {n:<infected row count>, ok: 1}, we validate DB result
    if (dbResult.ok !== 1) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB operation failed.');
    }
    if (expectedRowCount === null) {
      // validation for expectedRowCount is not required
      return;
    }
    if (dbResult.n !== expectedRowCount) {
      throw new HttpException(ErrorCode.serverError, validationMessage || `${dbResult.n} records updated. Expected record count is ${expectedRowCount}`);
    }
  }
  public static ifDbUpdateFailed(dbResponse: any, validationMessage?: string, expectedRowCount = 1) {
    if (!dbResponse) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB update operation failed.');
    }
    const dbResult = dbResponse.result;
    // expected format of DB response is {n:<infected row count>, ok: 1}
    if (!dbResult) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB operation failed.');
    }
    if (!dbResult.n && !dbResult.ok) {
      // format is not {n:<infected row count>, ok: 1}
      throw new HttpException(ErrorCode.serverError, validationMessage || 'dbResponse format is not ecpected.');
    }
    // Now, format is {n:<infected row count>, ok: 1}, we validate DB result
    if (dbResult.ok !== 1) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB update operation failed.');
    }
    if (expectedRowCount === null) {
      // validation for expectedRowCount is not required
      return;
    }
    if (dbResult.n !== expectedRowCount) {
      throw new HttpException(ErrorCode.serverError, validationMessage || `${dbResult.n} records updated. Expected record count is ${expectedRowCount}`);
    }
    if (dbResponse.matchedCount < 1) {
      throw new HttpException(ErrorCode.serverError, validationMessage || 'DB update operation does not find any matched.');
    }
    if (dbResponse.matchedCount !== dbResponse.modifiedCount + dbResponse.upsertedCount) {
      throw new HttpException(ErrorCode.serverError, validationMessage || `${dbResponse.modifiedCount + dbResponse.upsertedCount} records updated. Expected record count is ${dbResponse.matchedCount}`);
    }
  }

  public static cleanQuery(query: any) {
    if (query._id) {
      try {
        query._id = new ObjectId(query._id);
      } catch (error) {
        // do not throw error here
      }
    }
    return query;
  }
}
