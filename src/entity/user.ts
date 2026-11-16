import { Column, Entity, ObjectId, ObjectIdColumn, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {

    /* ATTRIBUTES */

    // PROFILE

    @ObjectIdColumn() public _id: ObjectId;

    @Column() pkId: string;
    @Column() firstName: string;
    @Column() lastName: string;
    @Column() middleName: string;
    @Column() email: string;
    @Column() cellPhone: string;
    @Column() workPhone: string;
    @Column() isActive: boolean;
    @Column() isSysAdmin: boolean;
    @Column() isUnauthenticated: boolean;

    @Column() applications: [{ applicationPkId: string; name: string; roles: any[]; }];
    @Column() memberOf: any[] = [];
    @Column() notifications: [];

    // METADATA

    @Column() preference: { isNavigationExpanded: boolean, theme: string };
    @Column() session: {sessionId: string, [key: string]: any};

    @Column() lastLogin: Date;
    @Column() createDate: Date = new Date();
    @Column() updateDate: Date = new Date();

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(json?) {
        if (json) {
            Object.assign(this, json);
        }
    }

    /* METHODS */

    /**
     * Get the user's full name.
     */
    public getFullName() {
        const firstName = this.firstName || '';
        const lastName = this.lastName || '';
        return `${firstName} ${lastName}`.trim();
    }

    /**
     * Get the values from the json and merge it with this object. The json
     * comes from the decrypted cookie and is used to synchronize user objects
     * with login.
     */
    public merge(json){
        this.firstName = json.firstName;
        this.lastName = json.lastName;
        this.isActive = json.isActive;
        this.isSysAdmin = json.isSysAdmin;
        this.memberOf = json.memberOf;

        if (!this.preference) { this.preference = json.preference; }
    }
}
