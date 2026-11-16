import typeorm from 'typeorm';
import { Req, Res } from '@tsed/common';

export interface IDatabaseService {

    find(query?: any, req?: Req, res?: Res): Promise<any[]>;
    
    findOne(query: typeorm.ObjectLiteral, options?, req?: Req, res?: Res): Promise<any>;
    
    deleteOne(pkId: string, req?: Req, res?: Res): Promise<any>;
    
    insertMany(documents: typeorm.ObjectLiteral, options?, req?: Req, res?: Res): Promise<any>;
    
    push(query, item, req?: Req, res?: Res): Promise<any>; 
    
    pull(query, criteria, req?: Req, res?: Res): Promise<any>; 
    
    query(query?: any, req?: Req, res?: Res): Promise<any[]>;

    updateOne(query: typeorm.ObjectLiteral, set: typeorm.ObjectLiteral, options?, req?: Req, res?: Res): Promise<any>;

}
