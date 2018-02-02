importScripts("libs/rl.js")
importScripts("global_constants.js")
importScripts("agent2.js")
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

const agent = new RL.DQNAgent(env, spec);
agent.fromJSON(agentjson)

onmessage = function({ data: { state, reward } }) {
    // console.log(state, reward)
    if (state){
        postMessage({ action: agent.act(state) })
    }
    else if (reward) {
        agent.learn(reward)
    }
}