const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { existeCursoById, noExistenteEmail} = require('../helpers/db-validators');

const { usuarioCursoPost, usuarioCursoGet, getUsuarioCursoByid, usuarioCursoDelete } = require('../controllers/usuarioCurso.controller');

const router = Router();

router.get("/", usuarioCursoGet);

router.get(
    "/buscar",
    [
        check("correo").custom(noExistenteEmail),
        validarCampos
    ], getUsuarioCursoByid);

router.delete(
        "/:id",
        [
            check("id","El id no es un formato válido de MongoDB").isMongoId(),
            check("id").custom(existeCursoById),
            validarCampos
        ], usuarioCursoDelete);

        
router.post(
    "/", 
    [
        check("correo","El estudiante es obligatorio").not().isEmpty(),
        check("materia","El curso es obligatorio").not().isEmpty(),
        validarCampos,
    ], usuarioCursoPost); 

module.exports = router;