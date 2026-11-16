import typeorm from 'typeorm';

import { BodyParams, Controller, Post, Req } from '@tsed/common';

import { CheckAccess } from '@src/decorators/check-access.decorator.js';
import { Tools } from '@src/util/tools.js';

import ServerRoutes from './server.routes.js';

import { DataService } from '@src/services/data.service.js';
import { Query } from '@src/util/query.js';


/**
 * Data Routes.
 * 
 * The data routes is used by the artificial intelligence component to build models
 * 
 */
@Controller('/data')
export class DataRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private dataService: DataService,) {
    }

    /* ROUTES */

    @Post('/insertOne')
    @CheckAccess()
    public async insertOne(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { collection, document, options } = body;
            const organizationPkId = req.tokenDecoded.organizationPkId;

            if (collection?.trim() && document) {
                document.organizationPkId = organizationPkId;
                const result = await this.dataService.insertOne(collection, document, options, req);
                return { success: true, inserted: result };
            } else {
                return { success: false, message: "Invalid input: collection and document are required" };
            }
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.DATA_INSERT_ONE, error);
            return { success: false };
        }
    }

    @Post('/insertMany')
    @CheckAccess()
    public async insertMany(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { collection, documents, options } = body;
            const organizationPkId = req.tokenDecoded.organizationPkId;

            if (collection && documents?.length > 0) {
                documents.forEach(document_ => document_.organizationPkId = organizationPkId);
                const result = await this.dataService.insertMany(collection, documents, options, req);
                return { success: true, inserted: result };
            } else {
                return { success: false, message: "Invalid input: collection is required and documents array cannot be empty" };
            }
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.DATA_INSERT_MANY, error);
            return { success: false };
        }
    }

    @Post('/updateOne')
    @CheckAccess()
    public async updateOne(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { collection, filters, updateDocument, options } = body;
            const current = req.tokenDecoded.user;
            const organization = { pkId: req.tokenDecoded.organizationPkId };

            if (collection && filters && updateDocument) {
                let query = Query.build(filters.value);
                query = Query.secure(query, collection, organization, current, filters.metadata?.rule);
                const result = await this.dataService.updateOne(collection, query, {$set:updateDocument}, options, req);
                return { success: true, updated: result };
            }
            else {
                return { success: false, message: "Invalid input: collection, filter, and updateDocument are required" };
            }

        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.DATA_UPDATE_ONE, error);
            return { success: false };
        }
    }

    @Post('/updateMany')
    @CheckAccess()
    public async updateMany(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { collection, filters, updateDocument, options } = body;
            const current = req.tokenDecoded.user;
            const organization = { pkId: req.tokenDecoded.organizationPkId };

            if (collection && filters && updateDocument) {
                let query = Query.build(filters.value);
                query = Query.secure(query, collection, organization, current, filters.metadata?.rule);
                const result = await this.dataService.updateMany(collection, query, {$set:updateDocument}, options, req);
                return { success: true, updated: result };
            }
            else {
                return { success: false, message: "Invalid input: collection, filter, and updateDocument are required" };
            }
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.DATA_UPDATE_MANY, error);
            return { success: false };
        }
    }

    @Post('/remove')
    @CheckAccess()
    public async remove(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            const { collection, filters } = body;
            const current = req.tokenDecoded.user;
            const organization = { pkId: req.tokenDecoded.organizationPkId };

            if (collection && filters) {
                let query = Query.build(filters.value);
                query = Query.secure(query, collection, organization, current, filters.metadata?.rule);  
                const result = await this.dataService.remove(collection, query, req);
                return { success: true, removed: result };
            }
            else {
                return { success: false, message: "Invalid input: collection and pkId are required, pkId cannot be empty or wildcard" };
            }
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.DATA_REMOVE, error);
            return { success: false };
        }
    }

    /**
     * Get a subset of the data in any collection filtered by the specified filters. The start number
     * is the index and the limit is the number of records to return to the client. Note, this method
     * is used by the infinite table to query very large data sets. 
     */
    @Post(`/get/index`)
    @CheckAccess()
    public async getByIndex(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral) {
        try {
            let filters = body.filters;
            let collection = body.collection;
            let project = body.project;

            let start = body.start || 0;
            let limit = body.limit || 100;

            let current = req?.tokenDecoded?.user;
            if (current) {
                let organization = { pkId: req.tokenDecoded.organizationPkId };  // we must get the organization pkid from the authentication token
                let result = await this.dataService.find(current, organization, filters, collection, project, start, limit, req);
                return result;
            }
        }
        catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.DATA_GET_INDEX, error);
            return null;
        }
    }

}
