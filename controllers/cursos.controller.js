const { response, json } = require('express');
const Curso = require('../models/curso');
const Usuario = require('../models/usuario');
const usuarioCurso = require('../models/usuarioCurso');

const cursosGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, cursos] = await Promise.all([
        Curso.countDocuments(query),
        Curso.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        cursos
    });
}

const cursosPut = async (req, res) => {
    const { id } = req.params;
    const { _id, ...resto } = req.body;

    const curso = await Curso.findByIdAndUpdate(id, resto);

    res.status(200).json({
        msg: 'Curso actualizado'
    })
}

const cursosDelete = async (req, res) => {
    const { id } = req.params;
    const curso = await Curso.findByIdAndUpdate(id, { estado: false });

    await usuarioCurso.updateMany({ curso: id }, { estado: false });

    res.status(200).json({
        msg_1: 'Curso eliminado:',
        msg_2: curso.nombre
    });
}

const cursosPost = async (req, res) => {
    const { nombre, categoria, maestro } = req.body;

    const Maestro = await Usuario.findOne({ correo: maestro });
    if (!Maestro) {
        res.status(400).json({
            msg: 'El maestro asignado no existe'
        });
        return;
    }

    if (Maestro.role !== "TEACHER_ROLE") {
        return res.status(400).json({
            msg: 'Un estudiante no puede crear cursos'
        });
    }

    const cursoExistente = await Curso.findOne({ nombre, estado: false });

    if (cursoExistente) {
        cursoExistente.estado = true; 
        await cursoExistente.save();
        
        res.status(200).json({
            msg: 'Curso reactivado',
            curso: cursoExistente
        });
    } else {
        const cursoNuevo = new Curso({ nombre, categoria, maestro });
        await cursoNuevo.save();

        res.status(200).json({
            msg: 'Curso creado',
            curso: cursoNuevo
        });
    }
}


module.exports = {
    cursosDelete,
    cursosPost,
    cursosGet,
    cursosPut
}