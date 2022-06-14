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

on({id: 'PumpControl', change: 'any', val: true, oldVal: false},
    function (obj) {
        // check if file is availiable
   exec("python3 /home/pi/haydryer/tcp4/relay.py -i 192.168.10.85 -p 30303 -c 3 -s 1", function(err, stdout, stderr) {
         if(err) log('Exec-Fehler: '+ stderr, 'error');
         // else check output and set PumpState
         if(stdout) log('Message: '+ stdout);
         setState('PumpState', {val: true, ack: true});
      });
  }
);

on({id: 'PumpControl', change: 'any', val: false, oldVal: true},
    function (obj) {
   exec("python3 /home/pi/haydryer/tcp4/relay.py -i 192.168.10.85 -p 30303 -c 3 -s 0", function(err, stdout, stderr) {
         if(err) log('Exec-Fehler: '+ stderr, 'error');
         // else check output and set PumpState
         if(stdout) log('Message: '+ stdout);
         setState('PumpState', {val: false, ack: true});         
      });
  }
);
