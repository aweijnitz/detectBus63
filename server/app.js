const fs = require('fs');
var http = require('http');
const cv = require('opencv4nodejs');
const mjpegServer = require('mjpeg-server');

const PORT = process.env.PORT || 8081;
const DEVICE = process.env.DEVICE || 0;

// open capture from webcam
const wCap = new cv.VideoCapture(DEVICE);


http.createServer(function (req, res) {
    let mjpegReqHandler = mjpegServer.createReqHandler(req, res);

    // Return video stream
    if (/stream/.test(req.url)) {
        for (let i = 0; i < 500; i++) {
            wCap.readAsync((err, frame) => {
                frame = frame.bgrToGray();
                let jpgBuf = cv.imencode('.JPEG', frame);
                mjpegReqHandler.write(jpgBuf);
            });
        }

    } else if (/frame/.test(req.url)) {
        // A request to http://localhost/frame returns a single frame as a jpeg

        //res.writeHead(200, {'Content-Type': 'image/jpeg'});
        //res.end(camera.frame);
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(fs.readFileSync('./client/index.html'));
    }

}).listen(PORT);
