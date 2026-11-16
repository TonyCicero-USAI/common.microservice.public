import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { Description, Property, Title } from '@tsed/schema';
import { v4 as uuid } from 'uuid';


@Entity()
export class Configuration {

    /* FIELDS */

    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    @Property()
    pkId: string = uuid();
     
    @Column()
    @Property()
    name: string;

    @Column()
    @Property()
    acronym: string = '';

    @Column()
    @Property()
    status: 'Active' | 'Inactive' = 'Active';
    
    @Column()
    @Property()
    extensions: any = {};

    @Column()
    @Property()
    overlays: any = {};

    @Column() 
    @Property()
    standards: any = {};

    @Column() 
    @Property()
    terms: any = {};

    @Column()
    @Property()
    catalogs: any[] = [];

    @Column()
    @Property()
    dashboards: any = [];

    @Column()
    @Property()
    documents: any[] = [];

    @Column()
    @Property()
    financials: any[] = [];

    @Column()
    @Property()
    navigation: any[] = [];

    @Column()
    @Property()
    roles: any[] = [];
        
    @Column()
    @Property()
    metadata: any = {};

    @Column()
    @Property()
    isGlobal: boolean = false; // is this organization responsible for global application settings? (This should never be updated through the application)

    @Column()
    @Property()
    isSynchronizing: boolean = false;

    /* ATTRIBUTES */


    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(json) {
        Object.assign(this, json || {});
    }

    /* METHODS*/


}
