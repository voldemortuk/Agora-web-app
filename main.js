/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err) {
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer = document.getElementById("remote-container");

var channelName = localStorage.getItem("channelname");

document.getElementById('disconnect_call').onclick = () => {
    disconnectCall();
}

function disconnectCall() {
    client.leave();
    if (client.leave) {
        window.location.href = './new_login.html'
    }
}

var isMuted = false;
document.getElementById('mute_mic').onclick = () => {
    toggleMic();
}

function toggleMic() {
    if (isMuted) {
        isMuted = false;
        globalstream.enableAudio();
    } else {
        isMuted = true;
        globalstream.muteAudio();
    }
}

var isCameraOn = true;
document.getElementById('disable_camera').onclick = () => {
    toggleCamera();
}

function toggleCamera() {
    if (isCameraOn) {
        isCameraOn = false;
        globalstream.muteVideo();
    } else {
        isCameraOn = true;
        globalstream.enableVideo();
    }
}

/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream(evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById('remote-container');
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream removed ");
}

// Start code
//Creating client
let client = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
});

var stream = AgoraRTC.createStream({
    streamID: 0,
    audio: true,
    video: true,
    screen: false
});

//Initializing client
client.init("960f6550ea4b4e458ee91d8822a4ab9b", function() {
    console.log("Initialized successfully!");
});

//Joining the client
client.join(null, channelName, null, function(uid) {

    let localstream = AgoraRTC.createStream({
        streamID: uid,
        audio: false,
        video: true,
        screen: false
    });

    globalstream = localstream;

    //Publishing the stream.
    localstream.init(function() {
        localstream.play('me');
        client.publish(localstream, handleFail);

        client.on('stream-added', (evt) => {
            client.subscribe(evt.stream, handleFail);
        });

        client.on('stream-subscribed', (evt) => {
            let stream = evt.stream;
            // addVideoStream(stream.getId());
            stream.play('remote-container');
        });
        client.on('stream-removed', removeVideoStream);
    }, handleFail);

}, handleFail);