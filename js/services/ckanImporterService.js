(function() {
    var app = angular.module('ckan-importer-service', []);

    app.factory('CkanImporterService', CkanImporterService);

    CkanImporterService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'rest'];

    function CkanImporterService($http, $cookieStore, $rootScope, $timeout, $scope, CkanImporterService, Alertify, rest) {
        var service = {};
        service.Import = Import;

        var client = new CKAN.Client('http://data.buenosaires.gob.ar');
        var restClient = rest;
        var categories = [];
        var tags = [];
        var tagsLimit = 0;
        var defaults = {
            owner: null,
            status: null,
            freq: null
        };

        return service;

        function Import(rest, owner, status, freq) {
            restClient = rest;
            defaults.owner = owner;
            defaults.status = status;
            defaults.freq = freq;

            async.waterfall([
                function(callback) {
                    console.log("1) getCategoryNames");
                    getCategoryNames(callback);
                },
                function(categoryNames, callback) {
                    console.log("2) importCategories");
                    importCategories(categoryNames, callback);
                },
                function(callback) {
                    result = restClient().get({
                        type: "categories",
                        params: "orderBy=name&sort=DESC"
                    }, function() {
                        categories = result.data;
                        console.log("3) Categories", categories);
                        callback();
                    });
                },
                function(callback) {
                    console.log("4) getTagNames");
                    getTagNames(callback);
                },
                function(tagNames, callback) {
                    console.log("5) importTags");
                    importTags(tagNames, callback);
                },
                function(callback) {
                    result = restClient().get({
                        type: "tags",
                        params: "limit="+tagsLimit * 2+"&orderBy=name&sort=DESC"
                    }, function() {
                        tags = result.data;
                        console.log("6) Tags", tags);
                        callback();
                    });
                },
                function(callback) {
                    console.log("7) getDatasetNames");
                    getDatasetNames(callback);
                },
                function(datasetNames, callback) {
                    console.log("8) importDatasets");
                    importDatasets(datasetNames, callback);
                },
            ]);
        }

        function getCategoryNames(callback) {
            // http://data.buenosaires.gob.ar/api/3/action/group_list?q=
            client.action('group_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR getCategoryNames: ", err);
                } else {
                    callback(null, result.result);
                }
            });
        }

        function getTagNames(callback) {
            // http://data.buenosaires.gob.ar/api/3/action/tag_list?q=
            client.action('tag_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR getTagNames: ", err);
                } else {
                    tagsLimit = result.result.length;
                    callback(null, result.result);
                }
            });
        }

        function getDatasetNames(callback) {
            // http://data.buenosaires.gob.ar/api/3/action/package_list?q=
            client.action('package_list', {}, function(err, result) {
                if (err) {
                    console.log("ERROR getDatasetNames: ", err);
                } else {
                    callback(null, result.result);
                }
            });
        }

        function importCategories(categoryNames, callbackFunc) {
            // http://data.buenosaires.gob.ar/api/3/action/group_show?id=categoryName
            async.eachSeries(categoryNames, function(categoryName, callback) {
                client.action('group_show', { id: categoryName }, function(err, result) {
                    if (!err) {
                        var category = result.result;
                        var model = {
                            modelName: "Category",
                            type: "categories",
                            name: category.title,
                            description: category.description,
                            active: category.state == 'active' ? true : false
                        }

                        importModel(model, callback);
                    } else {
                        console.log("ERROR CATEGORY: ", err);
                        callback(err);
                    }
                });
            }, function(err) {
                if (err) console.log("Error importando algunas categorías");
                callbackFunc(null);
            });
            // callbackFunc(null); // Uncomment only for testing.
        }

        function importTags(tagNames, callbackFunc) {
            // http://data.buenosaires.gob.ar/api/3/action/tag_show?id=tagName
            async.eachSeries(tagNames, function(tagName, callback) {
                client.action('tag_show', { id: tagName }, function(err, result) {
                    if (!err) {
                        var tag = result.result;
                        var model = {
                            modelName: "Tag",
                            type: "tags",
                            name: tag.name
                        };

                        importModel(model, callback);
                    } else {
                        console.log("ERROR TAG: ", err);
                        callback(err);
                    }
                });
            }, function(err) {
                if (err) console.log("Error importando algunos tags");
                callbackFunc(null);
            });
            // callbackFunc(null); // Uncomment only for testing.
        }

        function importDatasets(datasetNames, callbackFunc) {
            // http://data.buenosaires.gob.ar/api/3/action/package_show?id=datasetName
            async.eachSeries(datasetNames, function(datasetName, callback) {
                client.action('package_show', { id: datasetName }, function(err, result) {
                    if (!err) {
                        var dataset = result.result;

                        var datasetCategories = dataset.groups;
                        var categoryIds = [];
                        datasetCategories.forEach(function(datasetCategory) {
                            var categoryId = categories.filter(function(cat) {
                                return cat.name.trim() === datasetCategory.title.trim();
                            }).map(function(cat) {
                                return cat.id;
                            });
                            categoryIds.push(categoryId);
                        });
                        categoryIds = categoryIds.join(",");

                        var datasetTags = dataset.tags;
                        var tagIds = [];
                        datasetTags.forEach(function(datasetTag) {
                            var tagId = tags.filter(function(tag) {
                                return tag.name.trim() === datasetTag.name.trim();
                            }).map(function(tag) {
                                return tag.id;
                            });
                            tagIds.push(tagId);
                        });
                        tagIds = tagIds.join(",");

                        var model = { //TODO optionals and resources?
                            modelName: "Dataset",
                            type: "datasets",
                            name: dataset.title,
                            description: dataset.notes,
                            status: defaults.status,//TODO toma siempre borrador
                            categories: categoryIds,
                            owner: defaults.owner,
                            tags: tagIds,
                            starred: false,
                            notes: dataset.notes
                        };

                        importModel(model, callback);
                    } else {
                        console.log("ERROR DATASET: ", err);
                        callback(err);
                    }
                });
            }, function(err) {
                if (err) console.log("Error importando algunos datasets");
                callbackFunc(null);
            });
        }

        function importModel(model, callback) {
            restClient().save({
                type: model.type
            }, model, function(resp) {
                console.log("OK", resp);
                callback();
            }, function(error) {
                console.log(error.data.data.name[0].message);
                callback();
            });
        }
    }

})();