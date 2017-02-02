(function() {
    var app = angular.module('store-directives', ["store-directives-home"]);

    app.directive("searchBar", function($parse, $window) {
        return {
            restrict: "E",
            templateUrl: "directives/search-bar.html",
            scope: "=",
            controller: function ($scope, modelService, $timeout) {
                
                $scope.search = function() {
                    $scope.parameters.skip = 0;
                    $scope.parameters.conditions_page = '';
                    $scope.q = "&";
                    var conditionApplied = false;
                    var filters = $scope.searchModel.filters;

                    $scope.dropdowns.forEach(function(drop) {
                        //if (!!drop.underReview) {
                            conditionApplied = true;
                            //$scope.q += drop.condition;
                        //}
                    });

                    if ($scope.searchModel.q) {
                        $scope.q += "name=" + $scope.searchModel.q + "&";
                    }
                    for (var f in filters) {
                        if (filters[f] != undefined) {
                            if (Object.prototype.toString.call(filters[f]) === '[object Array]') {
                                $scope.q += f + "=" + filters[f].join(",") + "&";
                            } else {
                                $scope.q += f + "=" + filters[f] + "&";
                            }
                        }
                    }
                    $scope.q += conditionApplied ? 'condition=AND' : 'condition=OR';
                    $scope.parameters.conditions_page = $scope.q;
                    if ((!angular.isUndefined($scope.parameters.skip)) && (!angular.isUndefined($scope.parameters.limit))) {
                        $scope.q += "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
                    }
                    modelService.search($scope);
                };

                $scope.clearSearch = function () {
                    $('.dropdowns-filter').find('select').each(function(){
                        var selectize = $(this)[0].selectize;
                        $timeout(function() {
                            selectize.clear();
                            selectize.clearOptions();
                        }, 0);
                        
                    });
                    $scope.searchModel = {};
                    $scope.search();
                };
            },
            link: function(scope, element, attrs) {
                scope.dropdowns = $parse(attrs.filters)();
                scope.searchInputForm = $parse(attrs.search)();
            },
            controllerAs: "searchBar"
        };
    });

    app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    app.directive('fileModel', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

    app.directive('selectTwoTags', ['$parse', function($parse, $scope) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).selectize()[0].selectize.destroy();

                var selectize = $(element).selectize({
                    plugins: ['remove_button'],
                    delimiter: ',',
                    create: false,
                    valueField: 'id',
                    placeholder: attrs.placeholder,
                    labelField: 'name',
                })[0].selectize;


                scope.$watch('tagsmodel', function(newValue, oldValue) {
                    attrs.$observe('tagsmodel', function(value) {
                        if (value) {
                            var json = angular.fromJson(value);
                            setTimeout(function() {
                                selectize.addOption(json);
                            }, 300);

                        }
                    })

                })
                scope.$watch('tagsmodel', function(newValue, oldValue) {
                    attrs.$observe('tagsselected', function(value) {
                        if (value) {
                            var json = angular.fromJson(value);
                            setTimeout(function() {
                                selectize.setValue(json);
                            }, 700);
                        }
                    })
                });

            }
        };
    }]);

    app.directive('selectTwo', ['$parse', function($parse, $scope) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                setTimeout(function() {
                    var selectize = $(element).selectize({
                        create: false,
                        placeholder: attrs.placeholder
                    })[0].selectize;
                    selectize.removeOption('? object:null ?');
                    selectize.removeOption('? undefined:undefined ?');
                }, 1000);
            }

        };
    }]);

    app.directive('selectTwoAjax', ['$timeout', '$parse', '$cookieStore', '$http', 'jwtHelper', '$location', 'Alertify', '$rootScope', function($timeout, $parse, $cookieStore, $http, jwtHelper, $location, Alertify, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                modelValue: '@ngModel',
                values: '=values',
                subcats: '=subcats'
            },
            link: function(scope, element, attrs, rootScope) {
                var token = $cookieStore.get('adminglob').currentUser.token;
                var token_auth = $cookieStore.get('globals').currentConsumer.token;

                if (jwtHelper.isTokenExpired(token)) {
                    $location.path('login');
                }

                if (!!attrs.create) {
                } else {
                    attrs.create = false;
                }

                var data_selectize = {
                    valueField: 'id',
                    labelField: attrs.key,
                    searchField: attrs.key,
                    placeholder: attrs.placeholder,
                    create: attrs.create,
                    openOnFocus: false,
                    onInitialize: function() {
                        if (!angular.isUndefined(attrs.dis) && attrs.dis == 'disabled') {
                            this.disable();
                        }
                        if (attrs.modelname == 'tags') {
                            this.$control_input.on('keypress', function(e) {
                                if(/[^ a-zA-ZáäàéëèíïìóöòúüùÁÄÀÉËÈÍÏÌÓÖÒÚÜÙñÑ-]/g.test(e.key)){
                                    e.preventDefault();  
                                } 
                            });
                        }
                    },
                    onOptionAdd: function(a, item, talvez) {

                        if (attrs.create) {
                            if (item.name == item.id) {
                                var name = item.name;
                                var selectize = selectizes[0].selectize;


                                $.ajax({
                                    headers: {
                                        'Authorization': 'Bearer ' + token_auth,
                                        'x-admin-authorization': token,
                                    },
                                    url: scope.$root.url + "/tags",
                                    type: 'post',
                                    data: {
                                        name: "" + name
                                    },
                                    success: function(resp) {
                                        selectize.removeOption(name);
                                        selectize.refreshOptions();
                                        selectize.addOption({
                                            name: resp.data.name,
                                            id: resp.data.id
                                        });
                                        selectize.addItems(resp.data.id);
                                        selectize.refreshOptions();

                                    },
                                    error: function(resp) {
                                        Alertify.alert('El tag que desea agregar ya existe.');
                                        selectize.refreshOptions();
                                        selectize.removeOption(name);
                                        selectize.refreshOptions();
                                    }
                                });
                            }
                        
                        }
                    },
                    render: {
                        option: function(item, escape) {
                            var name = eval("item." + attrs.key);
                            return '<div>' +
                                '<span class="title">' +
                                '<span class="name">' + escape(name) + '</span>' +
                                '</span><br>' +
                                '</div>';
                        }
                    },
                    load: function(query, callback) {
                        if (!query.length)
                            return callback();

                        var self = this;
                        // This line removes the old history, but also removes selected items.
                        // Waiting for a workaround. See: https://github.com/selectize/selectize.js/pull/1080
                        // self.clearOptions();

                        $.each(self.options, function(key, value) {
                            if (self.items.indexOf(key) == -1) {
                                delete self.options[key];
                            }
                        });
                        self.sifter.items = self.options;
                        self.clearCache();

                        var urlStr = scope.$root.url + '/' + attrs.modelname + '?condition=AND&deletedAt=null&';
                        if (attrs.condition) {
                            urlStr += attrs.condition + '&';
                        }
                        urlStr += attrs.key + '=' + encodeURIComponent(query);

                        $.ajax({
                            headers: {
                                'Authorization': 'Bearer ' + token_auth,
                                'x-admin-authorization': token,
                            },
                            url: urlStr,
                            type: 'GET',
                            error: function() {
                                callback('error');
                            },
                            success: function(res) {
                                callback(res.data.slice(0, 10));
                            }
                        });
                    },
                    onChange: function(value) {
                        if (attrs.onchange) {
//                            scope.$apply(function() {
                                if (value) {
                                    scope.values = value.join();

                                    // Check if there are subcategories associated
                                    $.ajax({
                                        headers: {
                                            'Authorization': 'Bearer ' + token_auth,
                                            'x-admin-authorization': token,
                                        },
                                        url: scope.$root.url + '/' + attrs.modelname + '?condition=AND&deletedAt=null&parent=' + scope.values,
                                        type: 'GET',
                                        success: function(res) {
                                            scope.$apply(function() {
                                                scope.subcats = res.data.length > 0;
                                                $rootScope.hasSubs = scope.subcats;
                                            });
                                        }
                                    });

                                } else {
                                    scope.$apply(function() {
                                        scope.values = "";
                                        scope.subcats = false;
                                    
                                        $rootScope.hasSubs = false;
                                    });
                                }
//                            });
                        }
                    },
//                    onItemRemove: function (value) {
//                        if (attrs.onchange) {
//                            if(value) {
//                        
//                                // Check if there are subcategories associated
//                                $.ajax({
//                                    headers: {
//                                        'Authorization': 'Bearer ' + token_auth,
//                                        'x-admin-authorization': token,
//                                    },
//                                    url: scope.$root.url + '/' + attrs.modelname + '?condition=AND&deletedAt=null&parent=' + value,
//                                    type: 'GET',
//                                    success: function(res) {
//                                        var subs_parent = [];
//                                        if(!!res.data && res.data.length > 0) {
//                                            $.each(res.data, function(key, value_data) {
//                                                subs_parent.push(value_data.id);
//                                            });
//                                            if(!!attrs.subcategories) {
//                                                var json_subs = JSON.parse(attrs.subcategories);
//                                                for (obj in json_subs) {
//                                                    if($.inArray(json_subs[obj], subs_parent) == 0) {
//                                                        console.log('incluido');
//                                                        delete attrs.subcategories[obj];
//                                                    }
//                                                }
////                                                $.each(json_subs, function(key, value_sub) {
////                                                    if($.inArray(value_sub, subs_parent) == 0) {
////                                                        console.log('incluido');
////                                                    }
//////                                                    if (self.items.indexOf(key) == -1) {
//////                                                        delete self.options[key];
//////                                                    }
////                                                });
//                                                
//                                            }
//                                        }
////                                        scope.$apply(function() {
////                                            scope.subcats = res.data.length > 0;
////                                            $rootScope.hasSubs = scope.subcats;
////                                        });
//                                    }
//                                });
//                            }
//                        }
//                    }
                };

                if (attrs.multiple) {
                    data_selectize.plugins = ['remove_button'];
                }

                var selectizes = $(element).selectize(data_selectize);

                attrs.$observe("model", function(newValue) {
                    if (!!newValue) {
                        setTimeout(function() {
                            try {
                                var jsonValue = angular.fromJson(newValue);
                                var selectize = selectizes[0].selectize;

                                if (Object.prototype.toString.call(jsonValue) === '[object Array]') {
                                    var options = [];
                                    var idOptions = [];
                                    for (var i = 0; i < jsonValue.length; i++) {
                                        var option = {
                                            id: jsonValue[i].id
                                        };
                                        var name = eval("jsonValue[i]." + attrs.key);
                                        option[attrs.key] = name;
                                        options.push(option);
                                        idOptions.push(jsonValue[i].id);
                                    }
                                    selectize.addOption(options);
                                    selectize.addItems(idOptions);
                                } else {
                                    var options = {
                                        id: jsonValue.id
                                    };
                                    var name = eval("jsonValue." + attrs.key);
                                    options[attrs.key] = name;
                                    selectize.addOption(options);
                                    selectize.addItem(jsonValue.id);
                                }

                            } catch (e) {

                            }

                        }, 500);
                    }
                });
            }

        };
    }]);

    app.directive('selectTwoDefault', ['$parse', function($parse, $scope) {

        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var selectize = $(element).selectize({
                    create: false,
                    placeholder: attrs.placeholder,
                })[0].selectize;

            }

        };
    }]);

    app.directive('selectStaticAjax', ['$parse', '$cookieStore', 'jwtHelper', '$location', function($parse, $cookieStore, jwtHelper, $location, $scope) {
        return {
            restrict: 'A',
            template: '<option value="{{ opt.id }}" ng-repeat="opt in options">{{ opt.name | translate }}</option>',
            link: function(scope, element, attrs, rootScope) {

                scope.options = [{
                    id: '',
                    name: 'Seleccione una opción'
                }];

                var token = $cookieStore.get('adminglob').currentUser.token;
                var token_auth = $cookieStore.get('globals').currentConsumer.token;

                if (jwtHelper.isTokenExpired(token)) {
                    $location.path('login');
                }

                $.ajax({
                    headers: {
                        'Authorization': 'Bearer ' + token_auth,
                        'x-admin-authorization': token,
                    },
                    url: scope.$root.url + '/' + attrs.modelname + '?deletedAt=null',
                    type: 'GET',
                    error: function() {
                    },
                    success: function(res) {
                        if (res.data) {
                            scope.options = scope.options.concat(res.data.slice(0, 10));
                        } else {
                            var data = [];
                            for (var i = 0; i < res.length; i++) {
                                data.push({
                                    id: res[i],
                                    name: res[i]
                                });
                            }
                            scope.options = scope.options.concat(data);
                        }
                    }
                });
            }
        };
    }]);

    /*  selectStaticAjax using selectize library!
     * TBD: Placeholder + on edit choose the selected model.
     return {
     restrict: 'A',
     link: function(scope, element, attrs) {
     
     scope.options = [];
     
     
     $.ajax({
     url: scope.$root.url + '/' + attrs.modelname,
     type: 'GET',
     error: function() {},
     success: function(res) {
     scope.options = scope.options.concat(res.data.slice(0, 10));
     console.dir(scope.options)
     scope.options = $.map(scope.options, function(elem) {
     return {
     text: elem.name,
     value: elem.id
     }
     })
     console.dir(scope.options)
     var selectize = $(element).selectize({
     placeholder: 'aaaa'
     })[0].selectize;
     selectize.addOption(scope.options)
     }
     });
     }
     };
     
     */


    app.directive('fileUpload', function() {
        return {
            scope: true, //create a new scope
            link: function(scope, el, attrs) {
                el.bind('change', function(event) {
                    var files = event.target.files;
                    //iterate files since 'multiple' may be specified on the element
                    for (var i = 0; i < files.length; i++) {
                        //emit event upward
                        scope.$emit("fileSelected", {
                            file: files[i]
                        });
                    }
                });
            }
        };
    });
    
    app.directive('restrictCharts', function() {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    var transformedInput = text.replace(/[^ a-zA-ZáäàéëèíïìóöòúüùÁÄÀÉËÈÍÏÌÓÖÒÚÜÙñÑ-]/g, '');
                    
                    if(transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;  // or return Number(transformedInput)
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        }; 
    });

    app.controller('ctrlUpload', ['$scope', 'fileUpload', function($scope, fileUpload, $rootScope) {
        $scope.uploadFile = function() {
            var file = $scope.file;
            var uploadUrl = $scope.url + "/files";
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
    }]);

    app.filter('urlEncode', [function() {
        return window.encodeURIComponent;
    }]);

    app.filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });

    app.filter('generalize', function() {
        return function(input) {
            return (input.slice(-1) == "a" || input.slice(-1) == "n") ? "A" : "AN";
        }
    });

    app.filter('selectedOption', function() {
        return function(element, tag) {
            // return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });

    app.filter('selectFilterArray', function() {
        return function(input, model) {

            /*
             var output;
             var modelSearch=scope.model[models].data;
             for (var i = 0; i < modelSearch.length; i++) {
             if(modelSearch[i].id==scope.model[model]){
             output=modelSearch[i].name
             }
             };
             return output;*/

            // return $("#" + model + " option:selected").text();

            var result = $.map($("#" + model + " option:selected"), function(el, i) {
                return $(el).text();
            });

            return result.join(', ');
        }

    });

    app.filter('truncString', function() {
        return function(input) {
            var add = '...';
            var max = 26;
            var str = input;
            return (typeof str === 'string' && str.length > max ? str.substring(0, max) + add : str);
        }
    });


    app.filter('md5', function() {
        return function(input) {
            var add = '...';
            var max = 26;
            var str = input;
            return md5(str);
        }
    });

    app.filter('inArray', function() {
        return function(array, value) {
            return array.indexOf(value) !== -1;
        };
    });

    app.directive("backButton", ["$window", function($window) {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                elem.bind("click", function(e) {
                    if (attrs.ngClick || attrs.href === '' || attrs.href == '#') {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    $window.history.back();
                    scope.$apply();

                });
            }
        };
    }]);

    app.directive("valueConfig", ["rest", function(rest) {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                if (attrs.model != '' && attrs.valueConfig != '') {
                    rest().findOne({
                        type: attrs.model,
                        id: attrs.valueConfig
                    }, function(resp) {
                        elem[0].textContent = resp.name;
                    });
                }
            }
        };
    }]);

    app.directive("checkbox", ["$window", function($window) {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                $(elem).iCheck({
                    checkboxClass: 'icheckbox_square-blue',
                    radioClass: 'iradio_square-blue',
                    increaseArea: '20%' // optional
                });
            }
        };
    }]);

    app.directive("addOptionButton", ["$window", function($window) {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                elem.bind("click", function() {


                    var option = $("#option1").html();

                    $(".extraoptionals").append('<div class="form-group" id="option1">' + option + '</div>');
                    scope.$apply();

                });
            }
        };
    }]);

    app.directive('confirmClick', function($window) {
        var i = 0;
        return {
            restrict: 'A',
            priority: 1,
            compile: function(tElem, tAttrs) {
                var fn = '$$confirmClick' + i++,
                    _ngClick = tAttrs.ngClick;
                tAttrs.ngClick = fn + '($event)';

                return function(scope, elem, attrs) {
                    var confirmMsg = attrs.confirmClick || 'Are you sure?';

                    scope[fn] = function(event) {
                        if ($window.confirm(confirmMsg)) {
                            scope.$eval(_ngClick, {
                                $event: event
                            });
                        }
                    };
                };
            }
        };
    });

    app.directive('svgImg', function($rootScope, $cookieStore, jwtHelper, $location) {
        return {
            restrict: 'A',
            scope: {
                svgImg: '='
            },
            link: function(scope, element, attrs) {
                var $element = jQuery(element);
                var attributes = $element.prop("attributes");

                var hoverColor = "#FFb600";
                if ($("link[href='css/theme-marca-ba.css']").length) {
                    hoverColor = "rgba(32, 149, 242, 0.8)";
                }

                var token = $cookieStore.get('adminglob').currentUser.token;
                var token_auth = $cookieStore.get('globals').currentConsumer.token;

                if (jwtHelper.isTokenExpired(token)) {
                    $location.path('login');
                }

                $.ajax({
                    headers: {
                        'Authorization': 'Bearer ' + token_auth,
                        'x-admin-authorization': token,
                    },
                    type: 'GET',
                    dataType: 'xml',
                    url: $rootScope.url + '/categories/' + scope.svgImg + '/image',
                    success: function(data) {
                        // Get the SVG tag, ignore the rest
                        var $svg = jQuery(data).find('svg');

                        // Remove any invalid XML tags
                        $svg = $svg.removeAttr('xmlns:a');

                        // Loop through IMG attributes and apply on SVG
                        $.each(attributes, function() {
                            $svg.attr(this.name, this.value);
                        });

                        // Replace IMG with SVG
                        $element.append($svg);

                        // Removes opacity
                        $element.find("g[opacity='0.75']").css("opacity", 0);

                        if (attrs.active == "true") {
                            $element.find("path, polygon, circle, rect").attr("fill", hoverColor);
                            $element.find("path, polygon, circle, rect").attr("stroke", hoverColor);
                            $element.css("color", hoverColor);
                        }

                    }
                });
            }
        };
    });

    app.filter('filterIfGuestUser', function ($rootScope, ROLES) {
        return function (models) { 
            var userObj = $rootScope.adminglob.currentUser;

            if (!userObj || userObj.role !== ROLES.GUEST) {
                return models;
            } else {
                return _.filter(models, function(model) {
                    return model.createdBy.id === userObj.user;
                });
            }
        };
    });

    app.directive('showPolicyIfGuestUser', function ($rootScope, ROLES, $q) {
        return {
            restrict: 'A',
            scope: '=model',
            link: function (scope, element, attrs) {
                var user = $rootScope.adminglob.currentUser;

                $q.when(scope.model.$promise || scope.model).then(function(model) {
                    // TODO: Don't use hardcoded IDs
                    // oWRhpRV --> Under review
                    // pWRhpRV -- rejected
                    // nWRhpRV --> draft
                    
                    if(user.role === ROLES.GUEST && model.status.id !== 'oWRhpRV' &&
                        model.status.id !== 'pWRhpRV' && model.status.id !== 'nWRhpRV') {
                        element.css('display', 'none');
                    }
                });
            }
        };
    });

    app.directive('hrefPolicyIfGuestUser', function ($rootScope, ROLES, $q) {
        return {
            restrict: 'A',
            scope: '=model',
            link: function (scope, element, attrs) {
                element.bind("click", function(e) {
                    var user = $rootScope.adminglob.currentUser;

                    if(user.role === ROLES.GUEST) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                
            }
        };
    });
})();