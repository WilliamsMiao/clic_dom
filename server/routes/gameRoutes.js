// filepath: c:\Users\HKC\Downloads\clic_dom-main\clic_dom-main\server\routes\gameRoutes.js
const express = require('express');
const router = express.Router();

// 示例路由
router.get('/', (req, res) => {
  res.send('Game routes placeholder');
});

module.exports = router;