var app = angular.module('odin.importerControllers', ['ngFileUpload']);

app.factory('model', function($resource) {
    return $resource();
});

function ImporterCreateController($scope, $location, usSpinnerService, Alertify, CkanImporterService, rest, model, Upload) {

    $scope.model = new model();
    $scope.model.url = 'http://data.buenosaires.gob.ar';

    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            var defaults = {
                owner: $scope.model.owner,
                status: $scope.model.status,
                freq: $scope.model.updateFrequency,
                organization: $scope.model.organization,
                url: $scope.model.url
            };

            CkanImporterService.Import(rest, Upload, defaults, importCallback);
        }
    }

    function importCallback() {
        usSpinnerService.stop('spinner');
        var url = '/importer/result';
        $location.path(url);
    }
}

function ImporterResultController($scope, $location, usSpinnerService, Alertify, CkanImporterService, $uibModal) {
    console.log(CkanImporterService.getResults());
    $scope.results = CkanImporterService.getResults();
}