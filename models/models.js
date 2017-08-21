const fs = require('fs');
const knox = require('knox');
const spicedPg = require('spiced-pg');
let secrets;

var db = spicedPg(process.env.DATABASE_URL || `postgres:${require('../secrets.json').name}:${require('../secrets.json').pass}@localhost:5432/imageboard`);

if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('../secrets.json'); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'inasimage'
});


function sendFile(file) {
    return new Promise (function(resolve, reject) {

        const s3Request = client.put(file.filename, {
            'Content-Type': file.mimetype,
            'Content-Length': file.size,
            'x-amz-acl': 'public-read'
        });

        const readStream = fs.createReadStream(file.path);
        readStream.pipe(s3Request);

        s3Request.on('response', (s3Response) => {

            if (s3Response.statusCode == 200) {
                // console.log('jee');
                resolve();
            } else {
                // console.log('noouuu!');
                reject();
            }
        });
    });
}


function getImages() {
    return db.query ('SELECT id, image, username, title, description FROM images ORDER BY created_at DESC LIMIT 12');
}


function addImgToDb(fileName, data) {
    return new Promise (function(resolve, reject) {
        db.query ('INSERT INTO images(image, username, title, description) values($1, $2, $3, $4)', [fileName, data.username, data.title, data.description]);

    }).catch(function(err) {
        console.log(err);
    });
}


function getImage(imageId) {
    return db.query ('SELECT image, username, title, description FROM images WHERE id=$1',[imageId]);
}

function getComments(imageId) {
    return db.query ('SELECT * FROM comments WHERE image_id = $1 ORDER BY id DESC',[imageId]);
}


function addComment(data) {
    return db.query ('INSERT INTO comments (image_id, username, comment) VALUES ($1, $2, $3)', [data.image_id, data.username, data.comment]);
}

module.exports.sendFile = sendFile;
module.exports.addImgToDb = addImgToDb;
module.exports.getImages = getImages;
module.exports.getImage = getImage;
module.exports.addComment = addComment;
module.exports.getComments = getComments;
