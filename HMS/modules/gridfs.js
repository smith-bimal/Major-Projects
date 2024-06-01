const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');

// Create mongoose connection
const conn = mongoose.createConnection('mongodb://localhost:27017/mydb');

// Initialize GridFS stream
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine using multer-gridfs-storage
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/hms_database',
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads'
        };
    }
});

module.exports = { gfs, storage };
