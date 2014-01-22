// configuration file
exports.configFile = __dirname + "/../../config/settings.json";
// configuration variable
exports.config = {};
// database variable
exports.db = {};
// schema variable
exports.Schema = {};
// express app var
exports.app = {};
// current response var
exports.response = {};
// current request var
exports.request = {};
// current next var for init
exports.next;
// load modules var
exports.modules = {};
// load menu var
exports.menus = {};
// load navigations
exports.navs = {};
// load form input var
exports.input = {};

/**
 * Gizmo Core boot variable
 */
exports.boot = function(){

    // load all modules
    this.load('modules');

    // load menus into var
    this.setupMenus();

};

/**
 * Gizmo Core Init hook
 * @param request
 * @param response
 * @param next
 */
exports.init = function(request, response, next){
    // if no config then don't init anything
    if (this.config.length == 0)
        return;

    // load the configuration file
    this.loadConfig(request, response, next);

    // connect database
    this.connectDatabase();

    // setup menus
    this.setupMenus();

    // load data
    this.load('data');

    // set navigation menus for themes
    this.set('MENU','MENU_MAIN');
    this.set('MENU', 'MENU_ADMIN');
    this.set('MENU', 'MENU_NAV');

    // invoke all init hooks
    this.invoke('init');

    // load system configuration from db
    this.load('system');

};

/**
 * Load and initialize configuration data
 * @param request
 * @param response
 * @param next
 */
exports.loadConfig = function(request, response, next){

    // read content from configuration file
    var content = this.utils.fileSys.readFileSync(this.configFile).toString();
    // evaluate content data
    var data = eval('('+content+')');

    // load current http request
    this.request = request;
    // load current http response
    this.response = response;
    // load next callback
    this.next = next;

    // current request url
    this.request.url = this.utils.stripTrailingSlash(this.request.url);

    // initialized config var
    this.config = {
        url : {
            host : request.headers.host,
            path : this.utils.url.parse(request.url).pathname
        }
    };

    // merge initialized config var with config file data
    this.config = this.utils.merge(this.config, data);
};

/**
 * connect with mongodb
 */
exports.connectDatabase = function(){

    // create database connection
    this.db = this.lib.mongoose.createConnection();
    // handle database connection error
    this.db.on('error', console.error.bind(console, 'connection error:'));
    // database open
    this.db.open(this.config.database.server, this.config.database.name, this.config.database.port);

    // check for database connection
    this.db.on('open', function(){
        // log connection status
        GizmoCore.invoke('watchdog','admin','Database connected','CRITICAL');
    });

    // invoke all schema hooks
    this.invoke('schema');
};

/**
 * Gizmo Core template renderer
 * @param view
 * @param data
 */
exports.render = function(view, data){

    // if ajax request then invoke ajax response
    if ( this.modules.ajax.isAjax()){

        // get invoked ajax commands
        var commands = this.modules.ajax.__getCommands();
        // send response in JSON
        this.response.send(JSON.stringify(commands));
        // re-initialized
        this.modules.ajax.__resetCommands();
        // end renderer
        return;
    }

    // load ejs lib
    var ejs = require('ejs');
    // get theme path
    var theme_path = 'themes/'+this.config.theme;

    // merge data file
    data = this.utils.merge(this.config, data);
    // load view content
    data.GizmoContent = view;

    // load alias from nodes for navigation
    GizmoCore.Schema.Node.find({menu_type : {$ne : []}}, function (err, nodes){
        // if not error
        if (!err){
            // load through all nodes with menu types
            for(var i=0; nodes.length > i; i++){
                // current node
                var node = nodes[i];
                // load through node's menu types
                for(var j in node.menu_type){
                    var index = parseInt(j);
                    // @todo: need to revise this logic, need to parse and then save the selected menus types in nodes collection
                    if (index < node.menu_type.length){
                        // set menu in particular menu type
                        GizmoCore.navs[node.menu_type[index]].push({
                            title : node.title,
                            link : (node.alias != '') ? node.alias : 'node/'+node._id,
                            callback : null,
                            access : [],
                            module : 'node',
                            type : node.menu_type[index]
                        });
                    }
                }
            }

            // render the final response
            GizmoCore.response.render(theme_path + '/index', data);
        }
    });
}

/**
 * Load system functionality
 * @param type
 */
exports.load = function(type){

    switch(type){
        // load modules
        case 'modules':
            // read the gizmo/modules dir
            var mods = this.utils.fileSys.readdirSync(__dirname+'/modules');

            // read all files
            for(var i in mods){
                // split them with dots
                var tempModule = mods[i].split('.');
                // module name
                var name = tempModule[0];
                // module type
                var type = tempModule[1];
                // current module file var
                var file = null;
                // if module follow the corrent naming convention
                // then type = 'module'
                if (type == 'module'){
                    // file full path
                    file = GizmoCore.utils.path.join(__dirname, '/modules/'+mods[i]);
                    // load file path
                    this.modules[name] = require(file);
                    // mark module as enabled by default
                    this.modules[name].enabled = true;
                    // set the module file
                    this.modules[name].file = file;
                }
            }
            break;
        // load form input data
        case 'data':
            //if post request then load post data
            if (this.request.method == 'POST' ){
                this.input.post = this.request.body;
            }else {
                this.input.post = {};
            }

            // parse query string
            var url_parts = this.utils.url.parse(this.request.url, true)
            // load get data
            this.input.get = url_parts.query;

            break;
        // load core system (module) functionality
        case 'system':
            // query the system in db
            this.Schema.System.find({ type : 'module' }, function(err, data){
                if(!err){
                    var module_name = null;
                    for(var i in data){
                        // module name
                        module_name = data[i].name;
                        // change status of the module according to db
                        GizmoCore.modules[module_name].enabled = data[i].enabled;

                        // if module !enabled
                        if (!data[i].enabled){
                            // load current module menus
                            var menu = GizmoCore.modules[module_name].menu();
                            for (var link in menu){
                                // check for the routes set for the particular module
                                for(var route in GizmoCore.app.routes.get){
                                    // if module's menu exists
                                    if (link == GizmoCore.app.routes.get[route].path){
                                        // change the callback to page not found
                                        GizmoCore.app.routes.get[route].callbacks = [ function (req, res, next){
                                            res.status(404);
                                            GizmoCore.init(req, res, next);
                                            GizmoCore.render('error', {error : {title : 'Error 404' , message : 'Page not found.'}});
                                        }];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            });
            break;
    }
}

/**
 * Core helper function to invoke hooks from different modules
 * @param hook Hook name
 * @param module Module name (optional)
 * @returns {*}
 */

exports.invoke = function(hook, module){

    // if hook not defined , return
    if (hook == undefined){
        return;
    }

    // delete hook from arguments
    delete arguments[0];

    // if module !defined then delete module from arguments
    if (module != undefined){
        delete arguments[1];
    }

    // index arguments
    arguments = this.utils.reIndex(arguments);

    // if module is asked
    if (module != undefined && module != null && module != ''){
        // if module hook is defined
        if (this.modules[module][hook]!= undefined && this.modules[module].enabled){
            // execute and return the values of the hook
            return this.modules[module][hook].apply(this, arguments);
        }
    }else {
        // save temporary values
        // save return all values
        var returnValues = [], tempValues;
        for(var module in this.modules){
            // set temporary values
            tempValues = [];
            // if hook exists
            if (this.modules[module][hook] != undefined  && this.modules[module].enabled ){
                // get temporary values
                tempValues = this.modules[module][hook].apply(this, arguments);
            }
            // merge return values with the last hook values
            if (tempValues != undefined){
                returnValues = this.utils.merge(returnValues, tempValues);
            }
        }

        // return all values
        return returnValues;
    }
}

/**
 * Gizmo Core utility helpers
 * @type {{stripTrailingSlash: Function, merge: (merge|exports|*), fileSys: (exports|*), url: (exports|*), path: (exports|*), forms: (exports|*), reIndex: Function, bcrypt: (exports|*)}}
 */
exports.utils = {
    // striping trailing slash
    stripTrailingSlash : function (str) {
        if(str.substr(-1) == '/') {
            return str.substr(0, str.length - 1);
        }
        return str;
    },
    // merge module
    merge : require('merge'),
    // file system module
    fileSys : require('fs'),
    // url module
    url : require('url'),
    // path module
    path : require('path'),
    // form module
    forms : require('forms'),
    // reIndex helper
    reIndex : function (array){
        var indexedArray = [];
        var i=0;
        for(var index in array){
            indexedArray[i] = array[index];
            i++;
        }
        return indexedArray;
    },
    // bcrypt-nodejs module
    bcrypt : require ('bcrypt-nodejs')
};

/**
 * External libraries used
 * @type {{mongoose: (exports|*)}}
 */
exports.lib = {
    // mogoose library for mongo db
    mongoose : require('mongoose')
}

exports.get = function (type, args) {
    switch (type) {
        case 'MENU':
            break;
    }
}


/**
 * Set menu for navigation
 * @param type
 * @param args
 */
exports.set = function (type, args){
    type = type.toUpperCase();
    switch (type) {
        case 'MENU':
            this.__navigation(args);
            break;
    }
}

/**
 * setup navigation categories
 * @param value
 * @private
 */
exports.__navigation = function (value){

    value = value.toUpperCase();

    var nav = [];
    for (var i in this.menus){
        if (this.menus[i].type == value){
            nav.push(this.menus[i]);
        }
    }

    this.navs[value] = nav;
}

/**
 * Preprocess HTML hook
 */
exports.preprocessHTML = function(){

}

/**
 * Get all menus from all the available modules
 */
exports.setupMenus = function(){

    // menu parameters
    var menus = tempMenus = [], callback = null;

    // 404 handler
    this.app.use(function (req, res, next){
        GizmoCore.init(req, res, next);
        var alias = req.url.substring(1);
        GizmoCore.invoke('_loadView', 'node', null, alias);
    });

    // setup home page
    this.home();

    // Get all modules
    for(var name in this.modules){
        // if menu function exist
        if (this.modules[name].menu != undefined){
            // save menus temporarily
            tempMenus = this.modules[name].menu();

            // set all menus with module names
            for(var link in tempMenus){
                menus[link]= tempMenus[link];
                menus[link].module = name;
                menus[link].link = link;
            }
        }
    }

    // set routes for each menu
    for(var link in menus){
        // module name
        name = menus[link].module;
        // menu callback function
        callback = menus[link].callback;
        // set application get URLs
        this.app.get(link, function (req, res, next){
            GizmoCore.init(req, res, next);
            next();
        }, function (req, res, next){
            var route = GizmoCore.menus[req.route.path];

            GizmoCore.invoke('setTitle', 'theme', route.title);

            if (route.theme != undefined && route.theme != ''){
                GizmoCore.invoke('setTheme', 'theme', route.theme);
            }else {
                GizmoCore.invoke('setTheme', 'theme', 'default');
            }

            if (!GizmoCore.invoke('userAccess','user', route.type)){
                next();
            }

        }, this.modules[name][callback]);

        // set application post URLs
        this.app.post(link, function (req, res, next){
            GizmoCore.init(req, res, next);
            next();
        }, function (req, res, next){
            var route = GizmoCore.menus[req.route.path];

            GizmoCore.invoke('setTitle', 'theme', route.title);

            if (route.theme != undefined){
                GizmoCore.invoke('setTheme', 'theme', route.theme);
            }else {
                GizmoCore.invoke('setTheme', 'theme', 'default');
            }

            next();
        }, this.modules[name][callback]);
    }

    this.menus = menus;
}

/**
 * Setup home page route
 */
exports.home = function () {

    // home get
    this.app.get('/', function (req, res, next){
        GizmoCore.init(req, res, next);
        next();
    }, function(req, res, next){
        GizmoCore.render('home');
    });

    // home post
    this.app.post('/', function (req, res, next){
        GizmoCore.init(req, res, next);
        next();
    }, function(req, res, next){
        GizmoCore.render('home');
    });
}

/**
 * detect is the call is ajax
 * @returns {xhr|*}
 */
exports.isAjax = function(){
    return this.request.xhr
}