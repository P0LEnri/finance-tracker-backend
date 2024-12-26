import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AccountController } from '../controllers/accounts.controller';
import { authMiddleware } from '../middleware/auth';
import { AccountType } from '../entities/Account';
import { AuthRequest } from '../middleware/auth';

type RequestHandler = (
  req: AuthRequest,
  res: Response
) => Promise<void> | void;

const router = Router();
const accountController = new AccountController();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Middleware para validar resultados
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validaciones para crear cuenta
const createAccountValidations = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la cuenta es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  
  body('type')
    .isIn(Object.values(AccountType))
    .withMessage('Tipo de cuenta inválido'),
  
  body('initialBalance')
    .optional()
    .isNumeric()
    .withMessage('El balance inicial debe ser un número')
    .isFloat({ min: 0 })
    .withMessage('El balance inicial no puede ser negativo'),
  
  body('creditLimit')
    .if(body('type').equals(AccountType.CREDIT))
    .notEmpty()
    .withMessage('El límite de crédito es requerido para tarjetas de crédito')
    .isNumeric()
    .withMessage('El límite de crédito debe ser un número')
    .isFloat({ min: 0 })
    .withMessage('El límite de crédito debe ser mayor a 0'),
  
  body('paymentDay')
    .if(body('type').equals(AccountType.CREDIT))
    .notEmpty()
    .withMessage('El día de pago es requerido para tarjetas de crédito')
    .isInt({ min: 1, max: 31 })
    .withMessage('El día de pago debe ser un número entre 1 y 31'),
  
  body('cutoffDay')
    .if(body('type').equals(AccountType.CREDIT))
    .notEmpty()
    .withMessage('El día de corte es requerido para tarjetas de crédito')
    .isInt({ min: 1, max: 31 })
    .withMessage('El día de corte debe ser un número entre 1 y 31')
    .custom((value, { req }) => {
      if (value === req.body.paymentDay) {
        throw new Error('El día de corte no puede ser igual al día de pago');
      }
      return true;
    })
];

// Validaciones para actualizar cuenta
const updateAccountValidations = [
  param('id')
    .isUUID()
    .withMessage('ID de cuenta inválido'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  
  body('creditLimit')
    .optional()
    .isNumeric()
    .withMessage('El límite de crédito debe ser un número')
    .isFloat({ min: 0 })
    .withMessage('El límite de crédito debe ser mayor a 0'),
  
  body('paymentDay')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('El día de pago debe ser un número entre 1 y 31'),
  
  body('cutoffDay')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('El día de corte debe ser un número entre 1 y 31'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para historial de balance
const balanceHistoryValidations = [
  param('id')
    .isUUID()
    .withMessage('ID de cuenta inválido'),
  
  query('startDate')
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  
  query('endDate')
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((value, { req }) => {
      if (!req?.query?.startDate) {
        throw new Error('Fecha de inicio es requerida');
      }
      const startDate = new Date(req.query.startDate.toString());
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('La fecha final debe ser posterior a la fecha inicial');
      }
      return true;
    })
];

// Rutas de cuentas
// Actualiza todas las rutas así:
router.post('/', 
  createAccountValidations,
  validateRequest,
  ((req: AuthRequest, res: Response) => accountController.createAccount(req, res)) as RequestHandler
);

router.get('/',
  ((req: AuthRequest, res: Response) => accountController.getAccounts(req, res)) as RequestHandler
);

router.get('/:id',
  param('id').isUUID().withMessage('ID de cuenta inválido'),
  validateRequest,
  ((req: AuthRequest, res: Response) => accountController.getAccount(req, res)) as RequestHandler
);

router.put('/:id',
  updateAccountValidations,
  validateRequest,
  ((req: AuthRequest, res: Response) => accountController.updateAccount(req, res)) as RequestHandler
);

router.delete('/:id',
  param('id').isUUID().withMessage('ID de cuenta inválido'),
  validateRequest,
  ((req: AuthRequest, res: Response) => accountController.deleteAccount(req, res)) as RequestHandler
);

router.get('/:id/balance-history',
  balanceHistoryValidations,
  validateRequest,
  ((req: AuthRequest, res: Response) => accountController.getBalanceHistory(req, res)) as RequestHandler
);

export default router;