(function() {
    var app = angular.module('odin', ["odin.config",
        "ngRoute",
        "Alertify",
        "ngFlash",
        "ui.bootstrap",
        "localize",
        "ckeditor",
        "ngMessages",
        "ngCookies",
        "ngResource",
        "ngProgress",
        "odin.controllers",
        "store-directives",
        "store-factories",
        "bw.paging",
        "color.picker",
        "leaflet-directive",
        "datePicker",
        "angularSpinner",
        "chart.js",
        "ngRoute.middleware",
        "consumer-service",
        "validation.match",
        "angular-jwt"]);

    app.config(function($routeProvider, $httpProvider, $translateProvider, usSpinnerConfigProvider, ChartJsProvider, ConsumerServiceProvider, $middlewareProvider, jwtOptionsProvider) {

        jwtOptionsProvider.config({
            unauthenticatedRedirectPath: '/login',
//            tokenGetter: ['$rootScope', '$cookieStore', function($rootScope, $cookieStore, jwtHelper) {
//                    $rootScope.globals = $cookieStore.get('globals') || {};
//                    console.log($rootScope.globals.currentUser.token);
//                    console.log($rootScope.globals.currenConsumer.token);
//                    if (jwtHelper.isTokenExpired($rootScope.globals.currentUser.token)) {
//                        console.log('expirated');
//                    }
//                    return $rootScope.globals.currentUser.token;
//                }],
            whiteListedDomains: ['localhost']
        });

        $httpProvider.interceptors.push('jwtInterceptor');

        ChartJsProvider.setOptions({
            tooltips: {
                callbacks: {
                    title: function(tooltipItem, data) {
                        return data.labels[tooltipItem[0].index];
                    },
                    label: function(tooltipItem, data) {
                        var label = 'Cantidad';
                        if (!!data.datasets[tooltipItem.datasetIndex][0] && data.datasets[tooltipItem.datasetIndex][0] != '') {
                            label = data.datasets[tooltipItem.datasetIndex][0];
                        }
                        return label + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    }
                }
            }
        });

        usSpinnerConfigProvider.setDefaults({
            lines: 10 // The number of lines to draw
            ,
            length: 40 // The length of each line
            ,
            width: 20 // The line thickness
            ,
            radius: 49 // The radius of the inner circle
            ,
            scale: 0.35 // Scales overall size of the spinner
            ,
            corners: 1 // Corner roundness (0..1)
            ,
            color: '#ff386a' // #rgb or #rrggbb or array of colors
            ,
            opacity: 0.3 // Opacity of the lines
            ,
            rotate: 5 // The rotation offset
            ,
            direction: 1 // 1: clockwise, -1: counterclockwise
            ,
            speed: 1 // Rounds per second
            ,
            trail: 63 // Afterglow percentage
            ,
            fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            ,
            zIndex: 2e9 // The z-index (defaults to 2000000000)
            ,
            className: 'spinner' // The CSS class to assign to the spinner
            ,
            top: '50%' // Top position relative to parent
            ,
            left: '50%' // Left position relative to parent
            ,
            shadow: false // Whether to render a shadow
            ,
            hwaccel: false // Whether to use hardware acceleration
            ,
            position: 'fixed' // Element positioning
        });

        $routeProvider
                .when("/", {
                    templateUrl: "home.html",
                    controller: controllerHome
                })
                .when("/login", {
                    templateUrl: "login.html",
                    controller: LoginController
                })
                // .when("/config", {
                //     templateUrl: "config.html",
                // })
                //// user Routes
                .when("/users", {
                    templateUrl: "views/user/list.html",
                    controller: UserListController
                }).when("/users/:id/view", {
            templateUrl: "views/user/view.html",
            controller: UserViewController
        }).when("/users/new", {
            templateUrl: "views/user/add.html",
            controller: UserCreateController
        }).when("/users/:id/edit", {
            templateUrl: "views/user/edit.html",
            controller: UserEditController
        })
                //// end user Routes
                //// user Organizations
                .when("/organizations", {
                    templateUrl: "views/organization/list.html",
                    controller: OrganizationListController
                }).when("/organizations/:id/view", {
            templateUrl: "views/organization/view.html",
            controller: OrganizationViewController
        }).when("/organizations/new", {
            templateUrl: "views/organization/add.html",
            controller: OrganizationCreateController
        }).when("/organizations/:id/edit", {
            templateUrl: "views/organization/edit.html",
            controller: OrganizationEditController
        })
                //// end user Organizations
                ////  Status
                .when("/statuses", {
                    templateUrl: "views/status/list.html",
                    controller: StatusListController
                }).when("/statuses/:id/view", {
            templateUrl: "views/status/view.html",
            controller: StatusViewController
        }).when("/statuses/new", {
            templateUrl: "views/status/add.html",
            controller: StatusCreateController
        }).when("/statuses/:id/edit", {
            templateUrl: "views/status/edit.html",
            controller: StatusEditController
        })
                //// end  Status
                ////  File type
                .when("/filetypes", {
                    templateUrl: "views/filetype/list.html",
                    controller: FileTypeListController
                }).when("/filetypes/:id/view", {
            templateUrl: "views/filetype/view.html",
            controller: FileTypeViewController
        }).when("/filetypes/new", {
            templateUrl: "views/filetype/add.html",
            controller: FileTypeCreateController
        }).when("/filetypes/:id/edit", {
            templateUrl: "views/filetype/edit.html",
            controller: FileTypeEditController
        })
                //// file type
                ////  Tags
                .when("/tags", {
                    templateUrl: "views/tag/list.html",
                    controller: TagListController
                }).when("/tags/:id/view", {
            templateUrl: "views/tag/view.html",
            controller: TagViewController
        }).when("/tags/new", {
            templateUrl: "views/tag/add.html",
            controller: TagCreateController
        }).when("/tags/:id/edit", {
            templateUrl: "views/tag/edit.html",
            controller: TagEditController
        })
                //// file type
                ////  Frequency
                .when("/updatefrequencies", {
                    templateUrl: "views/updatefrequency/list.html",
                    controller: updateFrequencyListController
                }).when("/updatefrequencies/:id/view", {
            templateUrl: "views/updatefrequency/view.html",
            controller: updateFrequencyViewController
        }).when("/updatefrequencies/new", {
            templateUrl: "views/updatefrequency/add.html",
            controller: updateFrequencyCreateController
        }).when("/updatefrequencies/:id/edit", {
            templateUrl: "views/updatefrequency/edit.html",
            controller: updateFrequencyEditController
        })
                //// Frequency
                ////  File
                .when("/files", {
                    templateUrl: "views/file/list.html",
                    controller: FileListController
                }).when("/files/:id/view", {
            templateUrl: "views/file/view.html",
            controller: FileViewController
        }).when("/files/new/:dataset?", {
            templateUrl: "views/file/add.html",
            controller: FileCreateController
        }).when("/files/:id/edit", {
            templateUrl: "views/file/edit.html",
            controller: FileEditController
        })
                //// file


                ////  Databases
                .when("/databases", {
                    templateUrl: "views/database/list.html",
                    controller: DatabaseListController
                }).when("/databases/:id/view", {
            templateUrl: "views/database/view.html",
            controller: DatabaseViewController
        }).when("/databases/new", {
            templateUrl: "views/database/add.html",
            controller: DatabaseCreateController
        }).when("/databases/:id/edit", {
            templateUrl: "views/database/edit.html",
            controller: DatabaseEditController
        })
                //// Databases
                ////  Categories
                .when("/categories", {
                    templateUrl: "views/category/list.html",
                    controller: CategoryListController
                }).when("/categories/:id/view", {
            templateUrl: "views/category/view.html",
            controller: CategoryViewController
        }).when("/categories/new", {
            templateUrl: "views/category/add.html",
            controller: CategoryCreateController
        }).when("/categories/:id/edit", {
            templateUrl: "views/category/edit.html",
            controller: CategoryEditController
        })
                //// Categories
                ////  Datasets
                .when("/datasets/:id/view", {
                    templateUrl: "views/dataset/view.html",
                    controller: DatasetViewController
                }).when("/datasets/new", {
            templateUrl: "views/dataset/add.html",
            controller: DatasetCreateController
        }).when("/datasets/:id/edit", {
            templateUrl: "views/dataset/edit.html",
            controller: DatasetEditController
        })
                .when("/datasets/:filter?", {
                    templateUrl: "views/dataset/list.html",
                    controller: DatasetListController
                })
                // Maps
                .when("/maps", {
                    templateUrl: "views/map/list.html",
                    controller: MapListController
                })
                .when("/maps/:id/view", {
                    templateUrl: "views/map/view.html",
                    controller: MapViewController
                })
                .when("/maps/new/:file", {
                    templateUrl: "views/map/add.html",
                    controller: MapCreateController
                })
                .when("/maps/:id/edit", {
                    templateUrl: "views/map/edit.html",
                    controller: MapEditController
                })
                .when("/maps/preview/:id", {
                    templateUrl: "views/map/preview.html",
                    controller: MapPreviewController
                })

                // Charts
                .when("/charts", {
                    templateUrl: "views/chart/list.html",
                    controller: ChartListController
                })
                .when("/charts/:id/view", {
                    templateUrl: "views/chart/view.html",
                    controller: ChartViewController
                })
                .when("/charts/new/:file", {
                    templateUrl: "views/chart/add.html",
                    controller: ChartCreateController
                })
                .when("/charts/:id/edit", {
                    templateUrl: "views/chart/edit.html",
                    controller: ChartEditController
                })
                .when("/charts/preview/:id", {
                    templateUrl: "views/chart/preview.html",
                    controller: ChartPreviewController
                })

                // Configs
                .when("/configs", {
                    templateUrl: "views/config/list.html",
                    controller: ConfigListController
                })
                .when("/configs/:id/view", {
                    templateUrl: "views/config/view.html",
                    controller: ConfigViewController
                })
                .when("/configs/new", {
                    templateUrl: "views/config/add.html",
                    controller: ConfigCreateController
                })
                .when("/configs/:id/edit", {
                    templateUrl: "views/config/edit.html",
                    controller: ConfigEditController
                })

                // Basemaps
                .when("/basemaps", {
                    templateUrl: "views/basemap/list.html",
                    controller: BasemapListController
                })
                .when("/basemaps/:id/view", {
                    templateUrl: "views/basemap/view.html",
                    controller: BasemapViewController
                })
                .when("/basemaps/new", {
                    templateUrl: "views/basemap/add.html",
                    controller: BasemapCreateController
                })
                .when("/basemaps/:id/edit", {
                    templateUrl: "views/basemap/edit.html",
                    controller: BasemapEditController
                })

                // Importer
                .when("/importer", {
                    templateUrl: "views/importer/import.html",
                    controller: ImporterCreateController
                })
                .when("/importer/result", {
                    templateUrl: "views/importer/result.html",
                    controller: ImporterResultController
                })

                .otherwise({
                    redirectTo: '/'
                });

        $auth = ConsumerServiceProvider.$get('ConsumerService');

        $middlewareProvider.map({
            /** Let everyone through */
            'everyone': ['$cookieStore', '$rootScope', '$http', 'jwtHelper', function everyoneMiddleware($cookieStore, $rootScope, $http, jwtHelper) {
                    $rootScope.globals = $cookieStore.get('globals') || {};
                    if ($rootScope.globals.currentConsumer) {
                        if (jwtHelper.isTokenExpired($rootScope.globals.currentConsumer.token)) {
                            $auth.Login($auth.Consumer, function(response) {
                                if (!response.code) {
                                    $auth.SetCredentials(response.data);
                                    this.next();
                                }
                            }.bind(this));
                        } else {
                            $http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.currentConsumer.token; // jshint ignore:line
                            this.next();
                        }
                    } else {
                        //$http.defaults.headers.common['Authorization'] = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI5OWFmYzU3ZmRiYzA0YzZjYjJkZDRiYTU2OTBlNDM0NiJ9.Uo0I98Fu3BX8XlOgSnIvfeFx2Z_LdqM8WNT4hSMdDDM';
                        $auth.Login($auth.Consumer, function(response) {
                            if (!response.code) {
                                $auth.SetCredentials(response.data);
                                this.next();
                            }
                        }.bind(this));
                    }

                }],
            'x-admin': ['$cookieStore', '$rootScope', '$http', '$location', 'jwtHelper', function everyoneMiddleware($cookieStore, $rootScope, $http, $location, jwtHelper) {
                    $rootScope.globals = $cookieStore.get('globals') || {};
                    if ($rootScope.globals.currentUser) {
                        if (jwtHelper.isTokenExpired($rootScope.globals.currentUser.token)) {
                            this.redirectTo('login');
                            this.next();
                        } else {
                            $http.defaults.headers.common['x-admin-authorization'] = $rootScope.globals.currentUser.token; // jshint ignore:line
                            this.next();
                        }
                    } else {
                        var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
                        var loggedIn = $rootScope.globals.currentUser;
                        if (restrictedPage && !loggedIn) {
                            this.redirectTo('login');
                        } else {
                            this.next();
                        }
                    }

                }],
        });

        $middlewareProvider.global(['everyone', 'x-admin']);
    });
    app.run(run);

    function run($rootScope, EnvironmentConfig, authManager) {
        $rootScope.url = EnvironmentConfig.api;
        authManager.redirectWhenUnauthenticated();
        $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
            $rootScope.actualUrl = current.$$route.originalPath;
        });
    }
})();