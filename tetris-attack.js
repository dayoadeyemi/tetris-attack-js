/* Phaser functions */
function preload() {
    loadSprites(BLOCKS, CURSORS);
    GLOBAL.game.time.desiredFps = 15;
}

const width = 6
const height = 12

const num_states = width * height * GLOBAL.nrBlockSprites
const num_actions = (width -1) * (height -1) + 1

var env = {};
env.getNumStates = function() { return num_states; }
env.getMaxNumActions = function() { return num_actions; }

// create the DQN agent
var spec = {}
spec.update = 'qlearn'; // qlearn | sarsa
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.005; // value function learning rate
spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
spec.experience_size = 10000; // size of experience
spec.learning_steps_per_iteration = 5;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 100 // number of neurons in hidden layer

agent = new RL.DQNAgent(env, spec);

function create() {
    var game = new TaGame();
    // make sure the cursor is always on top:
    // GLOBAL.block_layer = GLOBAL.game.add.group();
    // GLOBAL.cursor_layer = GLOBAL.game.add.group();

    game.newGame(width, height, GLOBAL.nrBlockSprites);
    console.log(game);


    GLOBAL.taGame_list[0] = game;
    MainLoop.setSimulationTimestep(1000/UPS);
    MainLoop
    .setBegin(begin)
    .setUpdate(update)
    .setDraw(render)
    .start();
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

        // fillState(game.cursor.x, game.cursor.y)
        let reward = game.score

        if (action === null) {
            const state = new Float64Array(num_states).fill(0);
            function fillState(x,y,sprite=GLOBAL.nrBlockSprites){
                // const d = Math.pow(x-game.cursor.x, 2) + Math.pow(y-game.cursor.y, 2)
                state[GLOBAL.nrBlockSprites * height * x
                    + GLOBAL.nrBlockSprites * y
                    + sprite] = 1
            }
            game.blocks.forEach((col, x) => col.forEach((block, y) => {
                fillState(x,y,block.sprite)
            }))
            action = agent.act(state)
            reward = game.score
        }

        if (action === (width - 1) * (height - 1)) {
            game.pushFast()
            action = null
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
                action = null
            }
            // console.log(action, [ax,game.cursor.x], [ay,game.cursor.y])
        }

        game.tick();
        // if (reward !== 0) console.log(reward)
        if (reward < 0) {
            console.log(-reward)
            agent.expi=0
            agent.exp=[]
        }
        if (action === null) {
            reward = game.score - reward;
            agent.learn(reward)
        }
    }
}

function begin() {
}

create();
