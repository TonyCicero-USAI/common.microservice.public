import _ from 'lodash';

export class Tools {

    // PUBLIC METHODS

    /**
     * Slice Buffer into chunks.
     */
    public static chunk(buffer: Buffer, maxBytes: number) {
        const result = [];
        while (buffer.length) {
            result.push(buffer.slice(0, maxBytes));
            buffer = buffer.slice(maxBytes); // Skip space (if any)
        }
        return result;
    }

    /**
     * Exlude Paths.
     * Create regex that matches all paths except the provided ones.
     */
    public static excludePaths(paths: string[]) {
        const start = '^\/(?!';
        const end = ').*$';
        let middle = '';
        for (let i = 0; i < paths.length; i++) {
            middle += paths[i];
            if (i < paths.length -1) {
                middle += '|';
            }
        }
        const RE = RegExp;
        return new RE(start + middle + end);
    }

    /**
     * Inlude Paths.
     * Create regex that matches all paths provided.
     */
    public static includePaths(paths: string[]) {
        if (paths.length > 0) {
            let regex = '';
            for (let i = 0; i < paths.length; i++) {
                regex += '^\/' + _.escapeRegExp(paths[i]) + '$';
                if (i < paths.length -1) {
                    regex += '|';
                }
            }
            const RE = RegExp;
            const result = new RE(regex);
            return result;
        }
        else {
            return new RegExp('$^')
        }
    }

    /**
     * Get the current date/time in a standard format.
     */
    public static getCurrentDateTime()
    {
        return new Date().toLocaleString('en-GB');
    }  

    /**
     * Get nested value.
     */
    public static getNestedValue(field: string, item: any) {
        return field?.split('.').reduce((a, b) => { 
            return a ? a[b] : '';
            }, item);
    }

    /**
     * Check if a Nested Field exists.
     */
    public static checkNestedField(field: string, item: any) {
        const tokens = field?.split('.');
        let target = item;
        for (let i = 0; i < tokens.length; i++) {
            if (target.hasOwnProperty(tokens[i])) {
                target = target[tokens[i]];
            }
            else {
                return false;
            }
        }
        return true;
    }

    /**
     * Takes in a buffer and examines the bytes to determine the file type.
     * TODO: test with txt
     */
    public static getFileTypeFromBuffer(buffer: Buffer, filename: string): 'pdf' | 'docx' | 'doc' | 'xlsx' | 'xls' | 'txt' | 'csv' | 'unknown' {
        if (buffer.length < 8) return 'unknown';
        
        // Check PDF (starts with %PDF)
        if (buffer[0] === 0x25 && // %
            buffer[1] === 0x50 && // P
            buffer[2] === 0x44 && // D
            buffer[3] === 0x46) { // F
            return 'pdf';
        }
        
        // Check old DOC/XLS (OLE2/CFB format)
        if (buffer[0] === 0xD0 &&
            buffer[1] === 0xCF &&
            buffer[2] === 0x11 &&
            buffer[3] === 0xE0 &&
            buffer[4] === 0xA1 &&
            buffer[5] === 0xB1 &&
            buffer[6] === 0x1A &&
            buffer[7] === 0xE1) {
            // Need to look deeper to distinguish .doc from .xls
            // Check for "WordDocument" stream indicator around offset 512-2048
            const str = buffer.toString('latin1', 0, Math.min(8192, buffer.length));
            if (str.includes('WordDocument')) {
                return 'doc';
            }
            else if (str.includes('Workbook') || str.includes('Book')) {
                return 'xls';
            }
            // Default to doc if we can't determine
            return 'doc';
        }
        
        // Check DOCX/XLSX (ZIP format starting with PK)
        if (buffer[0] === 0x50 && // P
            buffer[1] === 0x4B && // K
            buffer[2] === 0x03 &&
            buffer[3] === 0x04) {
            // Look for distinguishing content in the ZIP
            const str = buffer.toString('latin1', 0, Math.min(2048, buffer.length));
            if (str.includes('word/')) {
                return 'docx';
            }
            else if (str.includes('xl/')) {
                return 'xlsx';
            }
            // Default to docx if we can't determine
            return 'docx';
        }
        
        // Check CSV (heuristic-based)
        // CSV files are plain text, often starting with printable ASCII
        // Check if first 512 bytes are mostly printable with commas/newlines
        const sampleSize = Math.min(512, buffer.length);
        let printableCount = 0;
        let commaCount = 0;
        let newlineCount = 0;
        
        for (let i = 0; i < sampleSize; i++) {
            const byte = buffer[i];
            if ((byte >= 0x20 && byte <= 0x7E) || byte === 0x09 || byte === 0x0A || byte === 0x0D) {
                printableCount++;
            }
            if (byte === 0x2C) commaCount++; // comma
            if (byte === 0x0A) newlineCount++; // newline
        }
        
        // If mostly printable with commas and newlines, likely CSV or TXT
        // TODO: we can update the heuristics. CSV files will generally have a uniform number of commas per line
        const printableRatio = printableCount / sampleSize;
        if (printableRatio > 0.95 && commaCount > 0 && newlineCount > 0) {
            // TXT files could pass the same heuristics. Use filename here as an extra hint.
            if (filename?.endsWith('.txt')) {
                return 'txt';
            }
            else {
                return 'csv';
            }
        }

        if (filename?.endsWith('.txt')) {
            return 'txt';
        }
        
        return 'unknown';
    }

    /**
     * Get printable file tree,
     */
    public static getPrintableFileTree(node:{ path: string; type: string; children: any[]}, depth=0, output=[]): string {
        const indent = '    '.repeat(depth);
        output.push(`${indent}${node.path}`);
        for (let child of node.children) {
            this.getPrintableFileTree(child, depth+1, output);
        }
        return output.join('\n');
    }

    /**
     * Get the size in bytes of string.
     */
    public static getSize(data: string, encoding?) {
        return Buffer.byteLength(data, encoding || 'utf-8')
    }

    public static handleError(route: string, error: any) {
        this.writeToConsole(route, error);
    }

    /**
     * Shallow Check if two arrays are equal.
     * Ignores order. May give unexpected results for arrays of objects.
     */
    public static isArrayEqual(arrA: any[], arrB: any[]) {
        if (arrA === arrB) return true;
        if (arrA == null || arrB == null) return false;
        if (arrA.length !== arrB.length) return false;
        arrA.sort((a, b) => a - b);
        arrB.sort((a, b) => a - b);
        for (var i = 0; i < arrA.length; ++i) {
            if (arrA[i] !== arrB[i]) return false;
        }
        return true;
    }

    /**
     * Is object Form-data
     * TODO: Find better way to check this.
     */
    public static isFormData(object): boolean {
        try {
            return typeof object?.append === 'function'
        } catch (error) {
            return false;
        }
    }

    /**
     * Check to see if the obj is a valid json. 
     */
    public static isValidJson (obj) {
        try {
            if (obj) {
                if (typeof obj ===  "object") {
                    return true;
                }
                else {
                    var result = JSON.parse(obj);
                    if (result && typeof result === "object") {
                        return true;
                    }
                }
            }
        }
        catch (e) {
        }    
        return false;
    }

    /**
     * Create a key safe string.
     * Removes special characters from string. Used in process metadata.
     */
    public static keySafe(value: string): string {
        if (value && typeof value === 'string') {
            return value.replace(/[^a-zA-Z0-9]/g, '');
        }
        else {
            return '';
        }
    }

    /**
     * Merge two arrays of objects and de-duplicate based on property value.
     */
    public static mergeArrays(first: any[], second: any[], key: string) {
        let result = first;
        let keys = first.map(item => item[key]);
        for (let item of second) {
            if (!keys.includes(item[key])) {
                result.push(item);
            }
        }
        return result;
    }

    /**
     * Recursively Replace Template variables.
     * Iterates through target object keys looking for values wrapped in {}. Then searches
     * source object for matching key. Replaces template value ({...}) with source value.
     */
    public static replaceTemplateVariables(target:any, source: any) {
        let result = {}
        if (typeof target === 'object') {
            if (Array.isArray(target)) { result = []; }
            for (let key of Object.keys(target)) {
                if (Tools.isValidJson(target[key])) {
                    if (typeof target[key] === 'string') {
                        target[key] = JSON.parse(target[key]);
                    }
                    result[key] = this.replaceTemplateVariables(target[key], source);
                }
                else if (typeof target[key] === 'string'){
                    const templateVars = target[key].match(new RegExp(/\{(.*?)\}/gm));
                    result[key] = target[key];
                    if (templateVars) {
                        for (let templateVar of templateVars) {
                            const templateKey = templateVar.replace("{", "").replace("}", "");
                            const templateValue = Tools.getNestedValue(templateKey, source)
                            if (templateValue) {
                                result[key] = result[key].replace(templateVar, templateValue);
                            }
                            else {
                                result[key] = result[key];
                            }
                        }
                    }
                }
                else {
                    result[key] = target[key];
                }
            }
        }
        else {
            return target;
        }
        return result
    }

    /**
     * Set a nested value in an object.
     */
    public static setNestedValue(field, item, value) {
        const targetFields = field.split('.');
        let dynamicTarget = item;
        for (let [index, targetField] of targetFields.entries()) {
            if (index >= targetFields.length - 1) {
                dynamicTarget[targetField] = value;
            }
            else {
                if (!dynamicTarget[targetField]) {
                    dynamicTarget[targetField] = {};
                }
                dynamicTarget = dynamicTarget[targetField];
            }
        }
    }

    /**
     * Transform an array of JSON objects to another structure using a key value map where the key is
     * a field in the original source object, and the value is the destination field. Nested fields
     * can be indicated using a '.' to seperate fields.
     */
    public static transformObjects(items:any, fieldMap:any) {
        let items_ = [];
        for (let item of items) {
            const obj = {};
            for (let sourceKey of Object.keys(fieldMap)) {
            let value = sourceKey.split('.').reduce((a, b) => {
                return a ? Array.isArray(a) ? a.map(a_ => a_[b]) : a[b] : '';
            }, item);

            let destinationKey = fieldMap[sourceKey];
            let destinationFields = destinationKey.split('.');
            console.log(destinationKey)
            let target = obj;
            for (let i = 0; i < destinationFields.length; i++) {
                if (i === destinationFields.length - 1) {
                target[destinationFields[i]] = value;
                }
                else {
                if (!target[destinationFields[i]]) {
                    target[destinationFields[i]] = {};
                }
                target = target[destinationFields[i]];
                }
            }
            }
            items_.push(obj);
        }
        return items_;
    }

    /**
     * Generate a secure random float between 0 and 1.
     */
    public static randomFloat() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const randomNumber = array[0] / (0xFFFFFFFF + 1);
        return randomNumber;
    }


    /**
     * Verify that the hostname is allowed to be called.
     */
    public static verifyHostname(hostname: string): boolean {
        const integrationConfig = global.config.get('integrations');
        const blacklist: string[] = integrationConfig?.blacklist || [];
        const whitelist: string[] = integrationConfig?.whitelist || [];
    

        const RE = RegExp;

        const blacklistRegEx = new RE(blacklist.join("|"));
        const whitelistRegEx = new RE(whitelist.join("|"));


        if (blacklist?.length > 0) {
            if (blacklistRegEx.test(hostname)) {
                return false;
            }
        }


        if (whitelist?.length > 0) {
            if (whitelistRegEx.test(hostname)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }

    /**
     * Write the specified message to the console using a standard structure.
     * All messages are dated and properly formatted.
     */
    public static writeToConsole (message: any, data?: any)
    {
        if (data) {
            console.log(this.getCurrentDateTime(), ': ' + message, data);
            return;
        }
        console.log(this.getCurrentDateTime(), ': ' + message);
    }

    // PRIVATE METHODS    


}