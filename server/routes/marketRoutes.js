// filepath: c:\Users\HKC\Downloads\clic_dom-main\clic_dom-main\server\routes\marketRoutes.js
const express = require('express');
const router = express.Router();

// 示例路由
router.get('/', (req, res) => {
  res.send('Market routes placeholder');
});

module.exports = router;