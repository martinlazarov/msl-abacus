var App = angular.module('App', [
    'utils',
    'calculator'
]);
App.controller('MainCtrl', ['$scope', '$rootScope', '$localStorage', function($scope, $rootScope, $localStorage){
    $scope.saved = $localStorage.getArray('savedResults');
    $rootScope.$on('calc:saved-result', function(e, savedItems){
        $scope.saved = savedItems;
    });
}])

angular.module('utils', [])
.factory('Utils', [function(){
    return {
        getLastChar: function(input){
            var string = input.toString();
            return string.slice(-1);
        },
        removeLastChar: function(string){
            return string.slice(0, -1);
        },
        cleanBadChars: function(input){
            var string = input.toString();
            
            string = string.replace(/([a-z\s]+)/gi, '');
            return string;
        },
        isLastCharOperator: function(operators, input){
            input = input.toString();

            return angular.isDefined(operators[this.getLastChar(input)]);
        },
        isDivisionByZero: function(input){
            var string = input.toString();
            if(string.match(/([0-9]+)(\/0)/gi, '')){
                return true;
            }
            else{
                return false;
            }
        }
    }
}])
.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        setArray: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getArray: function(key) {
            return JSON.parse($window.localStorage[key] || '[]');
        }
    };
}]);

angular.module('calculator', [
    'utils'
])
.directive('calculator', function($rootScope, Utils, $localStorage){
    return {
        restrict: 'AE',
        scope: {
            mode: '@'
        },
        template: [
            '<div class="col-md-12 calculator">',
                '<input type="text" ng-model="data.result" class="form-control" disabled />',
                '<button type="button" class="btn btn-warning col-md-8 col-md-offset-2 mt5 save-result" ng-click="saveResult()">Save</button>',
                '<div class="row">',
                    '<div class="col-md-8">',
                        '<div class="row">',
                            '<div class="col-md-12">',
                                '<button type="button" class="btn btn-default col-md-4 mt5 remove-last" ng-click="removeLastChar()"><-</button>',
                                '<button type="button" class="btn btn-default col-md-4 mt5 clear" ng-click="clearResult()">C</button>',
                            '</div>',
                        '</div>',
                        '<button class="btn btn-primary mt5 digit" ',
                            'ng-repeat="number in data.numbers"',
                            'ng-class="{\'col-md-8\': number == 0, \'col-md-4\': number != 0}"',
                            'ng-click="addNumber(number)"',
                            'ng-bind="::number"></button>',
                    '</div>',
                    '<div class="col-md-4 no-padding">',
                        '<button class="btn btn-primary col-md-6 mt5 operator"',
                            'ng-repeat="(operator, value) in data.operators"',
                            'ng-click="triggerOperation(operator)"',
                            'ng-bind="::operator"></button>',
                        '<button class="btn btn-success col-md-12 mt5 equal" ng-click="doTheMath()">=</button>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''),
        // templateUrl: 'tpls/calculator.tpl.html',
        link: function(scope){
            var basicOperation = function(op, input){
                scope.data.result += op;
                return scope.data.result;
            }
            scope.data = {
                result: '',
                small: '',
                numbers: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, '.'],
                operators: {
                    '/': {
                        fn: basicOperation,
                        args: '/'
                    },
                    '*': {
                        fn: basicOperation,
                        args: '*'
                    },
                    '-': {
                        fn: basicOperation,
                        args: '-'
                    },
                    '+': {
                        fn: basicOperation,
                        args: '+'
                    }
                },
                advancedOperators: {
                    'sqrt': {
                        fn: function(){

                        }
                    },
                    'n!': {
                        fn: function(){

                        }
                    },
                    'sin': {
                        fn: function(){

                        }
                    },
                    'cos': {
                        fn: function(){

                        },
                    },
                    'tan': {
                        fn: function(){

                        },
                    }
                }
            };
            // var isAfterOperator = false;
            if (scope.mode === 'advanced') {
                angular.extend(scope.data.operators, scope.data.advancedOperators);
            }

            var operationsHandler = function(operationId){
                var action = scope.data.operators[operationId] || actions['default'];
                action.fn.apply(scope, [action.args]);
            }
            function advancedCalculation(input, operation){
                debugger;
                var result = input;
                if (operation === 'sin') {
                    return Math.sin(input);
                }
                else if(operation === 'cos'){
                    return Math.cos(input);
                }
                else if(operation === 'tan'){
                    return Math.tan(input);
                }
                else if(operation === 'sqrt'){
                    return Math.pow(doTheMath(), 2);
                }
                else if(operation === 'n!'){
                    var result = 1;
                    input = Math.round(input);

                    for (var i = 2; i <= input; i++)
                        result = result * i;
                    return result;
                }
                console.error('[advancedCalculation]', arguments);
                return result;
            }

            var addNumber = function(number){
                var str = number.toString();
                if (str === '.' && (scope.data.result.length === 0 || str === Utils.getLastChar(scope.data.result))) {
                    return false;
                }

                scope.data.result += str;
            };
            var triggerOperation = function(opt){
                if (scope.data.result.length === 0) {
                    return false;
                }
                
                if (Utils.isLastCharOperator(scope.data.operators, scope.data.result) === true) {
                    scope.data.result = scope.data.result.slice(0, -1) + opt;
                }
                else{
                    operationsHandler(opt);
                }
            };
            var doTheMath = function(){
                if (scope.data.result.length === 0) {
                    return false;
                }

                if (Utils.isLastCharOperator(scope.data.operators, scope.data.result) === true) {
                    scope.data.result = Utils.removeLastChar(scope.data.result);
                }

                var cleanExpression = Utils.cleanBadChars(scope.data.result);
                if (cleanExpression.length > 0) {
                    if (Utils.isDivisionByZero(cleanExpression)) {
                        alert('Division by zero!');
                        return 0;
                    }
                    scope.data.result = eval(cleanExpression).toString();
                }
                else{
                    scope.data.result = 0;
                }


                return scope.data.result;
            };
            var saveResult = function(){
                if (scope.data.result.length === 0) {
                    return false;
                }

                var savedResults = $localStorage.getArray('savedResults');
                savedResults.push(scope.data.result);
                $localStorage.setArray('savedResults', savedResults);

                $rootScope.$emit('calc:saved-result', savedResults);
            };
            var clearResult = function(){
                scope.data.result = '';
            }
            var removeLastChar = function(){
                scope.data.result = Utils.removeLastChar(scope.data.result);
            }

            angular.extend(scope, {
                addNumber: addNumber,
                triggerOperation: triggerOperation,
                doTheMath: doTheMath,
                saveResult: saveResult,
                clearResult: clearResult,
                removeLastChar: removeLastChar
            });
        }
    }
});