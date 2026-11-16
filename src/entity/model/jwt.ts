
import GlobalConstants from '@src/global.constants.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * JWT
 */
export class JWT {

    /* ATTRIBUTES */

    public organization_pk_id: string; // legacy - Istio for REST API is currently looking at the organization_pk_id field to block/allow traffic
    public iat: string; // issued at timestamp
    public exp: string; // expiration timestamp
    public iss: string; // domain
    public sub: string; // email, application name
    public aud: any; // org, tenant, app
    public jti: string; // unique id to prevent replay attacks
    public roles:  ('Admin' | 'Application Service Account' | 'Org Admin' | 'User' | 'Guest' | 'Service Account' | 'System Admin') [];
    public sub_id: {format: string, id: string}; // userPkId, applicationPkId

    [key: string]: any; // custom payload

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(json?) {
        Object.assign(this, json || {});
        this.jti = uuidv4();
    }

    /* METHODS */

    /**
     * Add Audience.
     */
    public addAudience(referencePkId:string, referenceType: 'Organization' | 'Tenant' | 'Application' | 'Integration' | 'Process') {
        if (referencePkId) {
            if (!this.aud?.length) { this.aud = []}
            switch (referenceType) {
                case 'Application':
                    this.aud.push(`app://${referencePkId}`);
                    break;
                case 'Organization':
                    this.aud.push(`org://${referencePkId}`);
                    this.organization_pk_id = referencePkId; // Legacy - Istio is currently looking at the organization_pk_id field to block/allow traffic
                    break;
                case 'Tenant':
                    this.aud.push(`tenant://${referencePkId}`);
                    break;
                case 'Integration':
                    this.aud.push(`integration://${referencePkId}`);
                    break;
                case 'Process':
                    this.aud.push(`process://${referencePkId}`);
                    break;
            }
        }
    }

    /**
     * Create Application Service Account Token.
     */
    public createJWT(type: 'Application' | 'User', organizationPkId?, user?) {
        if (type === 'Application') {
            this.sub = GlobalConstants.getApplicationName();
            this.addAudience(GlobalConstants.getApplicationPkId(), 'Application');
            this.setSubject({pkId: GlobalConstants.getApplicationPkId()});
            this.roles = ['Application Service Account'];
        }
        else {
            this.organization_pk_id = organizationPkId;
            this.setSubject(user);
            this.addAudience(GlobalConstants.getApplicationPkId(), 'Application');
            this.addAudience(organizationPkId, 'Organization');
        }
        return this;
    }

    /**
     * Get Audience.
     */
    public getAudience(referenceType: 'Application' | 'Organization' | 'Tenant'): string {
        const typeMap = {'Application': 'app://', 'Organization': 'org://', 'Tenant': 'tenant://'}
        const prefix = typeMap[referenceType];
        if (prefix && this.aud?.length) {
            const audience = this.aud.find(aud_ => aud_.startsWith(prefix));
            if (audience) {
                return audience;
            }
            else {
                return "";
            }
        }
        else {
            return "";
        }
    }

    /**
     * List audiences.
     */
    public listAudiences(): {referencePkId: string, referenceType: string}[] {
        const audiences = [];
        const typeMap = {
            'app': 'Application',
            'org': 'Organization',
            'tenant': 'Tenant',
            'integration': 'Integration',
            'process': 'Process'
        }

        for (let audience of this.aud) {
            const parts = audience.split('://');
            const type = parts[0];
            const pkId = parts[1];
            audiences.push({referenceType: typeMap[type], referencePkId: pkId});
        }

        return audiences;
    }

    public setSubject(subject: any) {
        if (subject?.pkId) {
            this.sub_id = {format: 'opaque', id: subject.pkId};
            this.sub = subject?.email || subject?.name;
        }
    }

}
