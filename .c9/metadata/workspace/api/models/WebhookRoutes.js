{"changed":true,"filter":false,"title":"WebhookRoutes.js","tooltip":"/api/models/WebhookRoutes.js","value":"\n\nconst uuid = require('node-uuid');\n\nmodule.exports = {\n    autoPK:false,\n    attributes:{\n        id:{\n            type:'string',\n            primaryKey:true,\n            defaultsTo: function(){ return uuid.v4(); }\n        },\n        //e.g FlightOffer/create\n        route:{\n            type:'String',\n            required:true,\n            notNull:true\n        }\n        \n        webhook:{\n            model:'webhook',\n            notNull:true,\n            required:true\n        }\n\n    }\n}","undoManager":{"mark":-2,"position":66,"stack":[[{"start":{"row":18,"column":9},"end":{"row":19,"column":0},"action":"insert","lines":["",""],"id":2},{"start":{"row":19,"column":0},"end":{"row":19,"column":8},"action":"insert","lines":["        "]}],[{"start":{"row":19,"column":8},"end":{"row":20,"column":0},"action":"insert","lines":["",""],"id":3},{"start":{"row":20,"column":0},"end":{"row":20,"column":8},"action":"insert","lines":["        "]}],[{"start":{"row":20,"column":8},"end":{"row":20,"column":9},"action":"insert","lines":["w"],"id":4}],[{"start":{"row":20,"column":9},"end":{"row":20,"column":10},"action":"insert","lines":["e"],"id":5}],[{"start":{"row":20,"column":10},"end":{"row":20,"column":11},"action":"insert","lines":["b"],"id":6}],[{"start":{"row":20,"column":11},"end":{"row":20,"column":12},"action":"insert","lines":["h"],"id":7}],[{"start":{"row":20,"column":12},"end":{"row":20,"column":13},"action":"insert","lines":["o"],"id":8}],[{"start":{"row":20,"column":13},"end":{"row":20,"column":14},"action":"insert","lines":["o"],"id":9}],[{"start":{"row":20,"column":14},"end":{"row":20,"column":15},"action":"insert","lines":["k"],"id":10}],[{"start":{"row":20,"column":14},"end":{"row":20,"column":15},"action":"remove","lines":["k"],"id":11}],[{"start":{"row":20,"column":13},"end":{"row":20,"column":14},"action":"remove","lines":["o"],"id":12}],[{"start":{"row":20,"column":12},"end":{"row":20,"column":13},"action":"remove","lines":["o"],"id":13}],[{"start":{"row":20,"column":12},"end":{"row":20,"column":13},"action":"insert","lines":["o"],"id":14}],[{"start":{"row":20,"column":13},"end":{"row":20,"column":14},"action":"insert","lines":["o"],"id":15}],[{"start":{"row":20,"column":14},"end":{"row":20,"column":15},"action":"insert","lines":["k"],"id":16}],[{"start":{"row":20,"column":15},"end":{"row":20,"column":16},"action":"insert","lines":[":"],"id":17}],[{"start":{"row":20,"column":16},"end":{"row":20,"column":17},"action":"insert","lines":["{"],"id":18}],[{"start":{"row":20,"column":17},"end":{"row":22,"column":9},"action":"insert","lines":["","            ","        }"],"id":19}],[{"start":{"row":21,"column":12},"end":{"row":21,"column":13},"action":"insert","lines":["m"],"id":20}],[{"start":{"row":21,"column":13},"end":{"row":21,"column":14},"action":"insert","lines":["o"],"id":21}],[{"start":{"row":21,"column":14},"end":{"row":21,"column":15},"action":"insert","lines":["d"],"id":22}],[{"start":{"row":21,"column":15},"end":{"row":21,"column":16},"action":"insert","lines":["e"],"id":23}],[{"start":{"row":21,"column":16},"end":{"row":21,"column":17},"action":"insert","lines":["l"],"id":24}],[{"start":{"row":21,"column":17},"end":{"row":21,"column":18},"action":"insert","lines":[":"],"id":25}],[{"start":{"row":21,"column":18},"end":{"row":21,"column":19},"action":"insert","lines":["w"],"id":26}],[{"start":{"row":21,"column":18},"end":{"row":21,"column":19},"action":"remove","lines":["w"],"id":27}],[{"start":{"row":21,"column":18},"end":{"row":21,"column":20},"action":"insert","lines":["''"],"id":28}],[{"start":{"row":21,"column":19},"end":{"row":21,"column":20},"action":"insert","lines":["w"],"id":29}],[{"start":{"row":21,"column":20},"end":{"row":21,"column":21},"action":"insert","lines":["e"],"id":30}],[{"start":{"row":21,"column":21},"end":{"row":21,"column":22},"action":"insert","lines":["b"],"id":31}],[{"start":{"row":21,"column":22},"end":{"row":21,"column":23},"action":"insert","lines":["h"],"id":32}],[{"start":{"row":21,"column":23},"end":{"row":21,"column":24},"action":"insert","lines":["o"],"id":33}],[{"start":{"row":21,"column":24},"end":{"row":21,"column":25},"action":"insert","lines":["o"],"id":34}],[{"start":{"row":21,"column":25},"end":{"row":21,"column":26},"action":"insert","lines":["k"],"id":35}],[{"start":{"row":21,"column":27},"end":{"row":21,"column":28},"action":"insert","lines":[","],"id":36}],[{"start":{"row":21,"column":28},"end":{"row":22,"column":0},"action":"insert","lines":["",""],"id":37},{"start":{"row":22,"column":0},"end":{"row":22,"column":12},"action":"insert","lines":["            "]}],[{"start":{"row":22,"column":12},"end":{"row":22,"column":13},"action":"insert","lines":["n"],"id":38}],[{"start":{"row":22,"column":13},"end":{"row":22,"column":14},"action":"insert","lines":["o"],"id":39}],[{"start":{"row":22,"column":14},"end":{"row":22,"column":15},"action":"insert","lines":["t"],"id":40}],[{"start":{"row":22,"column":15},"end":{"row":22,"column":16},"action":"insert","lines":["N"],"id":41}],[{"start":{"row":22,"column":16},"end":{"row":22,"column":17},"action":"insert","lines":["u"],"id":42}],[{"start":{"row":22,"column":17},"end":{"row":22,"column":18},"action":"insert","lines":["l"],"id":43}],[{"start":{"row":22,"column":18},"end":{"row":22,"column":19},"action":"insert","lines":["l"],"id":44}],[{"start":{"row":22,"column":19},"end":{"row":22,"column":20},"action":"insert","lines":[":"],"id":45}],[{"start":{"row":22,"column":20},"end":{"row":22,"column":21},"action":"insert","lines":["t"],"id":46}],[{"start":{"row":22,"column":21},"end":{"row":22,"column":22},"action":"insert","lines":["r"],"id":47}],[{"start":{"row":22,"column":22},"end":{"row":22,"column":23},"action":"insert","lines":["u"],"id":48}],[{"start":{"row":22,"column":23},"end":{"row":22,"column":24},"action":"insert","lines":["e"],"id":49}],[{"start":{"row":22,"column":24},"end":{"row":22,"column":25},"action":"insert","lines":[","],"id":50}],[{"start":{"row":22,"column":25},"end":{"row":23,"column":0},"action":"insert","lines":["",""],"id":51},{"start":{"row":23,"column":0},"end":{"row":23,"column":12},"action":"insert","lines":["            "]}],[{"start":{"row":23,"column":12},"end":{"row":23,"column":13},"action":"insert","lines":["r"],"id":52}],[{"start":{"row":23,"column":13},"end":{"row":23,"column":14},"action":"insert","lines":["q"],"id":53}],[{"start":{"row":23,"column":13},"end":{"row":23,"column":14},"action":"remove","lines":["q"],"id":54}],[{"start":{"row":23,"column":13},"end":{"row":23,"column":14},"action":"insert","lines":["e"],"id":55}],[{"start":{"row":23,"column":14},"end":{"row":23,"column":15},"action":"insert","lines":["q"],"id":56}],[{"start":{"row":23,"column":15},"end":{"row":23,"column":16},"action":"insert","lines":["u"],"id":57}],[{"start":{"row":23,"column":16},"end":{"row":23,"column":17},"action":"insert","lines":["i"],"id":58}],[{"start":{"row":23,"column":17},"end":{"row":23,"column":18},"action":"insert","lines":["r"],"id":59}],[{"start":{"row":23,"column":18},"end":{"row":23,"column":19},"action":"insert","lines":["e"],"id":60}],[{"start":{"row":23,"column":19},"end":{"row":23,"column":20},"action":"insert","lines":["d"],"id":61}],[{"start":{"row":23,"column":20},"end":{"row":23,"column":21},"action":"insert","lines":[":"],"id":62}],[{"start":{"row":23,"column":21},"end":{"row":23,"column":22},"action":"insert","lines":["t"],"id":63}],[{"start":{"row":23,"column":22},"end":{"row":23,"column":23},"action":"insert","lines":["r"],"id":64}],[{"start":{"row":23,"column":23},"end":{"row":23,"column":24},"action":"insert","lines":["u"],"id":65}],[{"start":{"row":23,"column":24},"end":{"row":23,"column":25},"action":"insert","lines":["e"],"id":66}],[{"start":{"row":13,"column":0},"end":{"row":13,"column":14},"action":"remove","lines":["        //    "],"id":67}],[{"start":{"row":12,"column":32},"end":{"row":13,"column":0},"action":"remove","lines":["",""],"id":68}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":24,"column":0},"end":{"row":24,"column":0},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1472116803000}