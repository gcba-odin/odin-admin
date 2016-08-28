(function() {
    var app = angular.module('ckan-importer-service', []);

    app.factory('CkanImporterService', CkanImporterService);
    // app.factory('model', function($resource) {
    //     return $resource();
    // });

    CkanImporterService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout'];

    function CkanImporterService($http, $cookieStore, $rootScope, $timeout, $scope, CkanImporterService, Alertify, rest) {
        var client = new CKAN.Client('http://data.buenosaires.gob.ar');
        var restClient = rest;
        var service = {};
        service.Import = Import;
        service.restClient = null;

        return service;

        function Import(rest) {
            console.log("ENTRA IMPORT");
            restClient = rest;

            // Categories
            // importCategories();

            // Tags
            importTags();

            // // Datasets
            // client.action('package_list', {}, function(err, result) {
            //     if (err) {
            //         console.log("ERROR DATASETS: ", err);
            //     } else {
            //         console.log("DATASETS: ", result);

            //         // Dataset
            //         result.result.forEach(function(dataset) {
            //             client.action('package_show', { id: dataset }, function(err, result) {
            //                 if (err) {
            //                     console.log("ERROR DATASET: ", err);
            //                 } else {
            //                     console.log("DATASET ", dataset, result);
            //                 }
            //             });

            //             // Resources
            //             client.action('resource_search', { query: 'name: ' + dataset }, function(err, result) {
            //                 if (err) {
            //                     console.log("ERROR RESOURCES: ", err);
            //                 } else {
            //                     console.log("RESOURCES: ", result);
            //                 }
            //             });
            //         });
            //     }
            // });
        }

        function importCategories() {

            client.action('group_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR CATEGORIES: ", err);
                } else {
                    // console.log("CATEGORIES: ", result);
                    var categoriesName = result.result;

                    // var i = 0;
                    categoriesName.forEach(function(categoryName) {
                        client.action('group_show', { id: categoryName }, function(err, result) {
                            if (!err) {
                                var category = result.result;
                                var data = {
                                    'name': category.title,
                                    'description': category.description
                                        // 'color': $scope.model.color,
                                        // 'uploadImage': $scope.model.uploadImage,
                                };
                                importCategory(data /*, i*/ );
                                // i = i + 1;
                            }
                        });
                    });
                }
            });
        }

        // http://data.buenosaires.gob.ar/api/3/action/tag_list?q=
        function importTags() {
            client.action('tag_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR TAGS: ", err);
                } else {
                    // console.log("TAGS: ", result);
                    var tagsName = result.result;

                    // var i = 0;
                    tagsName.forEach(function(tagName) {
                        client.action('tag_show', { id: tagName }, function(err, result) {
                            if (!err) {
                                var tag = result.result;
                                var data = {
                                    'name': tag.name
                                };
                                importTag(data /*, i*/ );
                                // i = i + 1;
                            } else {
                                console.log("ERROR TAGS: ", err);
                            }
                        });
                    });

                    console.log("importTags terminado");
                }
            });
        }

        function importCategory(data) {
            var model = {
                modelName: "Tag",
                type: "tags",
                name: data.name
            }

            restClient().save({
                type: model.type
            }, model, function(resp) {
                console.log("OK", resp);
            }, function(error) {
                console.log("ERROR", error);
            });
        }

        // http://data.buenosaires.gob.ar/api/3/action/tag_show?id=tagName
        function importTag(data) {
            var model = {
                modelName: "Tag",
                type: "tags",
                name: data.name
            }

            restClient().save({
                type: model.type
            }, model, function(resp) {
                console.log("OK", resp);
            }, function(error) {
                console.log("ERROR", error);
            });
        }
    }

})();