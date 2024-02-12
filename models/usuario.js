const { Schema, model} = require('mongoose');

const UsuarioSchema = Schema ({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio']
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    img:{
        type: String
    },
    role:{
        type: String,
        required: true,
        enum: ["STUDENT_ROLE", "TEACHER_ROLE"],
        default: ["STUDENT_ROLE"]
    },
    estado:{
        type: Boolean,
        default: true
    }
});

module.exports = model('Usuario', UsuarioSchema);