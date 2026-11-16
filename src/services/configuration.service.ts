import { AfterRoutesInit, Service } from '@tsed/common';
import typeorm from 'typeorm';

import { Configuration } from '@src/entity/configuration.js';
import { dataSources } from '@src/server.js';

import { DatabaseService } from './database.service.js';


@Service()
export class ConfigurationService extends DatabaseService<Configuration>  implements AfterRoutesInit {

    /* ATTRIBUTES */

    protected dataSource: typeorm.DataSource = dataSources[0];   
    private repository: typeorm.MongoRepository<Configuration>;
    private config = global.config;

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor() {
        super(Configuration);
    }

    /* EVENT HANDLING */

    public $afterRoutesInit() {
        this.repository = this.dataSource.getMongoRepository(Configuration);
    }

    /* METHODS */

    /**
     * Create configuration.
     */
    public async create(configuration: Configuration): Promise<Configuration> {
        return await this.dataSource.manager.save(configuration);
    }

}
