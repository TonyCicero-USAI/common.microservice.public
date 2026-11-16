import { Inject, InjectorService, Service } from '@tsed/common';
import typeorm from 'typeorm';

import { dataSources } from '@src/server.js';

/**
 * The system service checks the system health, fixes the data integrity,
 * schedules tasks, and handles errors.
 */
@Service()
export class StartupService {
    @Inject()
    protected injector: InjectorService;


    /* ATTRIBUTES */
    protected dataSource: typeorm.DataSource = dataSources[0];
    private applicationPkId = '';

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {        
        this.applicationPkId = global.config.appPkId;
    }

    /**
     * Setup Indexes.
     */
    public async setupIndexes() {
        try {
   
        } catch (error) {
            console.log('/src/services/startup/setupIndexes() error:', error);
        }
        
    }

    /**
     * Perform any startup operations.
     * Must return true for server to begin listening.
     */
    public async start(): Promise<boolean> {
        this.setupIndexes();
        return true;
    }

}

