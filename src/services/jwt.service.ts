
import * as crypto from 'crypto';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';
import { Service } from '@tsed/common';

import { AbstractService } from './abstract.service.js';

@Service()
export class JwtService extends AbstractService {

  /* ATTRIBUTES */

    private certificateFilePath: string;

    constructor() {
        super();
        this.certificateFilePath = global.config.get('jwtCertificateFilePath');
    }

    /**
     * Load Public Key.
     */
    private createPublicKey(): crypto.KeyObject {
        const certificate = this.loadCertificate();
        return crypto.createPublicKey(certificate)
    }

    /**
     * Load certificate.
     */
    private loadCertificate() {
        return fs.readFileSync(this.certificateFilePath, 'utf-8');
    }

    /**
     * Verify JWT Token.
     */
    public verify(token: string, cert?: string) {
        try {
            let publicKey;
            if (cert) {
                publicKey = crypto.createPublicKey(cert)
            } else {
                publicKey = this.createPublicKey();
            }
            const decodedToken = jwt.verify(token, publicKey);
            return decodedToken;
        }
        catch (error) {
            console.log(error)
            return false;
        }
    }

}