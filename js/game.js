var debug = null;
var timerInterval;
// var bndGameRun = false;
let bndLockKey = false;
var bndReset = false;
var bndReset2 = false;
var currentStep = 'standby'
var currentSecond = 0;
var largePista = 20000;
var targetCamera = { x: 0, y: 10, z: -10 };
var positionCamera = { x: 10, y: 20, z: 20 }
var animations = {
    j1: [],
    j2: []
}
let game = {
    j1: {
        lastTimes: [],
        position: 0, 
        speed: 0,
        porcent: 0,
        time: 0,
        pulse: 0,
        scale: 0.8
    },
    j2: {
        lastTimes: [],
        position: 0, 
        speed: 0,
        porcent: 0,
        time: 0,
        pulse: 0,
        scale: 0.8
    }
}

const arrKeys = [65, 83, 75, 76 ]; // a,s,k,l
const sensors = {65: 'j1', 83: 'j1', 75: 'j2', 76: 'j2'};

$(function() {
    $('.counter').text(config.counter);
    $(window).off('keydown').on('keydown', function(e){
        let key = e.keyCode;
        // console.log(key);
        if(arrKeys.includes(key)){
            actionSensor(sensors[key]); 
        }else if(key == 87){ // salto j1
            pressButtonAction('j1');
        }else if(key == 79){ // salto j2
            pressButtonAction('j2');
        }else if(key == 123){ // r:reset
            location.reload();
        }else if(key == 189){ // - : clean local storage
            // localStorage.removeItem('total_adiclub');
            location.reload();
        }
    });
});

/***********************/
/*Ini phidget functions*/
    var p_di = [];
    var p_do = [];
    function initPhidget(){
        var conn = new phidget22.Connection(8989, 'localhost');
        for(i=0;i<config.phidget.inputs.total;i++){
            p_di.push(new phidget22.DigitalInput());
            p_do.push(new phidget22.DigitalOutput());
        }
        for(i=0;i<config.phidget.inputs.total;i++){

            p_di[i].onAttach = di_onAttach;
            p_do[i].onAttach = do_onAttach;

            p_di[i].onError = onError;
            p_do[i].onError = onError;

            p_di[i].onStateChange = di_stateChange;
        }

        conn.connect().then(function() {
            console.log('connected phidget');
            for(i=0;i<config.phidget.inputs.total;i++){
                p_di[i].open().catch(function(err) {console.log('Failed to open Digital Input Channel. Err: ' + err);});
                p_do[i].open().catch(function(err) {console.log('Failed to open Digital Output Channel. Err: ' + err);});
            }

        }).catch(function(err) {
            alert('failed to connect to server:' + err);
        });
        // init();
    }
    function di_onAttach(ch) {
        console.log(ch + ' attached: ' /*+ ch.getState(), 
            ' device:' + p_di[ch.channel].getDeviceClassName(), 
            ' serial:' + p_di[ch.channel].getDeviceSerialNumber(), 
            ' sku:' + p_di[ch.channel].getDeviceSKU(), 
            ' version:' + p_di[ch.channel].getDeviceVersion()*/);
    }
    function do_onAttach(ch) {
        console.log(ch + ' attached: '/* + ch.getState(), 
            ' device:' + p_do[ch.channel].getDeviceClassName(), 
            ' serial:' + p_do[ch.channel].getDeviceSerialNumber(), 
            ' sku:' + p_do[ch.channel].getDeviceSKU(), 
            ' version:' + p_do[ch.channel].getDeviceVersion()*/);
        p_do[ch.channel].setState(false);
    }
    function di_stateChange(state) {
        let ch = this.channel;
        console.log(ch + ': ' + state);
        if(config.phidget.inputs.j1.includes(ch) && state){
            actionSensor('j1');
        }else if(config.phidget.inputs.j2.includes(ch) && state){
            actionSensor('j2');
        }else if(config.phidget.inputs.jumpJ1 ==ch && state){
            pressButtonAction('j1');
        }else if(config.phidget.inputs.jumpJ2 ==ch && state){
            pressButtonAction('j2');
        }
    }
    function onError(arg0, arg1) {
        var d = new Date();
        console.log(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ' --- ' + arg0.toString(16) + ' --- ' + arg1 );
    }

    initPhidget();
/*Fin phidget functions*/
/***********************/


function pressButtonAction(pj){
    if(currentStep == 'standby'){
        // controlScreen('counter');
    }else if(currentStep == 'game'){
        // animations[pj].jump();
        // reduceSpeed(pj, config.factor.reduce);
        
    }
}
function reduceSpeed(pj, rs, force = false){
    game[pj].speed = game[pj].speed > rs || force ? game[pj].speed - rs : 0.0;
    if(game[pj].speed <= 0.1){
        animations[pj].idle();
    }
    updateBar(pj, game[pj].pulse * config.factor.porcent);
}
function incrementSpeed(pj, rs, force = false){
    if(game[pj].speed <= 0){
        game[pj].speed = 0.4
    }else{
        game[pj].speed = game[pj].speed < 1 || force ? game[pj].speed + rs : 1;
        if(game[pj].speed >= 0.8){
            game[pj].scale = 1;
        }else{
            game[pj].scale = 0.6;
        }
    }
    updateBar(pj, game[pj].pulse * config.factor.porcent);
}
function controlScreen(screen){
    currentStep = screen;
    if(screen == 'standby'){
        bndLockKey = false;
        $('.counter').text(config.counter);
        $('.counter').show();
        $('.modal').fadeIn(50, function(){
        });
        // let totalAdiclub = parseInt(localStorage.getItem('total_adiclub') || 0);
        // totalAdiclub += parseInt(totalGroup);
        // localStorage.setItem('total_adiclub', totalAdiclub);
        // $('.acumulated').text(totalAdiclub + ' Min');
        // init();
    }else if(screen == 'counter'){
        bndLockKey = true;
        resetGame();
        $('.wintextJOne').hide();
        $('.wintextJTwo').hide();

        $('.wintextJOne').text("Jugador 1 GANO");
        $('.wintextJTwo').text("Jugador 2 GANO");

        $('.counter').show();
        $('.modal').fadeIn(250, function(){
            runCounter(config.counter);
        });
    }else if(screen == 'game'){
        $('.wintextJOne').hide();
        $('.wintextJTwo').hide();

        $('.wintextJOne').text("Jugador 1 GANO");
        $('.wintextJTwo').text("Jugador 2 GANO");

        $('.counter').hide(250);
        $('.modal').fadeOut(50, function(){
            bndLockKey = false;
            runGame(config.timer);
        });
        // });
    }else if(screen == 'result'){
        bndLockKey = true;
        stopRunners();
        // $('.graphic').fadeOut(250, function(){
        //     $('.result .r1').text(game.j1.minutes + ' Min');
        //     $('.result .r2').text(game.j2.minutes + ' Min');
            // $('.result').fadeIn(250, function(){
                setTimeout(function(){
                    resetGame();
                    $('.wintextJOne').hide();
                    $('.wintextJTwo').hide();
                    
                    $('.wintextJOne').text("Jugador 1 GANO");
                    $('.wintextJTwo').text("Jugador 2 GANO");
                    controlScreen('standby')
                }, config.awaitResult * 1000);
            // });
        // });
    }else if(screen == 'group'){
        bndLockKey = true;
        // $('.game').fadeOut(250, function(){
        //     $('.result').hide();
        //     $('.graphic').show();
        //     totalGroup = parseInt(game.j1.minutes) + parseInt(game.j2.minutes);
        //     $('.acumulated').text(totalGroup + ' Min');
        //     $('.group').fadeIn(250, function(){
        //         // setTimeout(controlScreen, config.awaitGroup * 1000, 'standby');
        //         setTimeout(function(){
        //             let totalAdiclub = parseInt(localStorage.getItem('total_adiclub') || 0);
        //             totalAdiclub += parseInt(totalGroup);
        //             localStorage.setItem('total_adiclub', totalAdiclub);
        //             // $('.acumulated').text(totalAdiclub + ' Min');
        //             location.reload();
        //         }, config.awaitGroup * 1000);
        //     });
        // });
        // for(i=0;i<4;i++){
        //     console.log('output j1: ' + config.phidget.outputs['j1'][i] + ' apagada');
        //     p_do[config.phidget.outputs['j1'][i]].setState(false);
        //     console.log('output j2: ' + config.phidget.outputs['j2'][i] + ' apagada');
        //     p_do[config.phidget.outputs['j2'][i]].setState(false);
        // }
    }
}
function resetGame(){
    game = {
        j1: {
            lastTimes: [],
            position: 0, 
            speed: 0,
            porcent: 0,
            time: 0,
            pulse: 0,
            scale: 0.8
        },
        j2: {
            lastTimes: [],
            position: 0, 
            speed: 0,
            porcent: 0,
            time: 0,
            pulse: 0,
            scale: 0.8
        }
    }
    bndReset = true;
    bndReset2 = true;
    animations.j1.idle();
    animations.j2.idle();
    updateBar('j1', 0);
    updateBar('j2', 0);
}

function actionSensor(pj){
    if(bndLockKey == false){
        // console.log(pj);
        if(currentStep == 'standby'){
            //     bndLockKey = true;
            controlScreen('counter');
        }else if(currentStep == 'counter'){
            //     bndLockKey = true;
        }else if(currentStep == 'game'){
            animations[pj].running();
            incrementSpeed(pj, config.factor.speed);
            game[pj].pulse++;
            game[pj].time = currentSecond;
            game[pj].porcent = (game[pj].pulse * config.factor.porcent);
            if(game[pj].porcent >= 100){
                game[pj].porcent = 100;
                updateBar(pj, 100);
                clearInterval(timerInterval);
                stopRunners();
                setTimeout(controlScreen, 3000, 'result');
            }
            
            // let minutes = parseInt(game[pj].porcent / 25 * config.factor.minutes);
            // if(game[pj].minutes < minutes){
            //     game[pj].minutes = minutes;
            //     let indexCh = parseInt(game[pj].porcent / 25) - 1;
            //     console.log('output: ' + config.phidget.outputs[pj][indexCh] + ' encendida');
            //     p_do[config.phidget.outputs[pj][indexCh]].setState(true);
            // }
        }
    }

}
function stopRunners(){
    winGame();
    game.j1.speed = 0;
    game.j2.speed = 0;
    animations.j1.idle();
    animations.j2.idle();
    bndReset = true;
    bndReset2 = true;
    bndLockKey = true;
}

function winGame(){
    if(game.j1.porcent === game.j2.porcent){
        $('.wintextJOne').text("Empate");
        $('.wintextJTwo').text("Empate");
        $('.wintextJOne').show();
        $('.wintextJTwo').show();
    }
    if(game.j1.porcent > game.j2.porcent){
        $('.wintextJOne').show();
    }else{
        $('.wintextJTwo').show();
    }
}
function runCounter(counter){
    $('.counter').text(counter);
    counterInterval = setInterval(function(){
        if(--counter>=0){
            $('.counter').text(counter);
        }
        if(counter<=0){
            clearInterval(counterInterval);
            controlScreen('game');
        }
    }, 1000);
}

function runGame(seconds){
    showTimer(seconds);
    timerInterval = setInterval(function(){
        if(--seconds>=0){
            showTimer(seconds);
            // console.log('Reduccion:', config.factor.reduce);
            reduceSpeed('j1', config.factor.reduce);
            reduceSpeed('j2', config.factor.reduce);
        }
        if(seconds <= 0){
            clearInterval(timerInterval);
            stopRunners();
            controlScreen('result')
            // updateBar(pj, 0);
        }
    }, 1000);
}

function showTimer(seconds){
    currentSecond = seconds;
    let timer = getMinutes(seconds);
    $('.timer').text(timer.minutes + ':' + (timer.seconds <= 9 ? '0' : '') + timer.seconds);
}

function getMinutes(seconds){
    seconds = parseInt(seconds);
    let days = parseInt(seconds / 86400);
    seconds = parseInt(seconds % 86400);
    let hours = parseInt(seconds / 3600);
    seconds = parseInt(seconds % 3600);
    let minutes = parseInt(seconds / 60);
    seconds = parseInt(seconds % 60);
    let objTime = {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    // console.log(objTime);
    return objTime;
}
function updateBar(pj, porcent){
    porcent = parseInt(porcent * 10) / 10;
    porcent = porcent < 0 ? 0 : porcent;
    $('.graphic .' + pj + ' .bar').css('height', porcent + '%');
    $('.' + pj + ' .text').text(porcent + '%');
    // apagamos todas las barras del jugador

    let max = parseInt(Math.round(porcent) / 25);

    for (var i = 0; i < max; i++) {
        p_do[config.phidget.outputs[pj][i]].setState(true);
    }

    for (var i = max; i < config.phidget.outputs[pj].length; i++) {
        p_do[config.phidget.outputs[pj][i]].setState(false);
    }

}