import { Inject, Service } from '@tsed/common';
import typeorm from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


import { dataSources } from '@src/server.js';
import GlobalConstants from '@src/global.constants.js';


import { User } from '@src/entity/user.js';
import { Query } from '@src/util/query.js';

@Service()
export class DataService {

    /* ATTRIBUTES */

    private config = global.config;
    protected dataSource: typeorm.DataSource = dataSources[0];


    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {


    }

    /* METHODS */

    //#region DATABASE OPERATIONS

    /**
     * Aggregate Operation.
     */
    public async aggregate(collection: string, pipeline: any[], options?, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await mongoRepository.aggregate(pipeline, options).toArray();
        return result;
    }

    /**
     * Insert a single document.
     */
    public async insertOne(collection: string, document: any, options?: any, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await mongoRepository.insertOne(document, options);
        return result;
    }

    /**
     * Insert multiple documents.
     */
    public async insertMany(collection: string, documents: any[], options?: any, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await mongoRepository.insertMany(documents, options);
        return result;
    }


    /**
     * Update a single document.
     */
    public async updateOne(collection: string, filter: any, updateDoc: any, options?: any, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await mongoRepository.updateOne(filter, updateDoc, options);
        return result;
    }

    /**
     * Update multiple documents.
     */
    public async updateMany(collection: string, filter: any, updateDoc: any, options?: any, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await mongoRepository.updateMany(filter, updateDoc, options);
        return result;
    }
    /**
     * Delete Operation (Single Document by pkId).
     */
    public async remove(collection: string, filter: any, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await mongoRepository.deleteOne(filter);
        return result;
    }

    /**
     * Count Operation.
     */
    public async count(collection: string, query, req?, res?) {
        const mongoRepository = this.dataSource.getMongoRepository(collection);
        const result = await this.dataSource.getMongoRepository(collection).count(query);
        return result;
    }


    //#endregion

    //#region DATA SERVICES

    /**
     * Get the list of findings matching the filters, sort, and index requirements.
     */
    public async find(
        current: User,
        organization: any,
        filters: any,
        collection: string,
        project: any,
        start: number,
        limit: number,
        req?,
        res?) {

        if (current) {
            if (organization) {
                if (filters) {

                    let query: any = {}; // the mongodb query object

                    //#region SEARCH

                    // When a search keyword and fields are provided, format the query to search for
                    // the keyword in the specified fields. While the fields are $and to the query,
                    // each search field is $or together.

                    let search = filters.metadata?.search;
                    if (search) {
                        let keyword = search.keyword
                        if (keyword) {
                            let fields = search.fields;
                            if (fields) {
                                if (!query['$or']) { query['$or'] = []; }
                                for (let field of fields) {
                                    let criteria: any = {};
                                    criteria[field] = { $regex: keyword, $options: 'i' };
                                    query['$or'].push(criteria);
                                }
                            }
                        }
                    }

                    // console.log("/services/data/find: QUERY[$or] = ", query['$or']) ;
                    // console.log("/services/data/find: QUERY['$or'] = ", query['$or']) ;

                    //#endregion

                    //#region FILTERS

                    // We have to convert the filters object into a formatted mongodb database query.
                    // If the filter object key is an array, then convert it into a $in query. For both 
                    // arrays and strings, if the value is empty, remove the field from the query 
                    // string.     

                    // Get the data objects that the user can see based on his or her role. Since security
                    // can be applied differently across collections, we will call the secureQuery method
                    // to inject the appropiate checks into the query.

                    query = Query.build(filters.value, query);
                    query = Query.secure(query, collection, organization, current, filters.metadata?.rule);

                    //#endregion

                    //#region RUN COMMAND      


                    // Apply group stage to the aggregate pipleine if fields are specified in metadata.group.
                    // the group also supports the $first and $sum operators as part of the group stage.
                    let group;
                    if (filters.metadata?.group?.fields?.length) {
                        group = { _id: {} };
                        for (let field of filters.metadata.group.fields) {
                            group["_id"][field] = `$${field}`;
                        }

                        if (filters.metadata?.group?.first?.length) {
                            for (let field of filters.metadata.group.first) {
                                group[field] = { $first: `$${field}` };
                            }
                        }

                        if (filters.metadata?.group?.sum?.length) {
                            for (let item of filters.metadata.group.sum) {
                                if (item.condition) {
                                    group[item.newField] = {
                                        $sum: {
                                            $cond: [{ $eq: [`$${item.oldField}`, item.condition] }, 1, 0]
                                        }
                                    };
                                }
                            }
                        }
                    }

                    let criteria: any[] = [{ $match: query }];
                    let sort: any = { _id: -1 };
                    if (filters.metadata?.sort?.active) {
                        sort = { [filters.metadata.sort.active]: filters.metadata.sort.direction === 'asc' ? 1 : -1 }
                    }


                    if (group) { criteria.push({ $group: group }) }

                    let countCriteria = [...criteria, { $count: 'count' }];

                    if (sort) { criteria.push({ $sort: sort }); }
                    if (start) { criteria.push({ $skip: start }); }
                    if (limit) { criteria.push({ $limit: limit }); }

                    project = project || { _id: 0 };
                    if (project) { criteria.push({ $project: project }); } // the projection must be after the sort for index to work

                    let result: any = {};
                    let countResult = await this.aggregate(collection, countCriteria, undefined, req, res);
                    result.count = countResult[0]?.count || 0;
                    result.values = await this.aggregate(collection, criteria, undefined, req, res);
                    result.status = "Success";

                    // console.log("/services/data/find: -----------------------------------------------------------------------");
                    // console.log("/services/data/find: FILTERS = ", filters.value);
                    // console.log("/services/data/find: QUERY = ", query);
                    // console.log("/services/data/find: CRITERIA = ", JSON.stringify(criteria, null, 4)) ;
                    // console.log("/services/data/find: # %s = %o ", collection?.toUpperCase(), result.count);
                    // console.log("/services/data/find: -----------------------------------------------------------------------");

                    return result;

                    //#endregion
                }
            }
        }

        return {
            count: 0,
            findings: [],
            status: 'Failed'
        };
    }

    //#endregion


}
