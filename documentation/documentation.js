/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           description: Default value "I am new!"
 *         posts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The auto-generated ID
 *       example:
 *         email: 'test@gmail.com'
 *         password: 123456
 *         name: Denys
 */