const fs = require('fs');
var http = require('http');
const cv = require('opencv4nodejs');
const mjpegServer = require('mjpeg-server');
const util = require('./helpers');

const PORT = process.env.PORT || 8081;
const DEVICE = process.env.DEVICE || 0;

// open capture from webcam
const wCap = new cv.VideoCapture(DEVICE);


http.createServer(function (req, res) {
    let mjpegReqHandler = mjpegServer.createReqHandler(req, res);

    // Return video stream
    if (/stream/.test(req.url)) {
        for (let i = 0; i < 500; i++) {
            wCap.readAsync((err, frameBGR) => {
                let lowRange = new cv.Vec(10, 0, 0); // BGR
                let highRange = new cv.Vec(255, 0, 0);
                frameBGR = frameBGR.inRange(lowRange, highRange); //.blur(new cv.Size(3, 3));
                let blueHist = cv.calcHist(frameBGR, util.getHistAxis(0));
                let arr = blueHist.getDataAsArray().map(el => el[0]);
                let trigg = arr[2];
                // TODO: Figure out a good trigger value here (compare with a "normal" photo without a bus...)
                //console.log(trigg);
                let jpgBuf = cv.imencode('.JPEG', frameBGR);
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
