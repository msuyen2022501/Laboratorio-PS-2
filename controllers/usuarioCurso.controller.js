const { response, json } = require('express');
const usuarioCurso = require('../models/usuarioCurso');
const Usuario = require('../models/usuario');
const Curso1 = require('../models/curso');

const usuarioCursoGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, usuarioCursos] = await Promise.all([
        usuarioCurso.countDocuments(query),
        usuarioCurso.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        usuarioCursos
    });
}

const getUsuarioCursoByid = async (req, res) => {
    const { correo } = req.body;

    try {
        const estudiante = await Usuario.findOne({ correo });

        const cursosInscritos = await usuarioCurso.find({ estudiante: estudiante.id, estado: true }).populate('curso');

        if (cursosInscritos.length === 0) {
            return res.status(400).json({ msg: 'El estudiante no está inscrito en ningún curso' });
        }

        const listaCursos = cursosInscritos.map(curso => ({
            nombre: curso.curso.nombre,
            fecha_inscripcion: curso.fecha_inscripcion
        }));

        res.status(200).json({ 
            cursos: listaCursos 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }

}

const usuarioCursoDelete = async (req, res) => {
    const { id } = req.params;

    try {
        const usuarioCursoEliminado = await usuarioCurso.findOneAndUpdate({ _id: id, estado: true }, { estado: false }).populate('estudiante');

        if (!usuarioCursoEliminado) {
            return res.status(404).json({ msg: 'La inscripción al curso no se encuentra o ya ha sido eliminada' });
        }

        const nombreEstudiante = usuarioCursoEliminado.estudiante.nombre;

        res.status(200).json({ msg: `El estudiante ${nombreEstudiante} ha sido eliminado del curso` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}


const usuarioCursoPost = async (req, res) => {
    const { correo, materia } = req.body;

    try {
        const estudiante = await Usuario.findOne({ correo });
        if (!estudiante) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        const curso = await Curso1.findOne({ nombre: materia });
        if (!curso) {
            return res.status(400).json({ msg: 'El curso que se quiere asignar no existe' });
        }

        const cursoEliminado = await usuarioCurso.findOne({ estudiante: estudiante.id, curso: curso.id, estado: false });
        if (cursoEliminado) {
            return res.status(400).json({ msg: 'El curso ha sido eliminado previamente' });
        }

        const cantidadCursosInscritos = await usuarioCurso.countDocuments({ estudiante: estudiante.id });

        if (cantidadCursosInscritos >= 3) {
            return res.status(400).json({
                msg: 'El estudiante ya está inscrito en el máximo número de cursos permitidos'
            });
        }

        const existeAsignacion = await usuarioCurso.findOne({ estudiante: estudiante.id, curso: curso.id });

        if (existeAsignacion) {
            return res.status(400).json({ msg: 'El estudiante ya está en este curso' });
        }

        const usuarioCursos = new usuarioCurso({
            estudiante: estudiante.id,
            curso: curso.id
        });

        await usuarioCursos.save();

        res.status(200).json({
            estudiante: estudiante.nombre,
            correo_estudiante: correo,
            curso: materia,
            fecha_inscripcion: usuarioCursos.fecha_inscripcion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};

module.exports = {
    usuarioCursoDelete,
    usuarioCursoPost,
    usuarioCursoGet,
    getUsuarioCursoByid
}
