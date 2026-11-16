/**
 * This class defines all of the routes on the server. The 
 * security service users this class to manage access controls
 * for each route.
 */
export default class ServerRoutes {

    static ROUTES = {

        AUTHENTICATION_KEEP_ALIVE: '/authentication/keepAlive',
        AUTHENTICATION_REDIRECT : '/authentication/redirect',
        AUTHENTICATION_SIGNIN : '/authentication/signin',
        AUTHENTICATION_SIGNOUT : '/authentication/signout',

        CONFIGURATION_LIST: '/configuration/list',
        CONFIGURATION_SETTINGS: '/configuration/settings',
        CONFIGURATION_UPDATE_METADATA: '/configuration/updateMetadata',

        CONFIGURATION_ATTRIBUTE_APPROVE: '/configuration/attribute/approve',

        DATA_GET_COUNT: '/data/get/count',
        DATA_GET_FIELDS: '/data/get/fields',
        DATA_GET_INDEX: '/data/get/index',
        DATA_PUBLISH: '/data/publish',
        DATA_INSERT_ONE: '/data/insertOne',
        DATA_INSERT_MANY: '/data/insertMany',
        DATA_UPDATE_ONE: '/data/updateOne',
        DATA_UPDATE_MANY: '/data/updateMany',
        DATA_REMOVE: '/data/remove',
        
        HEALTH_LIVE: '/health/livez',
        HEALTH_READY: '/health/readyz',

        ORGANIZATION: '/organization',

        SECURITY_CHECK_ACCESS: '/security/checkAccess',
        SECURITY_ROLE_ASSIGN: '/security/role/assign',
        SECURITY_ROLE_UNASSIGN: '/security/role/unassign',
        SECURITY_ROLE_LIST: '/security/role/list',

        SYSTEM_GET_ENDPOINTS: '/system/getEndpoints',

        USER: '/user',
        USER_INDEX: '/user/index',
        USER_UPDATE_METADATA: '/user/updateMetadata',

        ERROR : ''

    }

}

