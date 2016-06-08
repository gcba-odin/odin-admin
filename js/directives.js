(function() {
    var app = angular.module('store-directives', ["store-directives-home"]);


     app.directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                  
                  element.bind('change', function(){
                     scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
         }]);
           app.directive('selectTwoTags', ['$parse', function ($parse,$scope) {
            return {
               restrict: 'A',

               link: function(scope, element, attrs) {
                    $(element).selectize()[0].selectize.destroy();

                  var selectize = $(element).selectize({
                      plugins: ['remove_button'],
                      delimiter: ',',
                      create: false,
                      valueField: 'id',
                      placeholder:attrs.placeholder,
                      labelField: 'name',
                  })[0].selectize;

                                       
                scope.$watch('tagsmodel', function(newValue, oldValue) {
                  attrs.$observe('tagsmodel', function(value)
                  {
                    if(value){
                       var json=angular.fromJson(value);
                    setTimeout(function(){ selectize.addOption(json); }, 300);

                    }
                  })

                })
                scope.$watch('tagsmodel', function(newValue, oldValue) {
                  attrs.$observe('tagsselected', function(value)
                  {
                    if(value){
                    var json=angular.fromJson(value);
                    setTimeout(function(){ selectize.setValue(json); }, 700);

                    
                    }
                  })                   
                });
                
               }
            };
         }]);
          app.directive('selectTwo', ['$parse', function ($parse,$scope) {
            return {
               restrict: 'A',

               link: function(scope, element, attrs) {
                  setTimeout(function(){
                   var selectize = $(element).selectize({
                      create: false,
                      placeholder:attrs.placeholder
                    })[0].selectize;
                   }, 1000);

               }                   

            };
         }]);



          app.directive('selectTwoAjax', ['$parse','$timeout', function ($timeout,$parse,$scope,$rootScope) {
            return {
               restrict: 'A',
                    scope: {
                    modelValue: '@ngModel'
                  },
               link: function(scope, element, attrs,rootScope) {
                var selectizes = $(element).selectize({
                    valueField: 'id',
                    labelField: attrs.key,
                    searchField: attrs.key,
                    placeholder:attrs.placeholder,
                    create: true,
                    render: {
                        option: function(item, escape) {
                          var name=eval("item."+attrs.key);
                            return '<div>' +
                                '<span class="title">' +
                                    '<span class="name">' + escape(name) + '</span>' +
                                '</span><br>' +
                            '</div>';
                        }
                    },
                    load: function(query, callback) {
                      this.settings.load = null;
                        if (!query.length) return callback();
                        $.ajax({
                            url: scope.$root.url+'/'+attrs.modelname+'?where={"'+attrs.key+'":{"contains":"'+encodeURIComponent(query)+'"}}',
                            type: 'GET',
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                              callback(res.data.slice(0, 10));
                            }
                        });
                    }
                });
                attrs.$observe("model", function (newValue) {
                    if(!!newValue){
                      setTimeout(function(){
                        try {
                          var  jsonValue=angular.fromJson(newValue);
                          var selectize = selectizes[0].selectize;


                          if(Object.prototype.toString.call(jsonValue) === '[object Array]'){
                            var options=[];
                            var idOptions=[];
                            for (var i = 0; i < jsonValue.length; i++) {
                              var option={id: jsonValue[i].id};
                              var name=eval("jsonValue[i]."+attrs.key);
                              option[attrs.key]=name;
                              options.push(option);
                              idOptions.push(jsonValue[i].id);
                            }
                            selectize.addOption(options);
                            selectize.addItems(idOptions);
                          }else{
                            var options={id: jsonValue.id};
                            var name=eval("jsonValue."+attrs.key);
                            options[attrs.key]=name;
                            selectize.addOption(options);
                            selectize.addItem(jsonValue.id);
                          }

                        } catch (e) {
                            console.log(e);
                        }
                      
                      }, 500);
                    }
                  });
               }                    

            };
         }]);

          app.directive('selectTwoDefault', ['$parse', function ($parse,$scope) {
            return {
               restrict: 'A',

               link: function(scope, element, attrs) {
                   var selectize = $(element).selectize({
                      create: false,
                      placeholder:attrs.placeholder
                    })[0].selectize;

               }                   

            };
         }]);




         app.directive('fileUpload', function () {
            return {
                scope: true,        //create a new scope
                link: function (scope, el, attrs) {
                    el.bind('change', function (event) {
                        var files = event.target.files;
                        //iterate files since 'multiple' may be specified on the element
                        for (var i = 0;i<files.length;i++) {
                            //emit event upward
                            scope.$emit("fileSelected", { file: files[i] });
                        }                                       
                    });
                }
            };
          });
      
         app.controller('ctrlUpload', ['$scope', 'fileUpload', function($scope, fileUpload,$rootScope){
            $scope.uploadFile = function(){
               var file = $scope.file;
               var uploadUrl = $scope.url+"/files";
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

        app.filter('selectedOption', function() {
        return function(element, tag) {
         // return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });



    app.filter('truncString', function() {
        return function(input) {
         var  add =  '...';
         var  max=26;
         var str=input;
           return (typeof str === 'string' && str.length > max ? str.substring(0,max)+add : str);
        }
    });


    app.filter('md5', function() {
        return function(input) {
         var  add =  '...';
         var  max=26;
         var str=input;
           return md5(str);
        }
    });

    app.directive("backButton", ["$window", function ($window) {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                elem.bind("click", function (e) {
                    if (attrs.ngClick || attrs.href === '' || attrs.href == '#'){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    $window.history.back();
                    scope.$apply();
                   
                });
            }
        }; 
    }]);

        app.directive("checkbox", ["$window", function ($window) {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                 $(elem).iCheck({
                  checkboxClass: 'icheckbox_square-blue',
                  radioClass: 'iradio_square-blue',
                  increaseArea: '20%' // optional
                });
            }
        }; 
    }]);

   


    app.directive("addOptionButton", ["$window", function ($window) {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                elem.bind("click", function () {
                 

                  var option=$("#option1").html();

                  $(".extraoptionals").append('<div class="form-group" id="option1">'+option+'</div>');
                    scope.$apply();

                });
            }
        };
    }]);

app.directive('confirmClick', function ($window) {
  var i = 0;
  return {
    restrict: 'A',
    priority:  1,
    compile: function (tElem, tAttrs) {
      var fn = '$$confirmClick' + i++,
          _ngClick = tAttrs.ngClick;
      tAttrs.ngClick = fn + '($event)';

      return function (scope, elem, attrs) {
        var confirmMsg = attrs.confirmClick || 'Are you sure?';

        scope[fn] = function (event) {
          if($window.confirm(confirmMsg)) {
            scope.$eval(_ngClick, {$event: event});
          }
        };
      };
    }
  };
});



})();


