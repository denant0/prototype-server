var buttonsMetadata = [
    {
        icon: 'style/icons/cog_edit.png',
        class: 'editclasss',
        function: 'buttonClick1',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/delete.gif',
        class: 'deleteclass',
        function: 'buttonClick2',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/add.gif',
        class: 'addclass',
        function: 'buttonClick3',
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
        function: 'buttonClick4',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    }
];




module.exports = buttonsMetadata;

