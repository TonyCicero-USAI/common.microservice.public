import typeorm from 'typeorm';

import { BodyParams, Controller, Post, Req, Session } from '@tsed/common';
import { Tools } from '@src/util/tools.js';
import ServerRoutes from './server.routes.js';


@Controller('/organization')
export class OrganizationRoutes {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
    }

    /* ROUTES */

    /**
     * Get organization.
     */
    @Post('/')
    public async getOrganization(@Session() session: any, @Req() req: Req, @BodyParams() body: typeorm.ObjectLiteral): Promise<any> {
        try {
            const tokenDecoded = req.tokenDecoded;
            if (tokenDecoded) {

                let organizationName = tokenDecoded.organizationName;
                let organizationPkId = tokenDecoded.organizationPkId;
                
                return {
                    orgName: organizationName,
                    orgPkId: organizationPkId,
                    metadata: {}
                };
            }
            return null;
        }
        catch(error) {
            Tools.handleError(ServerRoutes.ROUTES.ORGANIZATION, error);
            return null;
        }
    }
}
