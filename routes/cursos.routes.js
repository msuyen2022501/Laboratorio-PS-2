const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos, validarRolTeacher } = require('../middlewares/validar-campos');
const { existeCursoByNombre } = require('../helpers/db-validators');

const { cursosPost, cursosGet, cursosPut, cursosDelete } = require('../controllers/cursos.controller');

const router = Router();

router.get("/", cursosGet);

router.put(
    "/:id",
    [
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("nombre").custom(existeCursoByNombre),
        check("maestro", "Debes escribir tu correo, no tu usuario").isEmail(),
        validarCampos,
        validarRolTeacher
    ], cursosPut);

router.delete(
    "/:id",
    [
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        validarCampos,
        validarRolTeacher
    ], cursosDelete);

router.post(
    "/",
    [
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("nombre").custom(existeCursoByNombre),
        check("maestro", "Debes escribir tu correo, no tu usuario").isEmail(),
        validarCampos
    ], cursosPost);

module.exports = router;
