
(function($) {
    $.fn.ajaxCall = function(){
        
        var url = $(this).attr('href'), data = [];
        
        if (url == '' || url == undefined){
            url = $(this).attr('action'); 
            data = $(this).serializeArray();
        }
        
        $.ajax({
            url : url,
            type : 'post',
            data : data,
            dataType : 'json',
            success : function(data, status, xhr){
                Gizmo.Ajax.processCommands(data);
            },
            error : function(jqXHR, status, errorThrown){

                jQuery(document).notify({
                    type : status,
                    text : errorThrown
                });


            }
        });
    }
    
    $.fn.Gizmodal = function(options){
        
        if (options.title == undefined)
            options.title = Gizmo.settings.pageTitle;
        
        if (options.action == undefined)
            options.action = 'show';
        
        if (options.action == 'hide'){
            options.title = null;
            options.content = '';
        }
        
        $('.modal-header h3',this).html(options.title);
        $('.modal-body',this).html(options.content);
        $('.modal-body .form-actions',this).addClass('modal-footer');
        $('form.form-horizontal',this).css('margin-bottom','0px');
        $(this).modal(options.action);       
    }
    
    $.fn.notify = function(options){
        options.speed = 300;
        options.timeout = 2500;
        jQuery.noty(options);
    }    
    
    $.fn.tableRowRemove = function(options){
        
        jQuery('tbody tr', this).each(function(){                        
            var value = jQuery('td:nth-child('+options.index+')',this).html();
            console.log(value);
            if (value == options.value){
                jQuery(this).remove();
            }
        });
    }
    
    $.fn.tableRowUpdate = function(options){
        
        jQuery('tbody tr', this).each(function(){                        
            var value = jQuery('td:nth-child('+options.index+')',this).html();
            if (value == options.index_value){
                jQuery('td:nth-child('+options.place    +')',this).html(options.value);
            }
        });
    }
    
    $.fn.redirectUrl = function(options){
        window.top.location = options.url;
    }
    
    jQuery.fn.managedFile = function(){
        var id = $(this).attr('id');
        
//        $('#'+id).uploadify({
//            'swf' : Gizmo.settings.basePath + 'components/images/uploadify.swf',
//            'uploader' : Gizmo.settings.basePath + 'index.php/sys/upload',
//            'fileTypeExts' : $(this).attr('allowedExt'),
//            'formData' : {
//                'field_name' : $(this).attr('name'),
//                'allowed_ext' : $(this).attr('allowed_ext'),
//                'max_size' : $(this).attr('max_size'),
//                'token' : $(this).attr('token')
//            },
//            'fileObjName' : $(this).attr('name'),
//            'onUploadSuccess' : function(file, data, response){
//                if (response){
//                    var commands = $.parseJSON(data);
//                    Gizmo.Ajax.processCommands(commands);
//                }
//            }
//        });
    }
})(jQuery);

function Gizmo(){
    
    this.Ajax = {
        
        behaviors : {            
        },
        
        attachBehaviors : function(context){
            
            for(var name in Gizmo.Ajax.behaviors){                
                Gizmo.Ajax.behaviors[name](context, Gizmo.settings);
            }
        },
        processCommands : function(data){
                var command = null, cmd_string = null;
                for(i=0; i < data.length; i++){
                   
                    command = data[i];
                   console.log(command);
                    switch(command.type){
                        case 'settings':
                            $.extend(Gizmo.settings, command.options);
                            break;
                        case 'command':
                            
                            cmd_string = "jQuery("+JSON.stringify(command.selector)+")."+command.method+"("+JSON.stringify(command.options)+");";
                            console.log(cmd_string);
                            jQuery.globalEval(cmd_string);
                            Gizmo.Ajax.attachBehaviors(command.selector);
                            break;
                    }
                }            
        }
    };
    
    this.settings = {};
}

var Gizmo = new Gizmo();
