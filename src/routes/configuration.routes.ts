import { BodyParams, Controller, Post, Req } from '@tsed/common';
import typeorm from 'typeorm';

import { ConfigurationService } from '@src/services/configuration.service.js';
import { CheckAccess } from '@src/decorators/check-access.decorator.js';
import ServerRoutes from './server.routes.js';
import { Tools } from '@src/util/tools.js';
import { Configuration } from '@src/entity/configuration.js';
import { AuthorizationService } from '@src/services/authorization.service.js';


@Controller('/configuration')
export class ConfigurationRoute {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private authorizationService: AuthorizationService,
        private configurationService: ConfigurationService,) {

    }

    /* ROUTES */


    /**
     * Get the index of all organizations with the specified query and projection
     */
    @Post(`/list`)
    @CheckAccess()
    public async get(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral): Promise<Configuration[]> {
        try {
            let query = body.query;
            let projection = body.projection;
            if (Object.keys(body.projection)?.length < 1) { projection = { _id:0, pkId:1, name:1, acronym:1, alias:1 }; }
            let organizations = await this.configurationService.index(query, projection, req);
            return organizations;
        }
        catch(error) {
            Tools.handleError(ServerRoutes.ROUTES.CONFIGURATION_LIST, error);
            return null;
        }
    }

    /**
     * Load the settings for the organization.
     */
    @Post(`/settings`)
    @CheckAccess()
    async settings(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral): Promise<any> {

        try {
            let organizationPkId = req.tokenDecoded.organizationPkId;
            let organizationName = req.tokenDecoded.organizationName;

            let configuration = await this.configurationService.findByPkId(organizationPkId, req);
            if (!configuration) {
                configuration = new Configuration({ pkId: organizationPkId, name: organizationName });
                this.configurationService.create(configuration);
            }      

            let roles = await this.authorizationService.security.role.list(organizationPkId);
            if (roles && Tools.isValidJson(roles) && typeof roles === 'string') { roles = JSON.parse(roles); }

            let result: any = {};

            result.dashboards = configuration?.dashboards ? configuration.dashboards : [];
            result.documents = configuration?.documents ? configuration.documents : [];
            result.financials = configuration?.financials ? configuration.financials : [];
            result.documents = configuration?.documents ? configuration.documents : [];
            result.metadata = configuration?.metadata ? configuration.metadata : {};
            result.navigation = configuration?.navigation ? configuration.navigation : [];
            result.processes = [];
            result.roles = roles || [];
            result.routes = [];
            result.standards = configuration?.standards ? configuration.standards : [];
            result.terms = configuration?.terms ? configuration.terms : [];
            result.overlays = configuration?.overlays ? configuration.overlays : [];
            result.extensions = configuration?.extensions ? configuration.extensions : [];

            result.subscription = {};
            result.subscription.numUsers = 0;
            result.subscription.expirationDate = null;
            result.subscription.version = null;

            if (configuration.isGlobal) {result.isGlobal = true;}
            return result;
        }
        catch(error) {
            Tools.handleError(ServerRoutes.ROUTES.CONFIGURATION_SETTINGS, error);
            return null;
        }
    }


    /**
     * Update configuration metadata
     */
    @Post(`/updateMetadata`)
    @CheckAccess()
    public async updateMetadata(@Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral): Promise<any> {
        try {
            const { metadata } = req.body;
            const organizationPkId = req.tokenDecoded.organizationPkId;
            if (metadata) {
                return await this.configurationService.updateOne({pkId: organizationPkId}, {metadata}, req);
            }
        } catch (error) {
            Tools.handleError(ServerRoutes.ROUTES.CONFIGURATION_UPDATE_METADATA, error);
            return null;   
        }
    }
 
}
