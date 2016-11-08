(function() {
    return angular.module('roles-constant', [])
        .constant('ROLES', {
            'SUPERADMIN': 'superadmin',
            'ADMIN': 'admin',
            'GUEST': 'guest'
        });
})();
