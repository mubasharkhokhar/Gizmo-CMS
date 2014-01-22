/**
 * Created by Mubashar Khokhar on 12/1/13.
 */

exports.index  = function(req, res, next){
    GizmoCore.render('index');
};

exports.install = function (req, res, next){

    // check for config file
    // if exist then redirect to root '/'
    if (global.configAvailable != undefined ){
//        res.redirect('/');
    }

};
