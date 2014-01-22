
exports.menu = function() {

    var menu = {};

    menu = {
        "/admin" : {
            title  : 'Administration',
            type : 'MENU_ADMIN',
            callback : 'home',
            access : {
                callback : '',
                arguments : []
            },
            theme : 'admin'
        },
        '/admin/modules': {
            title : 'Modules',
            type : 'MENU_ADMIN',
            callback : 'modules',
            access : {
                callback  : '',
                arguments : []
            },
            theme : 'admin'
        },
        '/settings' : {
            title : 'Site Configuration',
            type : 'MENU_ADMIN',
            callback : 'modules',
            access : {
                callback  : '',
                arguments : []
            },
            theme : 'admin'
        },
        '/admin/structure' : {
            title : 'Structure',
            type : 'MENU_ADMIN',
            callback : 'structure',
            access : {
                callback  : '',
                arguments : []
            },
            theme : 'admin'
        },
        '/setup' : {
            title : 'Gizmo CMS Setup',
            type : 'MENU_MAIN',
            callback : 'setup',
            access : {
                callback  : '',
                arguments : []
            }
        },
    };

    return menu;
};

exports.init = function(){

};

exports.home = function (req, res, next) {

    GizmoCore.render('dashboard/index');
//    next();
};

exports.schema = function (){
   var systemSchema = new GizmoCore.lib.mongoose.Schema({
       file : String,
       name : String,
       type : String,
       enabled : Boolean,
   });

   GizmoCore.Schema.System = GizmoCore.db.model('System',systemSchema, 'system');
}

exports.modules = function(req, res, next){

    var modules = {};
    for(var name in GizmoCore.modules){
        if (GizmoCore.modules[name].info != undefined){
            modules = GizmoCore.utils.merge(GizmoCore.modules[name].info(), modules);
        }
    }

    for(var name in modules){
        modules[name].enabled = GizmoCore.modules[name].enabled;
        modules[name].file = GizmoCore.modules[name].file;
    }

    if (GizmoCore.request.method == 'POST'){

        var enabled = null;
        for(var name in GizmoCore.input.post.modules){
            enabled = parseInt(GizmoCore.input.post.modules[name]);
            var moduleSettings = {
                file : GizmoCore.modules[name].file,
                name : name,
                enabled : (enabled) ? true : false,
                type : 'module',
            };

            GizmoCore.Schema.System.update({ name: name, type : 'module' }, { $set:  moduleSettings }, { upsert: true }, function(){});
        }

        GizmoCore.modules.ajax.commandInvoke(null, 'notify', {
            type : 'success',
            text : 'Changes successfully saved.'
        });
    }

    GizmoCore.render('modules/index', {modules : modules});
}

exports.info = function () {
    return {
         admin : {
            name : 'Admin',
            description : 'Admin module',
            version : '1.0',
            dependencies: []
         }
    };
}


exports.structure = function(req, res, next){

    GizmoCore.set('MENU','MENU_ADMIN_STRUCTURE');

    var data = {
        contentTypes : []
    };

    GizmoCore.Schema.Content.find({}, function(err, contentTypes){
        data.contentTypes = contentTypes;
        GizmoCore.render('structure/index', data);
    });
}

exports.watchdog = function(message, type){

}

exports.setup = function(req, res, next){
    var admin = {
        username : 'admin',
        password : GizmoCore.utils.bcrypt.hashSync('click123'),
        email : 'contact@social-gizmo.com',
        roles : [ 'administrator' ],
        created : new Date()
    }
    GizmoCore.Schema.User.update({ username: 'admin' }, { $set:  admin }, { upsert: true }, function(err, status){
        if (!err){
            GizmoCore.render('setup/index');
        }
        else {
            GizmoCore.render('error', {error : {title  : 'Setup Failed!', message : 'Unable to process your command at this time.'}});
        }
    });
}