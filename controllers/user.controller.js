const { response, json } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');

const usuariosGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        usuarios
    });
}

const getUsuarioByid = async (req, res) => {
    const { id } = req.params;
    const usuario = await Usuario.findOne({ _id: id });

    res.status(200).json({
        usuario
    });
}

const usuariosPut = async (req, res) => {
    const { id } = req.params;
    const { _id, password, correo, ...resto } = req.body;

    await Usuario.findByIdAndUpdate(id, resto);

    const usuario = await Usuario.findOne({ _id: id });

    res.status(200).json({
        msg: 'Usuario Actualizado exitosamente',
        usuario
    })
}

const usuariosDelete = async (req, res) => {
    const { id } = req.params;
    await Usuario.findByIdAndUpdate(id, { estado: false });

    const usuario = await Usuario.findOne({ _id: id });

    res.status(200).json({
        msg: 'Usuario eliminado exitosamente',
        usuario
    });
}

const usuariosPost = async (req, res) => {
    const { nombre, correo, password, role } = req.body;
    const usuario = new Usuario({ nombre, correo, password, role });

    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();
    res.status(200).json({
        usuario
    });
}

const usuarioLogin = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(400).json({ msg: 'Las credenciales proporcionadas no son válidas' });
        }

        const passwordValido = bcryptjs.compareSync(password, usuario.password);

        if (!passwordValido) {
            return res.status(400).json({ msg: 'Las credenciales proporcionadas no son válidas' });
        }

        const token = jwt.sign({
            uid: usuario._id,
            nombre: usuario.nombre
        }, process.env.SECRET_KEY);

        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.' });
    }
};

module.exports = {
    usuariosDelete,
    usuariosPost,
    usuariosGet,
    getUsuarioByid,
    usuariosPut,
    usuarioLogin
}