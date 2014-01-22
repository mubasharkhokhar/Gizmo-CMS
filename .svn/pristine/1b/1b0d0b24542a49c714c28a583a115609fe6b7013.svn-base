
exports.init = function(req, res, next){
    console.log('I am in the demo init hook.');
}

exports.menu = function () {

    var menu = {};

    menu = {
        '/demo' : {
            title  : 'Demo Page',
            type : 'MENU_MAIN',
            callback : 'home',
            access : {
                callback : '',
                arguments : [1,2]
            },
            theme : 'demo'
        },
    };

    return menu;
};

exports.home = function (req, res, next){

    GizmoCore.render('presentation');

}