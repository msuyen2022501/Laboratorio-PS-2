const { Schema, model } = require('mongoose');

const RoleSchema = Schema({
    role: {
        type: String
    }
});

module.exports = model('Role', RoleSchema);