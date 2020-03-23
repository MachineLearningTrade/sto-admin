const express = require('express');
const router = express.Router();
const tokensinfodata_controller = require('../controller/tokensinfodata.controller');
router.get('/test',tokensinfodata_controller.test);
router.post('/insert',tokensinfodata_controller.insert);
router.post('/getTokensinfo:symbol?',tokensinfodata_controller.getTokensinfo);


module.exports = router;
