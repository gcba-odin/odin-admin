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
            importCategories();

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

        // http://data.buenosaires.gob.ar/api/3/action/group_list?q=
        function importCategories() {
            client.action('group_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR CATEGORIES: ", err);
                } else {
                    var categoriesName = result.result;
                    categoriesName.forEach(function(categoryName) {
                        client.action('group_show', { id: categoryName }, function(err, result) {
                            if (!err) {
                                var category = result.result;
                                var data = {
                                    'name': category.title,
                                    'description': category.description,
                                    'active': category.state == 'active' ? true : false
                                };
                                importCategory(data);
                            } else {
                                console.log("ERROR CATEGORY: ", err);
                            }
                        });
                    });
                    
                    console.log("importCategories terminado");
                }
            });
        }

        // http://data.buenosaires.gob.ar/api/3/action/tag_list?q=
        function importTags() {
            client.action('tag_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR TAGS: ", err);
                } else {
                    var tagsName = result.result;
                    tagsName.forEach(function(tagName) {
                        client.action('tag_show', { id: tagName }, function(err, result) {
                            if (!err) {
                                var tag = result.result;
                                var data = {
                                    'name': tag.name
                                };
                                importTag(data);
                            } else {
                                console.log("ERROR TAG: ", err);
                            }
                        });
                    });

                    console.log("importTags terminado");
                }
            });
        }

        http: //data.buenosaires.gob.ar/api/3/action/group_show?id=categoryName
            function importCategory(data) {
                var model = {
                    modelName: "Category",
                    type: "categories",
                    name: data.name,
                    description: data.description,
                    active: data.active
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