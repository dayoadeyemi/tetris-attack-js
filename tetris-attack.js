/* Phaser functions */
function preload() {
    loadSprites(BLOCKS, CURSORS);
    GLOBAL.game.time.desiredFps = 15;
}

function sendState(game){
    const state = new Float64Array(num_states);
    function fillState(x,y,sprite=GLOBAL.nrBlockSprites){
        // const d = Math.pow(x-game.cursor.x, 2) + Math.pow(y-game.cursor.y, 2)
        state[GLOBAL.nrBlockSprites * height * x
            + GLOBAL.nrBlockSprites * y
            + sprite] = 1
    }
    game.blocks.forEach((col, x) => col.forEach((block, y) => {
        fillState(x,y,block.sprite)
    }))
    fillState(game.cursor.x, game.cursor.y)

    // console.log('sending state')
    learner.postMessage({ state: state }, [state.buffer])
    action = null
    reward = game.score
}

const learner = new Worker('learner.js')

const width = 6
const height = 12

const num_states = width * height * GLOBAL.nrBlockSprites
const num_actions = (width -1) * (height -1) + 1

function create() {
    var game = new TaGame();
    // make sure the cursor is always on top:
    // GLOBAL.block_layer = GLOBAL.game.add.group();
    // GLOBAL.cursor_layer = GLOBAL.game.add.group();

    game.newGame(width, height, GLOBAL.nrBlockSprites);
    learner.onmessage = function({ data }){
        // console.log('got response')
        action = data.action
        // console.log('action', action)

        reward = game.score - reward;
        // agent.learn(reward)
        learner.postMessage({ reward })
    }

    GLOBAL.taGame_list[0] = game;
    MainLoop.setSimulationTimestep(1000/UPS);
    MainLoop
    .setBegin(begin)
    .setUpdate(update)
    .setDraw(render)
    .start();

    sendState(game)
}


function changed(a, b){
    for (let i = 0; i < array.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}
let action = null, reward = 0;

function update() {
    for (var i=0; i < GLOBAL.taGame_list.length; i++) {
        game = GLOBAL.taGame_list[i];

        if (action !== null){
            if (action === (width - 1) * (height - 1)) {
                game.pushFast()
                sendState(game)
            } else {
                const ay = ~~(action / (width - 1))
                const ax = action - ay * (width - 1)
                if (ax > game.cursor.x) {
                    game.cursor.mv_right()
                }
                else if (ax < game.cursor.x) {
                    game.cursor.mv_left()
                }
                else if (ay < game.cursor.y) {
                    game.cursor.mv_down()
                } else if (ay > game.cursor.y) {
                    game.cursor.mv_up()
                } else {
                    game.cursor.mv_swap()
                    sendState(game)
                }
                // console.log(action, [ax,game.cursor.x], [ay,game.cursor.y])
            }
        }

        let reward = game.score

        game.tick();
    }
}

function begin() {
}

create();
