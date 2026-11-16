

export default class GlobalConstants {
    
    //#region CONSTANTS

  
    //#endregion 

    //#region METHODS
    
    /**
     * Get the application name from the application configuration file.
     */
    public static getApplicationName() {
        return global.config.appName;
    }

    /**
     * Get the application pkid from the application configuration file.
     */
    public static getApplicationPkId() {
        return global.config.appPkId;
    }

    //#endregion 
}