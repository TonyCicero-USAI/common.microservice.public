import { ObjectId } from "mongodb";
import { User } from "@src/entity/user.js";

export class Query {

    //#region METHODS

    /**
     * Recursively build the mongodb query using only the data from the filters object. The filters
     * object has a value and within the value is a nested and / or object where fields are captured
     * in each and / or object. The nested and / or allows the client to build complex queries with
     * conditional logi.
     */
    public static build(filterValue, query = {}) {

        for (let key of Object.keys(filterValue || {})) {
            let value = filterValue[key];
            switch (key) {
                case 'and': {
                    if (!query['$and']) { query['$and'] = []; }
                    const subQuery = this.build(value, {}); // build a new object
                    for (let key of Object.keys(subQuery || {})) {
                        query['$and'].push({[key]: subQuery[key]})
                    }
                    break;
                }
                case 'or': {
                    if (!query['$or']) { query['$or'] = []; }
                    const subQuery = this.build(value, {}); // build a new object
                    for (let key of Object.keys(subQuery || {})) {
                        query['$or'].push({[key]: subQuery[key]})
                    }
                    break;
                }
                case '_id':
                    if (Array.isArray(value)) {
                        query[key] = value.map(v => new ObjectId(v));
                    } else if (typeof value === 'string') {
                        query[key] = new ObjectId(value);
                    } else {
                        query[key] = value;
                    }
                    break;
                default: {
                    if (Array.isArray(value)) {
                        if (value.length) {
                            if (Array.isArray(query)) {
                                query.push({ [key]: { '$in': value } });
                            } 
                            else {
                                query[key] = { '$in': value };
                            }
                        }
                    }
                    else if (typeof value === 'string') {
                        if (value !== '') {
                            if (Array.isArray(query)) {
                                query.push({ [key]: value });
                            } 
                            else {
                                query[key] = value;
                            }
                        }
                    }
                    else if (value && typeof value === 'object') {
                        const transformed = this.transformOperators(value);
                        if (Array.isArray(query)) {
                            query.push({ [key]: transformed });
                        } else {
                            query[key] = transformed;
                        }
                    }
                    else {
                        if (value !== null) {
                            if (Array.isArray(query)) {
                                query.push({ [key]: value });
                            } 
                            else {
                                query[key] = value;
                            }
                        }
                    }
                    break;
                }
            }
        }

        if (query['$and']?.length === 0) { delete query['$and']; }
        if (query['$or']?.length === 0) { delete query['$or']; }

        return query;
    }


    /**
     * Secure a query.
     * Should be ran after the main query is built to prevent a hacker from 
     * overwriting the security part of the query.
     */
    public static secure(query, collection: string, organization: any, user: User, rule?:string) {
        // TODO: Implement Logic for securing a query
        return query;
    }

    /**
     * Recursively transform/replace operator keys.
     */
    private static transformOperators(obj: any) {
        const result = {};
        for (let key of Object.keys(obj || {})) {
            const value = obj[key];
            const operationKey = ['gte', 'lte', 'gt', 'lt'].includes(key) ? '$' + key : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[operationKey] = this.transformOperators(value);
            }
            else {
                result[operationKey] = value;
            }
        }
        return result;
    }


    //#endregion
}