import * as THREE from 'three'

import { FBXLoader } from './modules/FBXLoader.js'

import { OrbitControls } from './modules/OrbitControls.js'
import { DragControls } from './modules/DragControls.js'
import { TransformControls } from './modules/TransformControls.js'

import Stats from './modules/stats.module.js'

import { GUI } from './modules/lil-gui.module.min.js'

//
const pj = 'j2';
let namePj = 'Ch_male2'
var bndJump = false;
var logsPositions = [];
var logIni = 0;
//creamos escena
const scene = new THREE.Scene()
scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );
//agregamos a la escena los ejes auxiliares
// scene.add(new THREE.AxesHelper(5))

//definimos y agregamos una luz puntual a la escena
const light = new THREE.DirectionalLight( 0xffffff, 2.25 );
light.position.set( 200, 450, 500 );

light.castShadow = true;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 512;

light.shadow.camera.near = 100;
light.shadow.camera.far = 1200;

light.shadow.camera.left = - 1000;
light.shadow.camera.right = 1000;
light.shadow.camera.top = 350;
light.shadow.camera.bottom = - 350;

scene.add( light );

//definimos y agregamos una luz ambiental a la escena
const ambientLight = new THREE.AmbientLight(0x222222)
scene.add(ambientLight)

// let widthDiv = window.innerWidth
let widthDiv = document.getElementById(pj).clientWidth
// console.log(widthDiv)
//creamos camara en perspectiva
const camera = new THREE.PerspectiveCamera(
    75,
    widthDiv / window.innerHeight,
    0.1,
    1000
)
//definimos la posicion de la camara
let targetCamera = { x: 0, y: 10, z: -10 };
let positionCamera = { x: -10, y: 20, z: 20 }
function updateCamera(){
    camera.lookAt(new THREE.Vector3(targetCamera.x, targetCamera.y, targetCamera.z))
    camera.position.set(positionCamera.x, positionCamera.y, positionCamera.z)
}
updateCamera()
//Creamos el objeto three js y lo agregamos al dom
const renderer = new THREE.WebGLRenderer()
renderer.setSize(widthDiv, window.innerHeight)
// document.body.appendChild(renderer.domElement)
document.getElementById(pj).appendChild(renderer.domElement)
// document.body.appendChild(renderer.domElement)

// definimos el loader para las texturas

const textureLoader = new THREE.TextureLoader();

//OBJETO SUELO
let floorMat;
floorMat = new THREE.MeshStandardMaterial( {
    roughness: 0.8,
    color: 0xffffff,
    metalness: 0.2,
    bumpScale: 0.02
} );
textureLoader.load( "./img/textures/cesped3.jpg", function ( map ) {

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 2;
    map.repeat.set( largePista / 50, 20 );
    map.encoding = THREE.sRGBEncoding;
    floorMat.map = map;
    floorMat.needsUpdate = true;

} );

const floorGeometry = new THREE.PlaneGeometry( largePista, 200 );
const floorMesh = new THREE.Mesh( floorGeometry, floorMat );
floorMesh.receiveShadow = true;
floorMesh.rotation.x = - Math.PI / 2.0;
floorMesh.rotation.z = - Math.PI / 2.0;
floorMesh.position.z = ((largePista / 2) * -1) + 20
floorMesh.receiveShadow = true;
scene.add( floorMesh );


//definimos el material del objeto pista
const materialPista = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    // wireframe: true,
    transparent: true,
})
//definimos un objeto geometrico para la pista
// textureLoader.load( "./img/textures/pista.jpg", function ( map ) {
textureLoader.load( "./img/textures/carretera.jpg", function ( map ) {

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 2;
    map.repeat.set( 1, largePista / 50 );
    map.encoding = THREE.sRGBEncoding;
    materialPista.map = map;
    materialPista.needsUpdate = true;

} );
const geometryPista = new THREE.BoxGeometry(25, 0.25, largePista)
//creamos el objeto cubo, a partir del objeto geometrico y el material
const pistaMesh = new THREE.Mesh(geometryPista, materialPista)
pistaMesh.receiveShadow = true;
pistaMesh.position.z = ((largePista / 2) * -1) + 20
//agregamos a la escena el cubo
scene.add(pistaMesh)


//definimos un objeto cilindrico para los troncos

const materialLog = new THREE.MeshBasicMaterial( {color: 0xffff00} );
// textureLoader.load( "./img/textures/tronco1.jpg", function ( map ) {
textureLoader.load( "./img/textures/alert.jpg", function ( map ) {

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 2;
    map.repeat.set( 1, 1 );
    map.encoding = THREE.sRGBEncoding;
    materialLog.map = map;
    materialLog.needsUpdate = true;

} );



function addLogs(number, distance = 100){
    for (var i = 1; i <= number; i++) {
        // const geometryLog = new THREE.CylinderGeometry( 2, 2, 20, 20 );
        const geometryLog = new THREE.BoxGeometry(10, 25, 1)
        const cylinderLog = new THREE.Mesh( geometryLog, materialLog );
        cylinderLog.position.y = 2;
        cylinderLog.position.z -= (i * distance);
        cylinderLog.rotation.z = Math.PI / 2.0;
        logsPositions.push(cylinderLog.position.z);
        scene.add( cylinderLog );  

    }
}
// addLogs(config.numberLogs, config.distanceLogs);


//Definimos y agregamos los controles de objetos a la escena
const controlsOrbit = new OrbitControls(camera, renderer.domElement)
// controlsOrbit.autoRotate = true
controlsOrbit.enableDamping = true
controlsOrbit.target.set(targetCamera.x, targetCamera.y, targetCamera.z)

//definimos y asignamos las texturas para la escena
let escenario = 'parque'
const backGroundTexture = new THREE.CubeTextureLoader().load([
    `img/${escenario}/px.jpg`,
    `img/${escenario}/nx.jpg`,
    `img/${escenario}/py.jpg`,
    `img/${escenario}/ny.jpg`,
    `img/${escenario}/pz.jpg`,
    `img/${escenario}/nz.jpg`,
])
scene.background = backGroundTexture


//definimos el cargador de objetos y agregamos los objetos a la escena
let mixer = null
let modelReady = false
const animationActions = []
let activeAction
let lastAction
let runner
const fbxLoader = new FBXLoader()
/*function onLoopFinished( event ) {
    if ( event.action === animationActions[3] ) {
        // si es un salto
        // animations[pj].running(0.1, 1)
        // console.log(event)
        mixer.removeEventListener( 'loop', onLoopFinished );
    }
}*/
fbxLoader.load(
    `models/characters/${namePj}.fbx`,
    (object) => {
        runner = object
        object.scale.set(0, 0, 0)
        object.rotation.y = Math.PI;
        object.position.z = 5;
        mixer = new THREE.AnimationMixer(object)
        
        const animationAction = mixer.clipAction(
            object.animations[0]
        )
        animationActions.push(animationAction)
        // animationsFolder.add(animations[pj], 'default')
        activeAction = animationActions[0]
        scene.add(object)
        // mixer.addEventListener('loop', onLoopFinished);
        //add an animation from another file
        fbxLoader.load(
            `models/animations/${namePj}/idle.fbx`,
            (object) => {
                console.log('loaded idle')
                object.animations[0].name = 'idle'
                const animationAction = mixer.clipAction(
                    object.animations[0]
                )
                animationActions.push(animationAction)
                // animationsFolder.add(animations[pj], 'idle')

                fbxLoader.load(
                    `models/animations/${namePj}/running.fbx`,
                    (object) => {
                        console.log('loaded running');
                        object.animations[0].name = 'running'
                        //delete the specific track that moves the object forward while running
                        object.animations[0].tracks.shift() 
                        const animationAction = mixer.clipAction(
                            object.animations[0]
                        )
                        animationActions.push(animationAction)
                        // animationsFolder.add(animations[pj], 'running')

                        //add an animation from another file
                        fbxLoader.load(
                            `models/animations/${namePj}/jump.fbx`,
                            (object) => {
                                console.log('loaded jump');
                                object.animations[0].name = 'jump'
                                
                                //delete the specific track that moves the object forward while jump
                                object.animations[0].tracks.shift() 
                                const animationAction = mixer.clipAction(
                                    object.animations[0]
                                )
                                animationActions.push(animationAction)
                                // animationsFolder.add(animations[pj], 'jump')

                                modelReady = true
                                animations[pj].idle()
                            },
                            (xhr) => {
                                // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                            },
                            (error) => {
                                console.log(error)
                            }
                        )
                    },
                    (xhr) => {
                        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    (error) => {
                        console.log(error)
                    }
                )
            },
            (xhr) => {
                // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    },
    (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

animations[pj] = {
    default: function () {
        setAction(animationActions[0], 0.5, 0.5)
    },
    idle: function () {
        setAction(animationActions[1], 0.5, 0.5)
    },
    running: function () {
        setAction(animationActions[2], 0.5, 0.5)
    },
    jump: function () {
        setAction(animationActions[3], 0.5, 0.5)
    },

}

const setAction = (toAction, timeOut, timeIn) => {
    if (toAction != activeAction && !bndJump) {
        // console.log(toAction);
        lastAction = activeAction
        activeAction = toAction

        let clip = activeAction.getClip();
        
        

        activeAction.timeScale = game[pj].scale
        if(clip.name == 'jump'){
            bndJump = true;
            let duration = (clip.duration / game[pj].scale) - timeIn
            // let duration = clip.duration;
            // console.log(duration)

            setTimeout(function(){
                bndJump = false
                if(game[pj].speed) animations[pj].running()

            }, duration * 1000)

            // runner.position.y = 1;
            // setTimeout(function(){
                // runner.position.y = 0;
            // }, (duration * 1000) / 2)
            // return;
        }
        // lastAction.stop()
        lastAction.fadeOut(timeOut)
        changeImage(clip.name);
        // lastAction.reset()
        activeAction.reset()
        activeAction.fadeIn(timeIn)
        activeAction.play()
    }
}

const changeImage = (toAction) =>{
    
    let newImage = document.getElementById("auto2");

    if(toAction === "running"){
        newImage.setAttribute("src", "./img/autos/auto2v.png");
    }else if(toAction === "idle"){
        newImage.setAttribute("src", "./img/autos/auto2.png");
    }else {
        newImage.setAttribute("src", "./img/autos/auto2.png");
    }
}

const clock = new THREE.Clock()


//definimos los eventos
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = widthDiv / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(widthDiv, window.innerHeight)
    render()
}

//panel de estadisticas: fpm, ms, mb
// const stats = Stats()
// document.body.appendChild(stats.dom)

//panel de controles

/*const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()*/


//funcion de animacion
function animate() {
    requestAnimationFrame(animate)
    
    if (modelReady){
        // console.log(bndLockKey, bndJump, bndReset);
        mixer.update(clock.getDelta())
        
        if(game[pj].speed > 0.05 && !bndLockKey){
            game[pj].position = runner.position.z
            forwardRunner();
            // console.log('step1')
        }
        if(bndJump){
            runner.position.y = 5;
            // forwardRunner();
            let clip = activeAction.getClip();
            let duration = clip.duration;
            setTimeout(function(){
                runner.position.y = 0;
            }, (duration * 1000) / 2)
        }
        if(bndReset){
            // console.log('step3')
            bndReset = false;
            runner.position.z = 5;
            targetCamera.z = -10;
            positionCamera.z = 20;
            logIni = 0;
            animations[pj].idle();
            // console.log('step3 finish:', bndReset, runner.position.z, targetCamera.z, positionCamera.z);
        }
        updateCamera()
    }
    render()
    //actualizamos estadisticas
    controlsOrbit.update()
    // stats.update()
}
function checkCollisions(position){
    let ini = position + 1;
    let fin = position - 1;
    for (var i = logIni; i < logsPositions.length; i++) {
        let positionLog = logsPositions[i];
        if(!bndJump && positionLog < ini && positionLog > fin){
            logIni = i + 1;
            // console.log('collision detected', ini, fin, positionLog, game[pj].pulse);
            game[pj].pulse -= config.drop;
        }
    }
}

function forwardRunner(){
    runner.position.z -= game[pj].speed > 0.9 ? game[pj].speed : 0.9;
    targetCamera.z -= game[pj].speed > 0.9 ? game[pj].speed : 0.9;
    positionCamera.z -= game[pj].speed > 0.9 ? game[pj].speed : 0.9;
    checkCollisions(runner.position.z);
}

//funcion de renderizado
function render() {
    renderer.shadowMap.enabled = true;
    // bulbLight.castShadow = params.shadows;
    renderer.render(scene, camera)
}

//comenzamos la animacion
animate()