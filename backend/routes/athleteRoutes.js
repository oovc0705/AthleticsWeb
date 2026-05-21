const express = require('express');
const router = express.Router();
const athleteController = require('../controllers/athleteController');
const { athleteValidationRules, validate } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// 运动员路由
router.get('/', athleteController.getAllAthletes);
router.get('/country/:country', athleteController.getAthletesByCountry);
router.get('/sport/:sport', athleteController.getAthletesBySport);
router.get('/top/gold-medalists', athleteController.getTopGoldMedalists);
router.get('/:id', athleteController.getAthleteById);
router.get('/:id/stats', athleteController.getAthleteStats);
router.get('/:id/achievements', athleteController.getAthleteAchievements);
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, athleteValidationRules(), validate, athleteController.createAthlete);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, athleteValidationRules(), validate, athleteController.updateAthlete);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, athleteController.deleteAthlete);

module.exports = router;