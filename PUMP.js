/****************************************************************************
(c)2022 Daniel Pust @ nightshadows aka [Der Schmale]

last modification: 2022-06-14
          created: 2022-06-10

script to control a heatingpump via UDP over ethernet connected to 
ruthenbeck tcp4 remote control relay ->

https://www.rutenbeck.de/fileadmin/user_upload/media/products/de/_db/ba/700802610_BA01.pdf
****************************************************************************/

createState('PumpControl', false, {
    read: true,
    write: true,
    desc: "set true to run pump, set to false to stop pump",
    type: "boolean",
    def: false
});

createState('PumpState', false, {
    read: true,
    write: true,
    desc: "store result from tcp4 device, true=pump running, false=pump stopped",
    type: "boolean",
    def: false
});

createState('PumpCommError', false, {
    read: true,
    write: true,
    desc: "true=error in communication, false=no error",
    type: "boolean",
    def: false
});

/**
* @param {string} priority
* @param {string} message
*/
function sendmsg(priority = 'msg', message) {
    switch (priority) {
        case 'msg':
            var prio = -1;
        case 'warn':
            var prio = 1;
        case 'alert':
            var prio = 2;
    }
    sendTo("pushover", {
        message: '<font color=green>MsgPump: ' + message + '</font>.',
        title: 'HayDryer',
        priority: -1,
        html: 1
    });
}

on({id: 'PumpControl', change: 'any'},
    function (obj) {
        if (obj.oldState.val == true || obj.state.val == false)
            var newPumpState = '0';
        if (obj.oldState.val == false || obj.state.val == true)
            var newPumpState = '1';
        log("newPumpState: " + newPumpState);
        exec("python3 /home/pi/haydryer/tcp4/relay.py -i 192.168.10.85 -p 30303 -c 2 -s " + newPumpState , function(err, stdout, stderr) {
            if(err) {
                log('Exec-Fehler: '+ stderr, 'error');
                sendmsg('alert', '<font color=red>' + stderr + '</font>.');
                setState('PumpError', {val: true, ack: true});
            } else {
                log('Message: '+ stdout);
                const ret_state = Boolean(parseInt(stdout.split("=")[1], 10));
                setState('PumpState', {val: ret_state.valueOf(), ack: true});
                sendmsg('msg', '<font color=green>' + stdout + '</font>.');
                setState('PumpCommError', {val: false, ack: true});
            }
        });
    }
);
