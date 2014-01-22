
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');

// gizmo Core
GizmoCore = require('gizmo');

// start the express engine
GizmoCore.app = express();

// Gizmo Load Utilities
GizmoCore.utils.fields = GizmoCore.utils.forms.fields;
GizmoCore.utils.validators = GizmoCore.utils.forms.validators;

// gizmo Routes
var GizmoRoutes = require('./routes/gizmoRoutes');

// all environments
GizmoCore.app.set('port', process.env.PORT || 3000);
GizmoCore.app.set('views', GizmoCore.utils.path.join(__dirname, 'views'));
GizmoCore.app.set('view engine', 'ejs');
GizmoCore.app.use(express.favicon());
GizmoCore.app.use(express.logger('dev'));
GizmoCore.app.use(express.json());
GizmoCore.app.use(express.urlencoded());
GizmoCore.app.use(express.methodOverride());
GizmoCore.app.use(express.cookieParser('fachhochschule.kiel'));
GizmoCore.app.use(express.session());
GizmoCore.app.use(GizmoCore.app.router);
GizmoCore.app.use(express.static(GizmoCore.utils.path.join(__dirname, 'public')));

// development only
if ('development' == GizmoCore.app.get('env')) {
  GizmoCore.app.use(express.errorHandler());
}

// boot the GizmoCore engine
GizmoCore.boot();

// set the http server running
http.createServer(GizmoCore.app).listen(GizmoCore.app.get('port'), function(){
  console.log('Express server listening on port ' + GizmoCore.app.get('port'));
});
