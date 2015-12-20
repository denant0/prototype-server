var buttonsMetadata = [
    {
        icon: 'style/icons/edit.jpg',
        class: 'editclasss',
        function: 'buttonClick1',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/cansel.jpg',
        class: 'deleteclass',
        function: 'buttonClick2',
        condition: [
            {
                column: 'AssetType',
                value: 'bl'
            }
        ]
    },{
        icon: 'style/icons/add.jpg',
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
        icon: 'style/icons/info.jpg',
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

