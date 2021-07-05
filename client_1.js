const io = require('socket.io-client');
const lib_math = require('./lib/lib_math')

let ahead = 'S'
let user_from = 1
let user_to = 200
let sleep_result = 50
let sleep_connect_before = 10
let sleep_connect_after = 10
let total_done = 0
let unlimited = false
let socket_url = 'http://game.tranthanh92.com'
// let socket_url = 'ws://game.tranthanh92.com'
// let socket_url = 'ws://139.180.219.169'
// let socket_url = 'ws://localhost:8081'

// var subscribeSentAt = 0;

// let sockets = []

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// function sleep(milliseconds) {
//     const date = Date.now();
//     let currentDate = null;
//     do {
//       currentDate = Date.now();
//     } while (currentDate - date < milliseconds);
// }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

(async () => {
    try {
        for (let i = user_from; i < user_to; i++ ) {
            let item_socket = io(socket_url);
            item_socket.on('login_user_id_return', async (output) => {
                console.log(output)
                if (output.user) {
                    if (output.user.room_trans) {

                        let item_send = {
                            room_id: output.user.room_id,
                            room_trans: output.user.room_trans,
                            user_id: output.user.user_id,
                            choose: getRandomInt(1,3)
                        }
                        console.log(`login_user_id_return ${item_send.user_id} ${item_send.room_trans} ${item_send.choose}`)
                       
                        await sleep(sleep_result)
                        item_socket.emit('send_choose', item_send);
                    } else {
                        // Login lại chơi ván mới
                        // item.socket.emit('login_user_id', { user_id : item.user_id });
                    }
                }
            })
            item_socket.on('send_choose_return', async (output) => {
                if (output.status && output.room_trans) {

                    // Step này check null thì không làm gì nữa
                    if (output.room_id) {
                        let item_send = {
                            room_id: output.room_id,
                            room_trans: output.room_trans,
                            user_id: output.user_id,
                            choose: getRandomInt(1,3)
                        }
                        console.log(`send_choose_return ${item_send.user_id} ${item_send.room_trans} ${item_send.choose}`)
                        await sleep(sleep_result)
                        item_socket.emit('send_choose', item_send);
                    } else {
                        // Login lại chơi ván mới
                        // item.socket.emit('login_user_id', { user_id : output.user_id });
                    }
                } else {
                    total_done += 1
                    console.log(`Trả lời xong ${total_done}`)

                    if (unlimited && output.user_id) {
                        console.log(`Start tiếp ván mới ${output.user_id}`)
                        item_socket.emit('login_user_id', { user_id : output.user_id });
                    }
                }
            })
            // sockets.push({
            //     socket: item_socket,
            //     user_id: `${ahead}${lib_math.zeroFill(i,4)}`
            // })

            await sleep(sleep_connect_before);
            item_socket.connect();
            await sleep(sleep_connect_after);
            console.log(`WS connect user ${`${ahead}${lib_math.zeroFill(i,4)}`}`);
            item_socket.emit('login_user_id', { user_id : `${ahead}${lib_math.zeroFill(i,4)}` });
        }
        
        // for(let item of sockets) {
        //     await sleep(sleep_connect_before);
        //     item.socket.connect();
        //     await sleep(sleep_connect_after);
        //     console.log(`WS connect user ${item.user_id}`);
        //     item.socket.emit('login_user_id', { user_id : item.user_id });
        // }
    } catch (e) {
        console.log(e)
    }
})();