class Validation {
    constructor() {
        this._errors = {};
    }

    validation(validationRules) {
        for (let field in validationRules) {
            let rules = validationRules[field].split('|');
            rules.forEach(rule => {
                if (rule === 'required' && ((!formData[field] || formData[field] === '') || (fileData[field] && this.imageEmpty(field)))) {
                    this.setErrors(field, `${field} is required`);
                } else if ((formData[field] && formData[field] !== '') || (fileData[field] && !this.imageEmpty(field))) {
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
                        let ext = fileData[field].name.split('.').pop().toLowerCase();
                        if (!allowedTypes.includes(ext)) {
                            this.setErrors(field, `${field} only supported`);
                        }
                    }else if (/unique:/.test(rule)) {
                        let matchField = rule.replace('unique:', '');
                        let matchFields = matchField.split(',');
                        if (matchFields.length < 2) throw new Error("Unique field required table name & column");
                        let tableName = matchFields[0];
                        let columns = matchFields[1];
                        let criteriaColumnValue;
                        console.log(matchFields);
                        // if (matchFields.length === 3) {
                        //     criteriaColumnValue = matchFields[2].split(':');
                        //     let query = `SELECT ${columns} FROM ${tableName} WHERE ${columns}='${formData[field]}' AND ${criteriaColumnValue[0]}!='${criteriaColumnValue[1]}'`;
                        //     let result = this._db.customQuery(query);
                        //     if (result) {
                        //         this.setErrors(field, `${field} must be unique`);
                        //     }
                        // } else {
                        //     let result = this._db.selectByCriteria(tableName, '', columns, [formData[field]]);
                        //     if (result) {
                        //         this.setErrors(field, `${field} must be unique`);
                        //     }
                        // }
                    }
                }

            });
        }
    }

    imageEmpty(field) {
        return !fileData[field];
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

// Example usage:
const formData = {
    username: 'a',
    email: 'ram@gmail.com',
    password: 'password123',
    confirm_password: 'password12'
};

const fileData = {
    avatar: {
        name: 'example.jpg',
        error: 0
    }
};

const validationRules = {
    username: 'required|min:5|max:20',
    email: 'required|email|unique:users,email',
    password: 'required|min:8',
    confirm_password: 'required|matches:password',
    avatar: 'mimes:jpg,png,gif'
};

const validator = new Validation();
validator.validation(validationRules);
console.log(validator.isValid() ? 'Data is valid' : 'Data is not valid');
console.log(validator.getErrors());


