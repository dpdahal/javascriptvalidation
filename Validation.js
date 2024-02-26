import mongoose from 'mongoose';
import connection from "./database/connection.js";

class Database {
    async checkExistsOrNot(collection_name, column_name, value) {
        try {
            await connection();
            const tables = await mongoose.connection.db.listCollections({name: collection_name}).toArray();
            let collectionNames = tables.map(table => table.name);
            if (collectionNames.length === 0) {
                throw new Error('Collection not found');
            }
            let collection = collectionNames[0];
            let criteria = {};
            criteria[column_name] = value;
            return await mongoose.connection.db.collection(collection).countDocuments(criteria);


        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
}

class Validation extends Database {
    constructor() {
        super();
        this._errors = {};
    }

    async validation(validationRules, formData) {
        for (let field in validationRules) {
            let rules = validationRules[field].split('|');
            for (let rule of rules) {
                if (rule === 'required' && ((!formData[field] || formData[field] === ''))) {
                    this.setErrors(field, `${field} is required`);
                } else if ((formData[field] && formData[field] !== '')) {
                    if (/min:\d*/.test(rule)) {
                        let minValue = parseInt(rule.match(/\d+/)[0]);
                        if (formData[field].length < minValue) {
                            this.setErrors(field, `${field} at least ${minValue} character`);
                        }
                    } else if (/max:\d*/.test(rule)) {
                        let maxValue = parseInt(rule.match(/\d+/)[0]);
                        if (formData[field].length > maxValue) {
                            this.setErrors(field, `${field} max ${maxValue} character`);
                        }
                    } else if (rule === 'email') {
                        if (!this.validateEmail(formData[field])) {
                            this.setErrors(field, `${field} not validate`);
                        }
                    } else if (/matches:/.test(rule)) {
                        let matchField = rule.replace('matches:', '');
                        if (formData[field] !== formData[matchField]) {
                            this.setErrors(field, `${field} as ${matchField} must match`);
                        }
                    } else if (/mimes:/.test(rule)) {
                        let allowedTypes = rule.replace('mimes:', '').split(',');
                        console.log(allowedTypes);
                        let ext = fileData[field].name.split('.').pop().toLowerCase();
                        console.log(ext);
                        if (!allowedTypes.includes(ext)) {
                            this.setErrors(field, `${field} only supported`);
                        }
                    } else if (/unique:/.test(rule)) {
                        let matchField = rule.replace('unique:', '');
                        let matchFields = matchField.split(',');
                        if (matchFields.length < 2) throw new Error("Unique field requires table name & column");
                        let tableName = matchFields[0];
                        let column = matchFields[1];
                       let total = await this.checkExistsOrNot(tableName, column, formData[field]);
                        if (total >= 1) {
                            this.setErrors(field, `${field} already exists`);
                        }
                    }
                }
            }
        }
    }


    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    setErrors(field, message) {
        this._errors[field] = message;
    }

    getErrors() {
        return this._errors;
    }

    isValid() {
        return Object.keys(this._errors).length === 0;
    }
}

export default Validation;
