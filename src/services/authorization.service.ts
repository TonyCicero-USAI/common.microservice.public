import { Service } from '@tsed/common';

import { AbstractService } from './abstract.service.js';


@Service()
export class AuthorizationService extends AbstractService{

    /* ATTRIBUTES */

    private applicationPkId = global.config.appPkId;
    private host = global.config.get().microservices.authorization?.host;
    private port = global.config.get().microservices.authorization?.port;
    private protocol = global.config.get().microservices.authorization?.protocol;

    private isDisabled = global.config.get('isAuthorizationDisabled');

    public organization = {
        get: (pkId: string) => this.isDisabled ? null : this.getRequest(`/organization?pkId=${encodeURIComponent(pkId)}`, this.host, this.port, this.protocol)
    }
    
    public security = {
        checkAccess: (organizationPkId: string, userPkId: string, checks:string[], assetPkId?: string, rolePkId?: string, route?: string, type?: 'Server' | 'Client', parameters?: any,  ) => 
            this.isDisabled ? null : this.post('/security/checkAccess', {applicationPkId: this.applicationPkId, organizationPkId, userPkId, assetPkId, rolePkId, checks, parameters, route, type }, this.host, this.port, this.protocol),
        jwt: {
            renew: (token: string) => this.isDisabled ? null : this.post('/security/jwt/renew', { token }, this.host, this.port, this.protocol)
        },
        role: {
            get: (pkId: string) => this.isDisabled ? null : this.getRequest(`/security/role/get?pkId=${encodeURIComponent(pkId)}`, this.host, this.port, this.protocol),
            list: (organizationPkId: string) => this.isDisabled ? null : this.getRequest(`/security/role/list?applicationPkId=${encodeURIComponent(this.applicationPkId)}&organizationPkId=${encodeURIComponent(organizationPkId)}`, this.host, this.port, this.protocol),
            assign: (organizationPkId: string, rolePkId: string, userPkId: string, assetPkId?: string) =>
               this.isDisabled ? null :  this.post('/security/role/assign', { applicationPkId: this.applicationPkId, organizationPkId, rolePkId, userPkId, assetPkId}, this.host, this.port, this.protocol),
            unassign: (organizationPkId: string, rolePkId: string, userPkId: string, assetPkId?: string) =>
                this.isDisabled ? null : this.post('/security/role/unassign', {applicationPkId: this.applicationPkId, organizationPkId, rolePkId, userPkId, assetPkId}, this.host, this.port, this.protocol),
        }
    }

    public user = {
        get: (pkId: string) => this.isDisabled ? null : this.getRequest(`/user?pkId=${encodeURIComponent(pkId)}`, this.host, this.port, this.protocol),
        index: () => this.isDisabled ? null : this.getRequest('/user/index', this.host, this.port, this.protocol),
    }

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
        super();
    }


    /* METHODS */


}
