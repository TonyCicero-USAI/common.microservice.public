import { Inject, Req, Res } from '@tsed/common';
import typeorm from 'typeorm';

import { dataSources } from '@src/server.js';
import { Util } from '@src/util/util.js';

import { IDatabaseService } from '@src/services/database.service.interface.js';

export class DatabaseService<T> implements IDatabaseService {

    /* ATTRIBUTES */

    protected dataSource: typeorm.DataSource = dataSources[0];
    protected mongoRepository: typeorm.MongoRepository<T>;

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(target: typeorm.ObjectType<T> | string) {
        this.mongoRepository = this.dataSource.getMongoRepository(target);
    }

    /* METHODS */

    /**
     * Perform aggregate;
     */
    public async aggregate(pipeline: typeorm.ObjectLiteral[], req?: Req, res?: Res): Promise<any> {
        const result = await this.mongoRepository.aggregate(pipeline).toArray();
        return result;
    }

    /**
     * Perform multiple db write operations.
     */
    public async bulkWrite(operations, req?: Req, res?: Res) {
        const result = await this.mongoRepository.bulkWrite(operations);
        return result;
    }

    /**
     * Count Documents.
     */
    public async count(query, options?, req?: Req, res?: Res): Promise<number> {
        const result = await this.mongoRepository.count(query, options);
        return result;
    }

    /**
     * Create Cusor.
     */
    public createCursor(query: any, req?: Req, res?: Res): typeorm.FindCursor<T>{
        return this.mongoRepository.createCursor(query);
    }

    /**
     * Delete entities matching the query.
     */
    public async delete(query: any, req?: Req, res?: Res): Promise<any> {
        const result = await this.mongoRepository.deleteMany(query);
        return result;
    }

    /**
     * Delete one entity.
     */
    public async deleteOne(pkId: string, req?: Req, res?: Res): Promise<any> {
        const result = await this.mongoRepository.deleteOne({ pkId });
        return result;
    }

    /**
     * Get distinct values for a field.
     */
    public distinct(key: string, query: any, options?:any, req?: Req, res?: Res): Promise<any> {
        return this.mongoRepository.distinct(key, query, options);
    }

    /**
     * Find entities matching the query.
     */
    public async find(query?: any, req?: Req, res?: Res): Promise<T[]> {
        const result = await this.mongoRepository.find(query);
        return result;
    }

   /**
    * Find an entity based on the pkid.
    */
    public async findByPkId(pkId: string, req?: Req, res?: Res) {
        return this.findOne({ pkId }, undefined, req, res);
    }

    /**
     * Find one entity.
     */
    public async findOne(query: typeorm.ObjectLiteral, options?: any, req?: Req, res?: Res): Promise<T> {
        const result = await this.mongoRepository.findOne({ where: query, ...options});
        return result;
    }
    
    /**
     * Find projection.
    */
    public async findProjection(query, projection, req?: Req, res?: Res): Promise<any> {
        const result = await this.mongoRepository.createCursor(query).project(projection).toArray();
        return result;
    }
    
    /**
     * Get the index of items.
     */
    public async index(query, projection, req?: Req, res?: Res): Promise<any> {
        const result = await this.mongoRepository.createCursor(query).project(projection).toArray();
        return result;
    }

    /**
     * Insert Multiple Entities.
     */
    public async insertMany(documents: typeorm.ObjectLiteral[], options?: any, req?: Req, res?: Res): Promise<typeorm.InsertManyResult> {
        const result = await this.mongoRepository.insertMany(documents, options);
        return result;
    }
    
    /**
     * Add an item into the array of the entity matching the query. The item
     * is: { entity.array : <new item> }.
     */
    public async push(query, item, req?: Req, res?: Res) {
        const set = { $push: item };
        const options = { upsert: false, returnOriginal: false };
        const result = await this.mongoRepository.findOneAndUpdate(query, set, options);
        return result.value;
    }

    /**
     * Add an item into the array of the entities matching the query. The item
     * is: { entity.array : <new item> }.
     */
    public async pushMany(query, item, req?: Req, res?: Res) {
        const set = { $push: item };
        const result = await this.mongoRepository.updateMany(query, set);
        return result;
    }

    /**
     * Remove an item from the array of the entity matching the query. The 
     * item is: { entity.array : { <criteria for array item> }}
     */
    public async pull(query, criteria, req?: Req, res?: Res) {
        const set = { $pull: criteria };
        const result = await this.mongoRepository.findOneAndUpdate(query, set);
        return result;
    }

    /**
     * Remove an item from the array of the entities matching the query. The 
     * item is: { entity.array : { <criteria for array item> }}
     */
    public async pullMany(query, criteria, req?: Req, res?: Res) {
        const set = { $pull: criteria };
        const result = await this.mongoRepository.updateMany(query, set);
        return result;
    }

    /**
     * Find entities matching the query.
     */
    public async query(query?: any, req?: Req, res?: Res): Promise<T[]> {
        const result = await this.mongoRepository.find(query || {});
        return result;
    }

    /**
     * Update the entity.
     */
    public async update(query: any, data: any, req?: Req, res?: Res): Promise<any> {
        delete data._id;
        const result = await this.mongoRepository.update(query, data);
        return result;
    }
    
    /**
     * Update the entity.
     */
    public async updateAdvance(query: typeorm.ObjectLiteral, update, options?, req?: Req, res?: Res): Promise<any> {
        delete update._id; // 07/07/25, HPHAN, remove mongodb primary key
        // TODO: what if update = {$set: {_id, ...}}
        const result = await this.mongoRepository.updateOne(query, update, options);
        return result;
    }

    /**
     * Update the entity.
     */
    public async updateOne(query: typeorm.ObjectLiteral, entity: typeorm.ObjectLiteral, options?, req?: Req, res?: Res): Promise<any> {
        if (!entity) { return null; }
        delete entity._id; // 07/07/25, HPHAN, remove mongodb primary key
        const result = await this.mongoRepository.updateOne(query, { $set: entity }, options);
        return result;
    }

    /**
     * Update many entities, with options.
     */
    public async updateMany(query: typeorm.ObjectLiteral, entity: typeorm.ObjectLiteral, options?, req?: Req, res?: Res): Promise<any> {
        if (!entity) { return null; }
        delete entity._id; // 07/07/25, HPHAN, remove mongodb primary key
        const result = await this.mongoRepository.updateMany(query, { $set: entity }, options);
        return result;
    } 

    // UTILITES

    /**
     * Save the document to the database. Update if the document exists. Otherwise.
     * insert if document does not exist. Document should have same schema as T. T
     * should have pkId attribute. Return updated/inserted document that database
     * query returns.
     */
    public async save(document: typeorm.ObjectLiteral, req?: Req, res?: Res): Promise<T> {
        if (!document['pkId']) {
            document['pkId'] = Util.uuid();
        }

        const result = await this.mongoRepository.findOneAndUpdate(
            { pkId: document['pkId'] }, // find by pkId
            { $set: document }, // whole document
            {
              upsert: true, // if found, UPDATE; otherwise INSERT
              returnDocument: 'after' // return updated/inserted document
            }
        );

        if (result.value && result.value._id) {
            delete result.value._id;
        }
        
        return result.value;
    }

    /**
     * Find and update the object in the array. If not found, then insert the
     * object into the array. 
     */
    public async updateObjectInArray(doc:any, field:string, item:any, identifier="pkId", req?: Req, res?: Res): Promise<any> {

        let key = field + "." + identifier;
        let placeholder = field + ".$";
        let query = { pkId: doc.pkId, [key]: item[identifier] };
        let set = { [placeholder]: item };
        let result = await this.find(query);
        if (result.length > 0) {
            const result = await this.mongoRepository.updateOne(query, {$set: set});
            return result;
        }
        else {
            query = { pkId: doc.pkId };
            set = { [field]: item };
            return this.push(query, set, req, res);
        }
    }

}
