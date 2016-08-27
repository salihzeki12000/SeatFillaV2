{"changed":true,"filter":false,"title":"SupportTicket.js","tooltip":"/api/models/SupportTicket.js","value":"/**\n * SupportTicket.js\n *\n */\n\nmodule.exports = {\n\n  attributes: {\n    \n    //Creating a new support ticket\n    \n    \n    //The message for the support ticket\n    message:{\n      type:'string',\n      notNull:true,\n      required:true\n    }\n    \n    \n    //(The user the support ticket belongs to) One to many relationship with user\n    user:{\n      model:'user',\n      notNull:true,\n      required:true\n    }\n    \n    //Created at and updated at are automatically attributes of the model.\n    \n    \n  }\n};\n\n","undoManager":{"mark":-281,"position":100,"stack":[[{"start":{"row":19,"column":25},"end":{"row":19,"column":26},"action":"insert","lines":["n"],"id":281}],[{"start":{"row":19,"column":26},"end":{"row":19,"column":27},"action":"insert","lines":["S"],"id":282}],[{"start":{"row":19,"column":26},"end":{"row":19,"column":27},"action":"remove","lines":["S"],"id":283}],[{"start":{"row":19,"column":26},"end":{"row":19,"column":27},"action":"insert","lines":["s"],"id":284}],[{"start":{"row":19,"column":27},"end":{"row":19,"column":28},"action":"insert","lines":["h"],"id":285}],[{"start":{"row":19,"column":28},"end":{"row":19,"column":29},"action":"insert","lines":["i"],"id":286}],[{"start":{"row":19,"column":29},"end":{"row":19,"column":30},"action":"insert","lines":["p"],"id":287}],[{"start":{"row":19,"column":30},"end":{"row":19,"column":31},"action":"insert","lines":[" "],"id":288}],[{"start":{"row":19,"column":31},"end":{"row":19,"column":32},"action":"insert","lines":["w"],"id":289}],[{"start":{"row":19,"column":32},"end":{"row":19,"column":33},"action":"insert","lines":["i"],"id":290}],[{"start":{"row":19,"column":33},"end":{"row":19,"column":34},"action":"insert","lines":["t"],"id":291}],[{"start":{"row":19,"column":34},"end":{"row":19,"column":35},"action":"insert","lines":["h"],"id":292}],[{"start":{"row":19,"column":35},"end":{"row":19,"column":36},"action":"insert","lines":[" "],"id":293}],[{"start":{"row":19,"column":36},"end":{"row":19,"column":37},"action":"insert","lines":["u"],"id":294}],[{"start":{"row":19,"column":37},"end":{"row":19,"column":38},"action":"insert","lines":["s"],"id":295}],[{"start":{"row":19,"column":38},"end":{"row":19,"column":39},"action":"insert","lines":["e"],"id":296}],[{"start":{"row":19,"column":39},"end":{"row":19,"column":40},"action":"insert","lines":["r"],"id":297}],[{"start":{"row":10,"column":4},"end":{"row":11,"column":0},"action":"insert","lines":["",""],"id":298},{"start":{"row":11,"column":0},"end":{"row":11,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":12,"column":4},"end":{"row":12,"column":5},"action":"insert","lines":["/"],"id":299}],[{"start":{"row":12,"column":5},"end":{"row":12,"column":6},"action":"insert","lines":["/"],"id":300}],[{"start":{"row":12,"column":6},"end":{"row":12,"column":7},"action":"insert","lines":["T"],"id":301}],[{"start":{"row":12,"column":7},"end":{"row":12,"column":8},"action":"insert","lines":["h"],"id":302}],[{"start":{"row":12,"column":8},"end":{"row":12,"column":9},"action":"insert","lines":["e"],"id":303}],[{"start":{"row":12,"column":9},"end":{"row":12,"column":10},"action":"insert","lines":[" "],"id":304}],[{"start":{"row":12,"column":10},"end":{"row":12,"column":11},"action":"insert","lines":["m"],"id":305}],[{"start":{"row":12,"column":11},"end":{"row":12,"column":12},"action":"insert","lines":["e"],"id":306}],[{"start":{"row":12,"column":12},"end":{"row":12,"column":13},"action":"insert","lines":["s"],"id":307}],[{"start":{"row":12,"column":13},"end":{"row":12,"column":14},"action":"insert","lines":["s"],"id":308}],[{"start":{"row":12,"column":14},"end":{"row":12,"column":15},"action":"insert","lines":["a"],"id":309}],[{"start":{"row":12,"column":15},"end":{"row":12,"column":16},"action":"insert","lines":["g"],"id":310}],[{"start":{"row":12,"column":16},"end":{"row":12,"column":17},"action":"insert","lines":["e"],"id":311}],[{"start":{"row":12,"column":17},"end":{"row":12,"column":18},"action":"insert","lines":[" "],"id":312}],[{"start":{"row":12,"column":18},"end":{"row":12,"column":19},"action":"insert","lines":["f"],"id":313}],[{"start":{"row":12,"column":19},"end":{"row":12,"column":20},"action":"insert","lines":["o"],"id":314}],[{"start":{"row":12,"column":20},"end":{"row":12,"column":21},"action":"insert","lines":["r"],"id":315}],[{"start":{"row":12,"column":21},"end":{"row":12,"column":22},"action":"insert","lines":[" "],"id":316}],[{"start":{"row":12,"column":22},"end":{"row":12,"column":23},"action":"insert","lines":["t"],"id":317}],[{"start":{"row":12,"column":23},"end":{"row":12,"column":24},"action":"insert","lines":["h"],"id":318}],[{"start":{"row":12,"column":24},"end":{"row":12,"column":25},"action":"insert","lines":["e"],"id":319}],[{"start":{"row":12,"column":25},"end":{"row":12,"column":26},"action":"insert","lines":[" "],"id":320}],[{"start":{"row":12,"column":26},"end":{"row":12,"column":27},"action":"insert","lines":["s"],"id":321}],[{"start":{"row":12,"column":27},"end":{"row":12,"column":28},"action":"insert","lines":["u"],"id":322}],[{"start":{"row":12,"column":28},"end":{"row":12,"column":29},"action":"insert","lines":["p"],"id":323}],[{"start":{"row":12,"column":29},"end":{"row":12,"column":30},"action":"insert","lines":["p"],"id":324}],[{"start":{"row":12,"column":30},"end":{"row":12,"column":31},"action":"insert","lines":["r"],"id":325}],[{"start":{"row":12,"column":31},"end":{"row":12,"column":32},"action":"insert","lines":["t"],"id":326}],[{"start":{"row":12,"column":32},"end":{"row":12,"column":33},"action":"insert","lines":[" "],"id":327}],[{"start":{"row":12,"column":32},"end":{"row":12,"column":33},"action":"remove","lines":[" "],"id":328}],[{"start":{"row":12,"column":31},"end":{"row":12,"column":32},"action":"remove","lines":["t"],"id":329}],[{"start":{"row":12,"column":30},"end":{"row":12,"column":31},"action":"remove","lines":["r"],"id":330}],[{"start":{"row":12,"column":30},"end":{"row":12,"column":31},"action":"insert","lines":["o"],"id":331}],[{"start":{"row":12,"column":31},"end":{"row":12,"column":32},"action":"insert","lines":["r"],"id":332}],[{"start":{"row":12,"column":32},"end":{"row":12,"column":33},"action":"insert","lines":["t"],"id":333}],[{"start":{"row":12,"column":33},"end":{"row":12,"column":34},"action":"insert","lines":[" "],"id":334}],[{"start":{"row":12,"column":34},"end":{"row":12,"column":35},"action":"insert","lines":["t"],"id":335}],[{"start":{"row":12,"column":35},"end":{"row":12,"column":36},"action":"insert","lines":["i"],"id":336}],[{"start":{"row":12,"column":36},"end":{"row":12,"column":37},"action":"insert","lines":["c"],"id":337}],[{"start":{"row":12,"column":37},"end":{"row":12,"column":38},"action":"insert","lines":["k"],"id":338}],[{"start":{"row":12,"column":38},"end":{"row":12,"column":39},"action":"insert","lines":["e"],"id":339}],[{"start":{"row":12,"column":39},"end":{"row":12,"column":40},"action":"insert","lines":["t"],"id":340}],[{"start":{"row":20,"column":6},"end":{"row":20,"column":7},"action":"insert","lines":["("],"id":341}],[{"start":{"row":20,"column":7},"end":{"row":20,"column":8},"action":"insert","lines":["T"],"id":342}],[{"start":{"row":20,"column":8},"end":{"row":20,"column":9},"action":"insert","lines":["h"],"id":343}],[{"start":{"row":20,"column":9},"end":{"row":20,"column":10},"action":"insert","lines":["e"],"id":344}],[{"start":{"row":20,"column":10},"end":{"row":20,"column":11},"action":"insert","lines":[" "],"id":345}],[{"start":{"row":20,"column":11},"end":{"row":20,"column":12},"action":"insert","lines":["u"],"id":346}],[{"start":{"row":20,"column":12},"end":{"row":20,"column":13},"action":"insert","lines":["s"],"id":347}],[{"start":{"row":20,"column":13},"end":{"row":20,"column":14},"action":"insert","lines":["e"],"id":348}],[{"start":{"row":20,"column":14},"end":{"row":20,"column":15},"action":"insert","lines":["r"],"id":349}],[{"start":{"row":20,"column":15},"end":{"row":20,"column":16},"action":"insert","lines":[" "],"id":350}],[{"start":{"row":20,"column":16},"end":{"row":20,"column":17},"action":"insert","lines":["t"],"id":351}],[{"start":{"row":20,"column":17},"end":{"row":20,"column":18},"action":"insert","lines":["h"],"id":352}],[{"start":{"row":20,"column":18},"end":{"row":20,"column":19},"action":"insert","lines":["e"],"id":353}],[{"start":{"row":20,"column":19},"end":{"row":20,"column":20},"action":"insert","lines":[" "],"id":354}],[{"start":{"row":20,"column":20},"end":{"row":20,"column":21},"action":"insert","lines":["s"],"id":355}],[{"start":{"row":20,"column":21},"end":{"row":20,"column":22},"action":"insert","lines":["u"],"id":356}],[{"start":{"row":20,"column":22},"end":{"row":20,"column":23},"action":"insert","lines":["p"],"id":357}],[{"start":{"row":20,"column":23},"end":{"row":20,"column":24},"action":"insert","lines":["p"],"id":358}],[{"start":{"row":20,"column":24},"end":{"row":20,"column":25},"action":"insert","lines":["o"],"id":359}],[{"start":{"row":20,"column":25},"end":{"row":20,"column":26},"action":"insert","lines":["r"],"id":360}],[{"start":{"row":20,"column":26},"end":{"row":20,"column":27},"action":"insert","lines":["t"],"id":361}],[{"start":{"row":20,"column":27},"end":{"row":20,"column":28},"action":"insert","lines":[" "],"id":362}],[{"start":{"row":20,"column":28},"end":{"row":20,"column":29},"action":"insert","lines":["t"],"id":363}],[{"start":{"row":20,"column":29},"end":{"row":20,"column":30},"action":"insert","lines":["i"],"id":364}],[{"start":{"row":20,"column":30},"end":{"row":20,"column":31},"action":"insert","lines":["c"],"id":365}],[{"start":{"row":20,"column":31},"end":{"row":20,"column":32},"action":"insert","lines":["k"],"id":366}],[{"start":{"row":20,"column":32},"end":{"row":20,"column":33},"action":"insert","lines":["e"],"id":367}],[{"start":{"row":20,"column":33},"end":{"row":20,"column":34},"action":"insert","lines":["t"],"id":368}],[{"start":{"row":20,"column":34},"end":{"row":20,"column":35},"action":"insert","lines":[" "],"id":369}],[{"start":{"row":20,"column":35},"end":{"row":20,"column":36},"action":"insert","lines":["b"],"id":370}],[{"start":{"row":20,"column":36},"end":{"row":20,"column":37},"action":"insert","lines":["e"],"id":371}],[{"start":{"row":20,"column":37},"end":{"row":20,"column":38},"action":"insert","lines":["l"],"id":372}],[{"start":{"row":20,"column":38},"end":{"row":20,"column":39},"action":"insert","lines":["o"],"id":373}],[{"start":{"row":20,"column":39},"end":{"row":20,"column":40},"action":"insert","lines":["n"],"id":374}],[{"start":{"row":20,"column":40},"end":{"row":20,"column":41},"action":"insert","lines":["g"],"id":375}],[{"start":{"row":20,"column":41},"end":{"row":20,"column":42},"action":"insert","lines":["s"],"id":376}],[{"start":{"row":20,"column":42},"end":{"row":20,"column":43},"action":"insert","lines":[" "],"id":377}],[{"start":{"row":20,"column":43},"end":{"row":20,"column":44},"action":"insert","lines":["t"],"id":378}],[{"start":{"row":20,"column":44},"end":{"row":20,"column":45},"action":"insert","lines":["o"],"id":379}],[{"start":{"row":20,"column":45},"end":{"row":20,"column":46},"action":"insert","lines":[")"],"id":380}],[{"start":{"row":20,"column":46},"end":{"row":20,"column":47},"action":"insert","lines":[" "],"id":381}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":24,"column":19},"end":{"row":24,"column":19},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1472256628000}