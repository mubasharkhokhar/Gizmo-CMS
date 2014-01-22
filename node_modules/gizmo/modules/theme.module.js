
exports.page = {};

/**
 * Theme init hook
 * set page theme
 */
exports.init = function() {
    GizmoCore.modules.theme.page.title = GizmoCore.config.site_name;
};

/**
 * Set Page Title
 * @param title
 */
exports.setTitle = function(title){
    GizmoCore.modules.theme.page.title = title;
};

/**
 * Set page theme directory
 * @param theme
 */
exports.setTheme = function(theme){
   GizmoCore.config.theme = theme;
}

/**
 * Get page title
 * @param theme
 */
exports.getTitle = function(){
    return GizmoCore.modules.theme.page.title;
};
