(function() {
    var app = angular.module('store-factories', ["authentication-service", "user-service"]);

    app.factory('flashService', function($compile, Flash) {
        var msgs = {};
        var myEl = $(".navbar");
        msgs.showError = function(text) {
            Flash.create('error', text, 0, {}, true)
        }
        msgs.showWarning = function(text) {
            Flash.create('warning', text, 0, {}, true)
        }
        msgs.showSuccess = function(text) {
            Flash.create('success', text, 0, {}, true)
        }
        msgs.showInfo = function(text) {
            Flash.create('info', text, 0, {}, true)
        }
        return msgs
    });

    app.factory('modelService', function($location, rest, Flash, Alertify) {
        return {
            insertalScope: {},
            initService: function(modelName, type, scope) {
                Flash.clear();
                scope.modelName = modelName;
                scope.type = type;
                scope.searchModel = [];
                scope.q = "&";
                this.insertalScope = scope;
            },
            activeClass: function(activeClass) {
                if (activeClass) {
                    return "label-success";
                } else {
                    return "label-warning";
                }
            },
            edit: function(scope, model) {
                var url = '/' + scope.type + '/' + model.id + "/edit";
                $location.path(url);
            },
            delete: function(scope, model) {
                rest().delete({
                    type: scope.type,
                    id: model.id
                }, function(resp) {
                    scope.data = rest().get({
                        type: scope.type,
                        params: "orderBy=createdAt&sort=DESC"
                    });
                });
            },
            view: function(scope, model) {
                var url = '/' + scope.type + '/' + model.id + "/view";
                $location.path(url);
            },
            search: function(scope) {


                //scope.q='&where={"name":{"contains":"'+scope.searchField+'"}}';
                this.loadAll(scope);
            },
            loadAll: function(scope) {
                scope.data = rest().get({
                    type: scope.type,
                    params: "orderBy=createdAt&sort=DESC" + scope.q
                });
            },
            findOne: function(routeParams, scope) {
                scope.model = rest().findOne({
                    id: routeParams.id,
                    type: scope.type
                });
            },
            confirmDelete: function(item, scope) {
                var _this = this;
                console.log(item.target.dataset);
                var item = item.target.dataset;
                Alertify.confirm(item.textdelete).then(
                    function onOk() {

                        _this.delete(_this.insertalScope, {
                            id: item.id
                        })
                    },
                    function onCancel() {
                        return false
                    }
                );
            }
        }
    });

    app.factory('rest', ['$resource', '$location', '$rootScope', 'ngProgressFactory', 'flashService', 'Flash', function($resource, $location, $rootScope, ngProgressFactory, flashService, Flash) {
        $rootScope.progressbar = ngProgressFactory.createInstance();
        return function($url) {
            $rootScope.progressbar.start();
            var token = $rootScope.globals.currentUser.token;
            $url = ($url == null) ? $rootScope.url + '/:type' : $url;
            return $resource($url, {
                type: ''
            }, {
                get: {
                    url: $url + "?:params",
                    method: 'GET',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        return angular.fromJson(data);
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                count: {
                    url: $url + "/count",
                    method: 'GET',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        return angular.fromJson(data);
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                contents: {
                    url: $url + "/:id/contents?:params",
                    method: 'GET',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        return angular.fromJson(data);
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                getArray: {
                    url: $url + "/:id/:asociate",
                    method: 'GET',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        var json = JSON.parse(data);
                        return json.data;
                    },
                    isArray: true,
                    interceptor: {
                        responseError: handError
                    }
                },
                findOne: {
                    url: $url + "/:id?:params",
                    method: 'GET',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    transformResponse: function(data) {
                        if (data) {
                            $rootScope.progressbar.complete();
                            var json = JSON.parse(data)
                            return angular.fromJson(json.data);
                        } else {
                            $rootScope.progressbar.complete();
                        }
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                'save': {
                    url: $url,
                    method: 'POST',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        if (data) {
                            if (!!JSON.parse(data).message) {
                                flashService.showSuccess(JSON.parse(data).message);
                            }
                            $rootScope.progressbar.complete();
                            return angular.fromJson(data);
                        } else {
                            $rootScope.progressbar.complete();
                        }
                    }
                },
                'saveWithData': {
                    url: $url,
                    method: 'POST',
                    headers: {
                        'Authorization': 'JWT ' + token,
                        'Content-Type': undefined
                    },
                    transformRequest: function(data, headersGetter) {
                        // Here we set the Content-Type header to null.
                        var headers = headersGetter();
                        headers['Content-Type'] = undefined;

                        // And here begins the logic which could be used somewhere else
                        // as noted above.
                        if (data == undefined) {
                            return data;
                        }

                        var fd = new FormData();

                        var createKey = function(_keys_, currentKey) {
                            var keys = angular.copy(_keys_);
                            keys.push(currentKey);
                            formKey = keys.shift()

                            if (keys.length) {
                                formKey += "[" + keys.join("][") + "]"
                            }

                            return formKey;
                        }

                        var addToFd = function(object, keys) {
                            angular.forEach(object, function(value, key) {
                                var formKey = createKey(keys, key);

                                if (value instanceof File) {
                                    fd.append(formKey, value);
                                } else if (value instanceof FileList) {
                                    if (value.length == 1) {
                                        fd.append(formKey, value[0]);
                                    } else {
                                        angular.forEach(value, function(file, index) {
                                            fd.append(formKey + '[' + index + ']', file);
                                        });
                                    }
                                } else if (value && (typeof value == 'object' || typeof value == 'array')) {
                                    var _keys = angular.copy(keys);
                                    _keys.push(key)
                                    addToFd(value, _keys);
                                } else {
                                    fd.append(formKey, value);
                                }
                            });
                        }

                        addToFd(data, []);

                        return fd;
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        console.log(data);
                    }
                },
                'delete': {
                    url: $url + "/:id",
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();

                    }
                },
                'update': {
                    url: $url + "/:id",
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'JWT ' + token
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        if (data) {
                            if (!!JSON.parse(data).message) {
                                flashService.showSuccess(JSON.parse(data).message);
                            }
                            $rootScope.progressbar.complete();
                            return angular.fromJson(data);
                        } else {
                            $rootScope.progressbar.complete();
                        }
                    }
                }
            });
        }


        function handError(e) {
            params = JSON.stringify(e.data) || " "
            if (!!e.data) {
                if (e.data.code == "E_VALIDATION") {
                    params = validationErrors(e.data);
                }
            }

            //flashService.showError(" Route: <a target='_blank' href='"+e.config.url+"'>"+e.config.url+"</a> <br>"+params);
        }

        function validationErrors(data) {
            var data = data.data;
            var returntext = "";
            for (d in data) {
                for (r in data[d]) {
                    returntext = "<b>SERVER VALIDATIONS: </b> <br><p>Rule: " + data[d][r].rule + " <br>Message: " + data[d][r].message + " </p>";
                }
            }

            return returntext
        }
    }]);
})();


///fdfasdf@dfdf.c