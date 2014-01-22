/**
 * User initialization hook
 */
exports.init = function(){
    GizmoCore.set('MENU', 'MENU_NAV_USER');
    GizmoCore.set('MENU', 'MENU_NAV_GUEST');
};


/**
 * User information hook
 * @returns {{user: {name: string, description: string, version: string, dependencies: Array}}}
 */
exports.info = function () {
    return {
        user : {
            name : 'Users',
            description : 'User module',
            version : '1.0',
            dependencies: []
        }
    };
};

/**
 * User menu hook
 * @returns {{}}
 */
exports.menu = function () {

    var menu = {};

    menu = {
        '/signup' : {
            title  : 'User Signup',
            type : 'MENU_NAV_GUEST',
            callback : 'signup',
            access : {
                    callback : '',
                    arguments : [1,2]
            }
        },
        '/login' : {
            title  : 'User Login',
            type : 'MENU_NAV_GUEST',
            callback : 'login',
            access : {
                callback : '',
                arguments : [1,2]
            }
        },
        '/logout' : {
            title  : 'Logout',
            type : 'MENU_NAV_USER',
            callback : 'logout',
            access : {
                callback : '',
                arguments : [1,2]
            }
        },
    };

    return menu;
};

/**
 * Create Schema for the user module
 * User Schema Hook
 */
exports.schema = function(){

    var UserSchema = new GizmoCore.lib.mongoose.Schema ({
        username : String,
        password : String,
        email : String,
        roles : Array,
        created : Date
    });

    GizmoCore.Schema.User = GizmoCore.db.model('User', UserSchema, 'users');
};


/**
 * Check if user is logged In
 */
exports.checkLogin = function() {
    if(GizmoCore.request.session.user != undefined){
        GizmoCore.response.redirect('/');
    }
}

/**
 * User signup page
 * @param req
 * @param res
 * @param next
 */
exports.signup = function (req, res, next){

    // check if user is logged in
    GizmoCore.modules.user.checkLogin();

    // create signup form
    var reg_form = GizmoCore.utils.forms.create({
        username: GizmoCore.utils.fields.string({
            required: true,
            validators: [GizmoCore.utils.validators.rangelength(5,20)]
        }),
        password: GizmoCore.utils.fields.password({required: true}),
        confirm:  GizmoCore.utils.fields.password({
            required: true,
            validators: [
                GizmoCore.utils.validators.rangelength(6,16),
                GizmoCore.utils.validators.matchField('password')
            ]
        }),
        email: GizmoCore.utils.fields.email({required: true})
    });

     var error = {
        username : null,
        email : null,
        password : null,
        Resetpassword : null
    };

    if (GizmoCore.request.method == 'POST'){

        reg_form.handle(GizmoCore.request, {
            success:  function () {

                GizmoCore.Schema.User.findOne({$or : [{username : GizmoCore.input.post.username}, {email : GizmoCore.input.post.email }]}, function(err, user){

                    if (!user){
                        var bcrypt = require ('bcrypt-nodejs');
                        var encryptPass = bcrypt.hashSync(GizmoCore.input.post.password);

                        var user = GizmoCore.Schema.User({
                            username : GizmoCore.input.post.username,
                            password : encryptPass,
                            email : GizmoCore.input.post.email
                        });

                        user.save();

                        GizmoCore.render('signup', {form : reg_form.toHTML(), success : true, username : GizmoCore.input.post.username, error:error });
                    }else {
                        error.username = 'Username or Email already exists';
                        GizmoCore.render('signup', {form : reg_form.toHTML(), success : false, username : null, error : error});
                    }
                });
            },
            error : function(form) {

                error.username = form.fields.username.errorHTML();
                error.password = form.fields.password.errorHTML();
                error.Resetpassword = form.fields.confirm.errorHTML();
                error.email = form.fields.email.errorHTML();

                GizmoCore.render('signup', {form : reg_form.toHTML(), success : false, username : null, error : error });
            }
        });
    }else {
        GizmoCore.render('signup', {form : reg_form.toHTML(), success : false, username : null, error : error });
    }
}

/**
 * show user profile
 * @param req
 * @param res
 * @param next
 */
exports.profile = function(req, res, next){
//    console.log(req.params.id);
    res.send(req.params.id);
}


/**
 * User login page
 * @param req
 * @param res
 * @param next
 */
exports.login = function(req,res,next){

    if(GizmoCore.request.session.user != undefined){
        GizmoCore.response.redirect('/');
    }

    var login_form = GizmoCore.utils.forms.create({
        username: GizmoCore.utils.fields.string({required: true}),
        password: GizmoCore.utils.fields.password({required: true})
    });

    var error = {
        username : null,
        password : null
    };


    if (GizmoCore.request.method == 'POST'){

        login_form.handle(GizmoCore.request, {
            success:  function () {

                GizmoCore.Schema.User.findOne({
                    username : GizmoCore.input.post.username
//                        password : encryptPass
                },  function (err, user) {

                    if (user != null && GizmoCore.utils.bcrypt.compareSync(GizmoCore.input.post.password, user.password)){
                        req.session.user = {
                            uid : user._id,
                            username : user.username,
                            email : user.email
                        };
                        res.redirect('/');
                    }else {
                        error.password = 'Username or Password is incorrect!';
                        GizmoCore.render('login', {form : login_form.toHTML(), success : false, username : null, error : error });
                    }
                });
            },
            error : function(form){

                error.username = form.fields.username.errorHTML();
                error.password = form.fields.password.errorHTML();

                GizmoCore.render('login', {form : login_form.toHTML(), success : false, username : null, error : error, showerror : true });
            }
        });
    }else {
        GizmoCore.render('login', {form : login_form.toHTML(), success : false, username : null, error : error   });
    }
}

/**
 * Return session key
 * @param key
 * @returns {*}
 */
exports.session = function(key){
    if (GizmoCore.request.session.user != undefined){
        return GizmoCore.request.session.user[key];
    }else {
        return null;
    }
}

/**
 * check if user is logged in
 * @returns {boolean}
 */
exports.isLoggedIn = function (){
    if (GizmoCore.request.session.user != undefined && GizmoCore.request.session.user.username != '' ){
        return true;
    }else {
        return false;
    }
}

/**
 * Logged Out user
 * @param req
 * @param res
 * @param next
 */
exports.logout = function (req, res, next) {
    delete req.session.user;
    res.redirect('/');
}

/**
 * User access function
 * @param perm
 * @returns {boolean}
 */
exports.userAccess = function(perm){

    if (perm == 'MENU_MAIN'){
        return false;
    }

    if (!GizmoCore.invoke('isLoggedIn','user') && perm != 'MENU_NAV_GUEST'){
        GizmoCore.invoke('setTheme','theme','default');
        GizmoCore.render('error', {error : {title : 'Access Denied' , message : 'You don\'t have access to this page.'}});
        return true;
    }

    return false;
}