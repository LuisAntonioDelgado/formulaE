
var config = {
    timer: 65, // tiempo en segundos del timer del juego
    counter: 5, // tiempo en segundos del contador en retroceso
    factor: {
        porcent: 0.5, // factor de incremento porcentual por cada pisada
        minutes: 1, // factor de puntos ganados por cada 25% alcanzado
        speed: 0.1,
        reduce: 0.3  // originalmente tenia valor: 0.15
    },
    drop: 20,
    distanceLogs: 200,
    numberLogs: 50,
    awaitResult: 4, // tiempo de espera en segundos antes de pasar de la pantalla de resultados individuales a la pantalla de acumulado grupal
    awaitGroup: 5, // tiempo de espera en segundos antes de pasar de la pantalla de acumulado grupal a la pantalla de espera inicial
    phidget: {
        inputs:{
            total: 16, // numero de digital inputs disponibles en el phidget
            j1: [2,3], // inputs en los que se conectaron los sensores del jugador 1
            jumpJ1: 3,
            j2: [6,7], // inputs en los que se conectaron los sensores del jugador 2
            jumpJ2: 6,
        },
        outputs: {
            total: 16, // numero de digital outputs disponibles en el phidget
            j1: [8,9,10,11], // outputs en los que se conectaron las tiras led del jugador 1
            j2: [12,13,14,15] // outputs en los que se conectaron las tiras led del jugador 2
        }
    }
};