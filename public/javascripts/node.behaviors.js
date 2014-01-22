

Gizmo.Ajax.behaviors.node = function(settings, context){

    var node_form = $('#node-content-create');

    $('input[name="title"]:not(.node-title-keypress-processed)', node_form).keypress(function(e){
        var value = $(this).val();
        $('input[name="machine_name"]', node_form).val(value.toLowerCase().replace(/[_\s]/g, '-'));
    }).addClass('node-title-keypress-processed');

    $('input[name="title"]:not(.node-title-change-processed)', node_form).change(function(e){
        var value = $(this).val();
        $('input[name="machine_name"]', node_form).val(value.toLowerCase().replace(/[_\s]/g, '-'));
    }).addClass('node-title-change-processed');

    $('#content-add-fields:not(.fields-dialog-processed)').click(function(e){
        e.preventDefault();

        var container = $('#content-field-dialog');
        container
            .dialog({
                modal : true,
                resizable : false,
                width: 500
            });

        $('form:not(.field-form-processed)',container).submit(function(){
            var tr = $('<tr/>');
            var data = $(this).serializeArray();

            if (data.options == undefined){
                data.splice(2, 0, {
                    name : 'options',
                    value : '-'
                });
            }

            var values = {};
            for(var i in data){
                tr.append($('<td/>',{ html : data[i].value}));
                values[data[i].name] = data[i].value;
            }

            tr.append($('<td/>',{ html : $('<a/>',{
                'class' : 'btn btn-danger field-operation',
                'num' : $('#content-custom-fields table tbody').children().length+1,
                'html' : $('<i/>',{'class' : 'icon-trash icon-white'}).after(' Remove')
            })}));

            $('#content-custom-fields table tbody').append(tr);

            $('table a.field-operation:not(.field-op-processed)').each(function(){
                $(this).addClass('field-op-processed');
                $(this).click(function(e){
                    $(this).parents('tr').remove();
                    var num = $(this).attr('num');
                    $('input[name="fields['+num+']"]').remove();
                });
            });

            container.dialog('close');

            $(this)[0].reset();

            $('form#node-content-create').append($('<input/>',{
                name : 'fields['+$('#content-custom-fields table tbody').children().length+']',
                type : 'hidden',
                value : JSON.stringify(values)
            }));

        }).addClass('field-form-processed');
    }).addClass('fields-dialog-processed');
}
