var buttonsMetadata = [
    {
        icon: 'style/icons/cog_edit.png',
        class: 'editclass',
        function: function(){
            webix.message('You click button 1');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/delete.gif',
        class: 'deleteclass',
        function: function(){
            webix.message('You click button 2');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/add.gif',
        class: 'addclass',
        function: function(){
            webix.message('You click button 3');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            },
            {
                column: 'AssetType',
                value: 'eq'
            }
        ]
    },{
        icon: 'style/icons/information.png',
        class: 'infoclass',
        function: function(){
            webix.message('You click button 4');
        },
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    }
];




module.exports = buttonsMetadata;

