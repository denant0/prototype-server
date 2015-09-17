var buttonsMetadata = [
    {
        icon: 'style/icons/cog_edit.png',
        class: 'editclass',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/delete.gif',
        class: 'deleteclass',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/add.gif',
        class: 'addclass',
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
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    }
];




module.exports = buttonsMetadata;

