(function() {
    var app = angular.module('store-factories', ["authentication-service", "user-service", "ckan-importer-service"]);

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

    app.factory('configs', function(rest) {
        return {
            findKey: function(scope, callback) {
                var configs = rest().get({
                    type: 'configs',
                    params: 'key=' + scope.config_key
                }, function() {
                    callback(configs);
                });
                //return configs;
            },
            statuses: function(scope) {
                var configs = rest().get({
                    type: 'configs'
                }, function() {
                    scope.statuses = {
                        default: '',
                        published: '',
                        unpublished: '',
                        underReview: ''
                    };
                    angular.forEach(configs.data, function(element) {
                        if (element.key == 'defaultStatus') {
                            scope.statuses.default = element.value;
                        } else if (element.key == 'publishedStatus') {
                            scope.statuses.published = element.value;
                        } else if (element.key == 'unpublishedStatus') {
                            scope.statuses.unpublished = element.value;
                        } else if (element.key == 'underReviewStatus') {
                            scope.statuses.underReview = element.value;
                        } else if (element.key == 'rejectedStatus') {
                            scope.statuses.rejected = element.value;
                        }
                    });
                });
            },
        }
    });

    app.factory('modelService', function($location, rest, Flash, Alertify, $window) {
        orderBy = 'createdAt';
        sort = 'DESC';
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
            delete: function(scope, model, filters) {
                rest().delete({
                    type: scope.type,
                    id: model.id
                }, function(resp) {
                    var pm = '';
                    if (!!filters) {
                        pm += 'include=';
                        angular.forEach(filters, function(val, key, fil) {
                            pm += val;
                            if (key == (filters.length - 1)) {
                                pm += '&';
                            } else {
                                pm += ',';
                            }
                        });
                    }
                    var conditions = '';
                    if (!!scope.q && scope.q != '') {
                        conditions = scope.q;
                    }
                    
                    if(!!scope.parameters.orderBy) {
                        orderBy = scope.parameters.orderBy;
                    }
                    
                    if(!!scope.parameters.sort) {
                        sort = scope.parameters.sort;
                    }

                    scope.data = rest().get({
                        type: scope.type,
                        params: pm + "orderBy="+orderBy+"&sort="+ sort + conditions
                    });
                });
            },
            restoreList: function(scope, item, filters) {
                var model = item.target.dataset;
                rest().restore({
                    type: scope.type,
                    id: model.id
                }, {}, function(resp) {
                    var pm = '';
                    if (!!filters) {
                        pm += 'include=';
                        angular.forEach(filters, function(val, key, fil) {
                            pm += val;
                            if (key == (filters.length - 1)) {
                                pm += '&';
                            } else {
                                pm += ',';
                            }
                        });
                    }

                    var conditions = '';
                    if (!!scope.q && scope.q != '') {
                        conditions = scope.q;
                    }
                    
                    if(!!scope.parameters.orderBy) {
                        orderBy = scope.parameters.orderBy;
                    }

                    if(!!scope.parameters.sort) {
                        sort = scope.parameters.sort;
                    }
                    
                    scope.data = rest().get({
                        type: scope.type,
                        params: pm + "orderBy="+orderBy+"&sort="+sort + conditions
                    });
                });
            },
            restoreView: function(scope, item) {
                var model = item.target.dataset;
                rest().restore({
                    type: scope.type,
                    id: model.id
                }, {}, function(resp) {
                    scope.model = rest().findOne({
                        id: model.id,
                        type: scope.type
                    });
                });
            },
            deactivateList: function(item, scope, filters) {
                var item = item.target.dataset;
                Alertify.confirm(item.textdelete).then(
                    function onOk() {
                        rest().deactivate({
                            type: scope.type,
                            id: item.id
                        }, {}, function(resp) {
                            var pm = '';
                            if (!!filters) {
                                pm += 'include=';
                                angular.forEach(filters, function(val, key, fil) {
                                    pm += val;
                                    if (key == (filters.length - 1)) {
                                        pm += '&';
                                    } else {
                                        pm += ',';
                                    }
                                });
                            }
                            var conditions = '';
                            if (!!scope.q && scope.q != '') {
                                conditions = scope.q;
                            }
                            
                            if(!!scope.parameters.orderBy) {
                                orderBy = scope.parameters.orderBy;
                            }

                            if(!!scope.parameters.sort) {
                                sort = scope.parameters.sort;
                            }
                            
                            scope.data = rest().get({
                                type: scope.type,
                                params: pm + "orderBy="+orderBy+"&sort=" + sort + conditions
                            });
                        });
                    },
                    function onCancel() {
                        return false
                    }
                );
            },
            deactivateView: function(item, scope) {
                var item = item.target.dataset;
                Alertify.confirm(item.textdelete).then(
                    function onOk() {
                        rest().deactivate({
                            type: scope.type,
                            id: item.id
                        }, {}, function(resp) {
                            scope.model = rest().findOne({
                                id: item.id,
                                type: scope.type
                            });
                        });
                    },
                    function onCancel() {
                        return false
                    }
                );
            },
            view: function(scope, model) {
                var url = '/' + scope.type + '/' + model.id + "/view";
                $location.path(url);
            },
            search: function(scope) {


                //scope.q='&where={"name":{"contains":"'+scope.searchField+'"}}';
                this.loadAll(scope);
            },
            loadAll: function(scope, callback) {
                if(!!scope.parameters && !!scope.parameters.orderBy) {
                    orderBy = scope.parameters.orderBy;
                }

                if(!!scope.parameters && !!scope.parameters.sort) {
                    sort = scope.parameters.sort;
                }
                    
                scope.data = rest().get({
                    type: scope.type,
                    params: "orderBy="+orderBy+"&sort="+ sort + scope.q
                }, function(resp) {
                    callback(true);
                }, function(error) {
                    callback(false);
                });
            },
            findOne: function(routeParams, scope) {
                scope.model = rest().findOne({
                    id: routeParams.id,
                    type: scope.type
                });
            },
            confirmDelete: function(item, scope, filters) {
                var _this = this;
                var item = item.target.dataset;
                Alertify.confirm(item.textdelete).then(
                    function onOk() {

                        _this.delete(_this.insertalScope, {
                            id: item.id
                        }, filters)
                    },
                    function onCancel() {
                        return false
                    }
                );
            },
            reloadPage: function() {
                Alertify.set({
                    labels: {
                        ok: 'Recargar página',
                        cancel: 'Continuar'
                    }
                });
                Alertify
                    .confirm('Hubo un error en la conexión. Vuelva a cargar la página.')

                .then(
                    function onOk() {
                        $window.location.reload();
                    }
                );
            }
        }
    });

    app.factory('rest', ['$resource', '$location', '$rootScope', 'ngProgressFactory', 'flashService', 'Flash', '$injector', 'jwtHelper', function($resource, $location, $rootScope, ngProgressFactory, flashService, Flash, $injector, jwtHelper) {
        $rootScope.progressbar = ngProgressFactory.createInstance();
        return function($url) {
            $rootScope.progressbar.start();
            var token = $rootScope.adminglob.currentUser.token;
            $url = ($url == null) ? $rootScope.url + '/:type' : $url;

            if (jwtHelper.isTokenExpired(token)) {
                $location.path('login');
            }

            return $resource($url, {
                type: ''
            }, {
                get: {
                    url: $url + "?:params",
                    method: 'GET',
                    headers: {
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        return angular.fromJson(data);
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                resources: {
                    url: $url + "/:id/resources?:params",
                    method: 'GET',
                    headers: {
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
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
                        'x-admin-authorization': token,
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();

                    }
                },
                'restore': {
                    url: $url + "/:id/restore",
                    method: 'POST',
                    headers: {
                        'x-admin-authorization': token,
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();

                    }
                },
                'deactivate': {
                    url: $url + "/:id/deactivate",
                    method: 'POST',
                    headers: {
                        'x-admin-authorization': token,
                    },
                    interceptor: {
                        responseError: handError
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();

                    }
                },
                publish: {
                    url: $url + "/:id/publish",
                    method: 'PATCH',
                    headers: {
                        'x-admin-authorization': token,
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        return angular.fromJson(data);
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                unpublish: {
                    url: $url + "/:id/unpublish",
                    method: 'PATCH',
                    headers: {
                        'x-admin-authorization': token,
                    },
                    transformResponse: function(data) {
                        $rootScope.progressbar.complete();
                        return angular.fromJson(data);
                    },
                    interceptor: {
                        responseError: handError
                    }
                },
                    reject: {
                        url: $url + "/:id/reject",
                        method: 'PATCH',
                        headers: {
                            'x-admin-authorization': token,
                        },
                        transformResponse: function(data) {
                            $rootScope.progressbar.complete();
                            return angular.fromJson(data);
                        },
                        interceptor: {
                            responseError: handError
                        }
                    },
                    'update': {
                        url: $url + "/:id",
                        method: 'PUT',
                        headers: {
                            'x-admin-authorization': token,
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
                if (e.data.code == "E_INTERNAL_SERVER_ERROR" && (e.data.message == "jwt expired" || e.data.message == "invalid signature")) {
                    $location.path('login');
                }
            }
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
