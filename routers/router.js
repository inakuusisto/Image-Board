// const express = require('express');
// const router = express.Router();
// const spicedPg = require('spiced-pg');
// var multer = require('multer');
// var uidSafe = require('uid-safe');
// var path = require('path');
//
// var db = spicedPg('postgres:postgres:postgres@localhost:5432/cities');
//
//
// var diskStorage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, __dirname + '/uploads');
//     },
//     filename: function (req, file, callback) {
//         uidSafe(24).then(function(uid) {
//             callback(null, uid + path.extname(file.originalname));
//         });
//     }
// });
//
// var uploader = multer({
//     storage: diskStorage,
//     limits: {
//         filesize: 2097152
//     }
// });
//
//
// router.get('/imageboard', function(req, res) {
//     res.render('main', {
//         layout: 'layout'
//     });
// });
//
//
// router.post('/upload', uploader.single(), function(req, res) {
//     // If nothing went wrong the file is already in the uploads directory
//     if (req.file) {
//         res.json({
//             success: true
//         });
//     } else {
//         res.json({
//             success: false
//         });
//     }
// });
//
//
// module.exports = router;
