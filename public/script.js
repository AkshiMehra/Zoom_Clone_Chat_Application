const socket = io('/')
console.log("Loaded");

const videoGrid = document.getElementById('video-grid');
console.log(videoGrid);
const myVideo = document.createElement('video');
myVideo.muted = true;

const myPeer = new Peer(undefined, {
    path : '/peerjs',
    host : 'localhost',
    port : '443'
});

myPeer.on('open', id => {
    console.log("New Peer Joined: ", id);
    socket.emit('join-room', ROOM_ID, id);
});

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        console.log("Called");
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        setTimeout(()=>{
            connectToNewUser(userId, stream);
        }, 1000)
    })
})



const connectToNewUser = (userId, stream) => {
    console.log("New User Joined: ", userId);
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
}

const addVideoStream = (video, stream) =>{
    console.log(stream);
    video.srcObject = stream
   
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    console.log(video);
    console.log(videoGrid);
    videoGrid.append(video)
    console.log(videoGrid);
}

let text = $('input')
$('html').keydown((e) => {
    console.log(text);
    if(e.which == 13 && text.val().length !== 0){
        console.log(text.val());
        socket.emit('message', text.val());
        text.val('');
    }  
})

socket.on('createMessage', (message) =>{
    let msg = `<li class = "message">${message}</b></br></li>`
    $('ul').append(msg)
})

const scrollToBotton = () => {
    var screen = $('.main__chat_window');
    screen.scrollTop(screen.prop("scrollHeight"));
}

//Mute Our Video
const muteUnmute = () =>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class = "fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML= html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fa fa-microphone-slash" aria-hidden="true"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML= html;
}

const CamUncam = () =>{
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setUncamButton();
    }else{
        setCamButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setCamButton = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML= html;
}

const setUncamButton = () => {
    const html = `
        <i class="stopvideo fas fa-video-slash"></i>
        <span>Start Video</span>
    `
    document.querySelector('.main__video_button').innerHTML= html;
}

let screen_shared = false;
const StartStopSharing = () => {
    console.log(screen_shared);
    var displayMediaOptions = {
        video : {
            cursor : "always",
        },
        audio : false,
    };
    if(screen_shared){
        stopStream(displayMediaOptions);
    }else{
        startStream(displayMediaOptions);
    }
    screen_shared = !screen_shared;
}

const stopStream = (dispatchEvent) => {
    let tracks = myVideo.srcObject.getTracks();
    tracks.forEach(element => {
            element.stop();
    });
    addVideoStream(myVideo, myVideoStream);
}

async function startStream(displayMediaOptions){
    try{

        let mystream
        mystream = await navigator.mediaDevices.getDisplayMedia(
            displayMediaOptions
        );

        addVideoStream(myVideo, mystream);
    }catch(error){
        console.log(error);
    }
}
