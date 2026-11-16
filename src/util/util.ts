
// tslint:disable: ban-types
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ClassConstructor, classToPlain, ClassTransformOptions, plainToClass } from 'class-transformer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * For API.
 */
export interface IDataWrapper {
  success?: boolean;
  message?: string;
  data?: any;
  error?: any;
}

/**
 * Utilities
 */
export class Util {

    // CONSTANTS

    /**
     * Instance.
     */
    private static instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    /**
     * API.
     */
    public static Api = {
        async get(url: string, config?: AxiosRequestConfig): Promise<IDataWrapper> {
            try {
                const response = await Util.instance.get(url, config);
                return { success: true, data: response.data };
            } 
            catch (error) {
                const e = error as AxiosError;
                const errorData = {
                    code: e.code,
                    responseData: e.response ? e.response.data : undefined
                };
                console.error('Util.Api.get  >>>', `${url} has error`, e.message, errorData);
                return { success: false, message: e.message, error: errorData };
            }
        },
        async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<IDataWrapper> {
            try {
                const response = await Util.instance.post(url, data, config);
                return { success: true, data: response.data };
            } 
            catch (error) {
                const e = error as AxiosError;
                const errorData = {
                    code: e.code,
                    responseData: e.response ? e.response.data : undefined
                };
                console.error('Util.Api.post  >>>', `${url} has error`, e.message, errorData);
                return { success: false, message: e.message, error: errorData };
            }
        }
    };

    // PUBLIC METHODS

    /**
     * Convert the string into camel case.
     */
    public static camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    /**
     * Clone an object using class-transformer
     */
    public static cast<T, V>(cls: ClassConstructor<T>, plainObj: V, cleanObj: boolean = false, options?: ClassTransformOptions): T {
        const object = cleanObj && typeof plainObj === 'object' ? Util.toCleanObj(<Object>plainObj) : plainObj;
        const result = plainToClass(cls, object, options);
        if (cleanObj) {
            Util.clean(result);
        }
        return result;
    }

    /**
     * Clone an object array using class-transformer
     */
    public static castArray<T, V>(cls: ClassConstructor<T>, plainObjs: V[], cleanObj: boolean = false, options?: ClassTransformOptions): T[] {
        let objects: any[] = plainObjs;
        if (cleanObj) {
            objects = plainObjs.map(o => {
                return typeof o === 'object' ? Util.toCleanObj(o as Object) : o;
            });
        }
        const results = plainToClass(cls, objects, options);
        if (cleanObj) {
            results.forEach(r => {
                Util.clean(r);
            });
        }
        return results;
    }
    
    /**
     * Change HTML
     */
    public static changeHTML(str: string): string {
        if (typeof str !== 'string') {
            return str;
        }
        else {
            str = str.replace('<br>', '');
            let pRegex = /<\/p>/g;
            let fullPRegex = /<p><\/p>/g;


            let h1Regex = /<\/h1>/g;
            let h2Regex = /<\/h2>/g;
            let h3Regex = /<\/h3>/g;
            let h4Regex = /<\/h4>/g;
            let h5Regex = /<\/h5>/g;
            let h6Regex = /<\/h6>/g;

            let ulRegex = /<\/ul>/g;
            let olRegex = /<\/ol>/g;

            // Add <br> to ending paragraph tags and empty paragraph tags
            str = str.replace(pRegex, '</p><br>');
            str = str.replace(fullPRegex, '<br>');


            // Add <br> to ending header tags
            str = str.replace(h1Regex, '</h1><br>');
            str = str.replace(h2Regex, '</h2><br>');
            str = str.replace(h3Regex, '</h3><br>');
            str = str.replace(h4Regex, '</h4><br>');
            str = str.replace(h5Regex, '</h5><br>');
            str = str.replace(h6Regex, '</h6><br>');

            // Add <br> to ending list tags
            str = str.replace(ulRegex, '</ul><br>');
            str = str.replace(olRegex, '</ol><br>');

            

            // Replace all &amp; with just &
            const regex2 = /&amp;/g;
            str = str.replace(regex2, '&');
            
            // Replace all &lt; with just <
            const regex3 = /&lt;/g;
            str = str.replace(regex3, '<');
            
            // Replace all &gt; with just >
            const regex4 = /&gt;/g;
            str = str.replace(regex4, '>');

            return str; 
        }
    }

    /**
     * Remove all NULL properties of an object.
     */
    public static clean(obj: any) {
        Object.keys(obj).forEach(key => {
            if (obj[key] && obj[key].constructor === Array) {
                obj[key].forEach(o => Util.clean(o));
            } 
            else if (obj[key] && obj[key] instanceof Date) {
              // skip
            } 
            else if (obj[key] && typeof obj[key] === 'object') {
                Util.clean(obj[key]); // recursive
            } 
            else {
                if (obj[key] == null) {
                    delete obj[key];
                }
            } // delete
        });
    }
    

    /**
     * Escape variable to be used in regular expression.
     * Intended to be used to escape any user input to avoid potential malicious content from causing a REDOS attack
     */
    public static escapeRegex(input: string) {
        return input.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    /**
     * Flatten Object to a single depth.
     */
    public static flatten(obj) {
        var result = {};

        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
    
            if ((typeof obj[i]) == 'object' && obj[i] !== null) {
                var flatObject = this.flatten(obj[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;
    
                    result[i + '.' + x] = flatObject[x];
                }
            } else {
                result[i] = obj[i];
            }
        }
        return result;
    }

    /**
     * Given an object or an array of objects, clone each object in the list using JSON.stringify/parse.
     * This is a workaround for a bug in typeorm where objects are not properly cloned when using the QueryBuilder.
     * @param obj The object or array of objects to clone.
     * @returns The cloned object or array of objects.
     */
    public static fixObjects<T>(obj: T | T[]): T | T[] {
        if (Array.isArray(obj)) {
            return obj.map(o => {
                const s = JSON.stringify(o);
                return JSON.parse(s);
            });
        }
        else {
            const s = JSON.stringify(obj);
            return JSON.parse(s);
        }
    }
    
    /**
     * Check if a request body contains any keys that starts with a '$'.
     * Keys starting with '$' could potentially be mongo operators and could be used in NoSQL injection.
     */
    public static isBadRequest(obj: any) {
        for (let key of Object.keys(obj || {})) {

            if (typeof key === 'string') {
                if (key.charCodeAt(0) === 36) {
                    return true;
                }
            }

            if (typeof obj[key] === 'object') {
                if (this.isBadRequest(obj[key])) {
                    return true;
                }
            }
        }
    }

    /**
     * Clone an object using class-transformer with excluding non-exposed properties.
     */
    public static safeCast<T, V>(cls: ClassConstructor<T>, plainObj: V, cleanObj: boolean = false): T {
        const object = cleanObj && typeof plainObj === 'object' ? Util.toCleanObj(plainObj as Object) : plainObj;
        const obj = plainToClass(cls, object, { excludeExtraneousValues: true });
        if (cleanObj) {
            Util.clean(obj);
        }
        return obj;
    }

    /**
     * Clone an object array using class-transformer with excluding non-exposed properties.
     */
    public static safeCastArray<T, V>(cls: ClassConstructor<T>, plainObjs: V[], cleanObj: boolean = false): T[] {
        let objects: any[] = plainObjs;
        if (cleanObj) {
            objects = plainObjs.map(o => {
                return typeof o === 'object' ? Util.toCleanObj(o as Object) : o;
            });
        }
        const results = plainToClass(cls, objects, { excludeExtraneousValues: true });
        if (cleanObj) {
            results.forEach(r => {
                Util.clean(r);
            });
        }
        return results;
    }

    /**
     * Convert a Type to JSON object
     */
    public static toObject<T>(object: T, options?: ClassTransformOptions): Object {
        return classToPlain<T>(object, options);
    }

    /**
     * Convert Type array to array of JSON objects
     */
    public static toObjects<T>(object: T[], options?: ClassTransformOptions): Object[] {
        return classToPlain<T>(object, options);
    }

    /**
     * Create a clone of an object which has all NULL property removed
     */
    public static toCleanObj(obj: object) {
      
        const newObj = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] && obj[key].constructor === Array) {
                newObj[key] = obj[key].map(o => (typeof o === 'object' ? Util.toCleanObj(o) : o));
            } 
            else if (obj[key] && obj[key] instanceof Date) {
                newObj[key] = obj[key];
            } 
            else if (obj[key] && typeof obj[key] === 'object') {
                newObj[key] = Util.toCleanObj(obj[key]); // recursive
            } 
            else if (obj[key] != null) {
                newObj[key] = obj[key]; // copy value
            }
        });

        return newObj;
    }
    
    /**
     * Convert object fields to type String.
     */
    public static toStrings(obj, properties) {
        for (const property of properties) {
            obj[property] = obj[property]?.toString();
        }

        return obj;
    }

    /**
     * Sanitize string by removing html tags, and characters unsafe for word docs.
     */
    public static stripHTML(str: string, forXML?: boolean): string {
        if (typeof str !== 'string') {
            if (str !== null) {
                return str;
            } else {
                return '';
            }
        }
        else {
            if (!forXML) {
                // Replace all &amp; with just &
                const regex1 = /&amp;/g;
                str = str.replace(regex1, '&');
                
                // Replace all &lt; with just <
                const regex2 = /&lt;/g;
                str = str.replace(regex2, '<');
                
                // Replace all &gt; with just >
                const regex3 = /&gt;/g;
                str = str.replace(regex3, '>');
            } else {
                // Replace all & with just &amp;
                const regex1 = /&/g;
                str = str.replace(regex1, '&amp;');
                
                // Replace all < with just &lt;
                const regex2 = /</g;
                str = str.replace(regex2, '&lt;');
                
                // Replace all > with just &gt;
                const regex3 = />/g;
                str = str.replace(regex3, '&gt;');
            }

            // replace HTML encoded and non ACII characters
            str = str.replace(/&middot;/g, '•');
            str = str.replace(/&rsquo;/g, '\'');

            // replace <p>, <h> and closing </li> tags by empty string to remove empty space at the beginning of titles and new lines
            // end paragraphs, titles and lists with new line
            // replace break line tags
            str = str.replace(/\n/g, '');
            str = str.replace(/<p><\/p>/g, '');
            str = str.replace(/(<p>|<h[1-6]>|<\/li>|<\/ul>)/g, '');
            str = str.replace(/(<\/p>|<\/h[1-6]>)/g, `\n\n`);
            str = str.replace(/<br>/g, `\n`);
                    

            // Replace <li> tags nested in <ol> tags with number and tab;
            if (str.split('<ul>').length > 1) {

                for (let i = 1; i < str.split('<ul>').length; i++) {
                    let newText = str.split('<ul>')[i].split('<ul>')[0];
                    let replacement = newText
                    
                    while (replacement.search('<li>') !== -1) {
                        replacement = replacement.replace('<li>', `\t• `);
                    }
                    str = str.replace(newText, replacement);
                }
            }

            return str ? str.replace(/(<([^<>]+)>)|(\&nbsp;)/g," ").trimEnd() : '';   

        }
    }

    /**
     * Strip special characters from a string.
     */
    public static stripSpecialCharacters(str: string) {
        const SPECIAL_CHARACTERS = /[!@#$%^&*]+/g;
        if (typeof str === 'string') {
            return str ? str.replace(SPECIAL_CHARACTERS, "") : '';
        }
        else {
            return str;
        }
    }

    /**
     * Generate unique id.
     */
    public static uuid() {
        return uuid();
    }


}
