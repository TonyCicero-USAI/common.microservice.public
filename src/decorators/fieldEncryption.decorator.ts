import { schema } from '@src/server.js';

// tslint:disable: ban-types
export function Encrypt(encryptionType?: 'random' | 'deterministic'): Function {
    return function encryptField(target: any, key: string | symbol) {

        const encryptTypes = {
            random: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
            deterministic: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
        };

        const reflectMeta = Reflect.getMetadata('design:type', target, key);
        const newSchema = {
            target: target.constructor.name.toLowerCase(),
            key,
            type: reflectMeta.name.toLowerCase(),
            algorithm: encryptTypes[encryptionType] || 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
        };
        schema.push(newSchema);
        console.log(`\n${
            `┌${'─'.repeat(newSchema.target.length + 2)}┬${'─'.repeat(`${newSchema.key.toString()}`.length + 2)}┬${'─'.repeat(newSchema.type.length + 2)}┬${'─'.repeat(newSchema.algorithm.length + 2)}┐\n` +
            `│ \x1b[36m${newSchema.target}\x1b[0m │ \x1b[36m${newSchema.key.toString()}\x1b[0m │ ${newSchema.type} │ ${newSchema.algorithm} │\n` +
            `└${'─'.repeat(newSchema.target.length + 2)}┴${'─'.repeat(`${newSchema.key.toString()}`.length + 2)}┴${'─'.repeat(newSchema.type.length + 2)}┴${'─'.repeat(newSchema.algorithm.length + 2)}┘`
          }`);
    };
}
