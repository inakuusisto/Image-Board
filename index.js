const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const awsS3Url = "https://s3.amazonaws.com/";
const bucketName = 'inasimage';
const functions = require('./models/models.js');


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());

app.use(express.static(__dirname + '/public/'));

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});


app.get('/getHomeImages', function(req, res) {
    return functions.getImages()
        .then(function(data) {
            for (var i=0; i<data.rows.length; i++) {
                data.rows[i].url = awsS3Url + bucketName + '/' + data.rows[i].image;
            }
            res.json({images: data.rows});
        }).catch(function(err) {
            console.log(err);
        });
});


app.get('/image/:imageId', function(req, res) {

    functions.getImage(req.params.imageId).then(function(data) {
        var imageAndComments = {
            imageData: [],
            commentData: []
        };

        for (var i=0; i<data.rows.length; i++) {
            data.rows[i].url = awsS3Url + bucketName + '/' + data.rows[i].image;
            imageAndComments.imageData.push(data.rows[i]);
        }

        functions.getComments(req.params.imageId).then(function(data) {
            // console.log(data);
            for (var i = 0; i < data.rows.length; i++) {
                imageAndComments.commentData.push(data.rows[i]);
            }
            // console.log(imageAndComments);
            res.send(imageAndComments);
        });

    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/comment', function(req, res) {
    // console.log(req.body);
    functions.addComment(req.body).then(function() {
    }).catch(function(err){
        console.log('error message', err);
    });
});


app.post('/upload', uploader.single('file'), function(req, res) {

    if (req.file) {
        functions.sendFile(req.file).then(function() {
            res.json({
                success: true,
                fileName: req.file.filename
            });
            functions.addImgToDb(req.file.filename, req.body);
        }).catch(function(err){
            console.log('error message', err);
        });
    } else {
        res.json({
            success: false
        });
    }
});


app.get('*', function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});


app.listen(process.env.PORT || 8080, function() {console.log('listening on port 8080');});
