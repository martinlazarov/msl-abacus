describe("A suite", function() {
    var scope,
        ctrl;

    beforeEach(module('App'));
    describe('MainCtrl', function() {
        beforeEach(inject(function(_$controller_){
            $controller = _$controller_;
        }));
        it("contains spec with an expectation", function() {
            var $scope = {};
            var controller = $controller('MainCtrl', { $scope: $scope });
            expect(controller).toBeDefined();
        });
    });
    describe('Calculator', function() {

        var element, compiled, scope, rootScope, localStorage;
        var _buildExpression = function(){
            var scopeData = compiled.isolateScope().data,
                digits = compiled.find('.digit'),
                operators = compiled.find('.operator'),
                firstNumber = digits[5], // 4
                choosenOperator = operators[1], // *
                secondNumber = digits[4], // 5
                expression = firstNumber.innerText + choosenOperator.innerText + secondNumber.innerText; // 4*5

            firstNumber.click();
            choosenOperator.click();
            secondNumber.click();

            return expression;
        };
        
        var $httpBackend;
        beforeEach(inject(function($injector, $compile, $rootScope, $templateCache, $localStorage){
            localStorage = $localStorage;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            element = angular.element('<calculator class="col-md-4"></calculator>');
            // element = angular.element('<calculator class="col-md-4" mode="advanced"></calculator>');
            compiled = $compile(element)(scope);
            scope.$digest();
        }));

        it("should have compiled html", function() {
            expect(compiled.html()).not.toEqual('');
        });
        it("should have data object and operators and advancedOperators arrays", function() {
            var scopeData = compiled.isolateScope().data;

            expect(scopeData).toBeDefined();
            expect(scopeData.operators).toBeDefined();
            expect(scopeData.advancedOperators).toBeDefined();
        });

        it("should have 10 digits", function() {

            var digitsButtonsCount = 0,
                numbers = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, '.'];

            angular.forEach(compiled.find('button'), function(button){
                if(angular.element(button).hasClass('digit')){
                    digitsButtonsCount++;
                }
            });
            expect(digitsButtonsCount).toEqual(numbers.length); // 0-9 and . (dot)
        });

        it("should have 4 basic operators", function() {
            var scopeData = compiled.isolateScope().data;
            var operatorsButtonsCount = 0,
                operatorsCount = Object.keys(scopeData.operators).length;

            angular.forEach(compiled.find('button'), function(button){
                if(angular.element(button).hasClass('operator')){
                    operatorsButtonsCount++;
                }
            });
            expect(operatorsCount).toEqual(4); // + - * /
            expect(operatorsButtonsCount).toEqual(operatorsCount); // + - * /
        });

        it("should build an expression", function() {
            
            var scopeData = compiled.isolateScope().data,
                expression = _buildExpression();

            expect(scopeData.result).toEqual(expression);
        });

        it("should resolve the expression", function() {
            
            var scopeData = compiled.isolateScope().data,
                expression = _buildExpression(),
                equalButton = compiled.find('.equal'),
                result;

            equalButton.click();
            expect(parseFloat(scopeData.result)).toEqual(eval(expression));
        });

        it("should clear the expression", function() {
            var scopeData = compiled.isolateScope().data,
                expression = _buildExpression(),
                clearButton = compiled.find('.clear');

            expect(scopeData.result).toEqual(expression); // Should have proper expression
            clearButton.click();
            expect(scopeData.result).toBe(''); // Should have empty expression
        });

        it("should remove the last character from the expression", function() {
            var scopeData = compiled.isolateScope().data,
                expression = _buildExpression(),
                removeLastButton = compiled.find('.remove-last');

            expect(scopeData.result).toEqual(expression); // Should have proper expression
            removeLastButton.click();
            expect(scopeData.result).toEqual(expression.slice(0, expression.length - 1)); // Should have empty expression
        });

        it("should show alert when try division by zero", function() {
            var scopeData = compiled.isolateScope().data,
                equalButton = compiled.find('.equal');

            scopeData.result = '5/0';

            spyOn(window, 'alert');
            equalButton.click();
            expect(window.alert).toHaveBeenCalled();
        });


        it("should save the result", function() {

            var scopeData = compiled.isolateScope().data,
                expression = _buildExpression(),
                equalButton = compiled.find('.equal'),
                saveButton = compiled.find('.save-result'),
                beforeSave = localStorage.getArray('savedResults'),
                afterSave = [];

            equalButton.click();
            saveButton.click();

            afterSave = localStorage.getArray('savedResults');

            expect(afterSave.length).toBeGreaterThan(beforeSave.length);
            expect(afterSave.pop()).toEqual(scopeData.result);
        });
    });



    describe('Calculator - advanced', function() {

        var element, compiled, scope;

        beforeEach(inject(function($injector, $compile, $rootScope, $templateCache){
            scope = $rootScope.$new();
            element = angular.element('<calculator class="col-md-4" mode="advanced"></calculator>');
            // element = angular.element('<calculator class="col-md-4" mode="advanced"></calculator>');
            compiled = $compile(element)(scope);
            scope.$digest();
        }));

        it("should have compiled html", function() {
            expect(compiled.html()).not.toEqual('');
        });
        it("should have data object and operators and advancedOperators arrays", function() {
            var scopeData = compiled.isolateScope().data,
                advancedOperatorsCount = Object.keys(scopeData.advancedOperators).length;


            expect(scopeData).toBeDefined();
            expect(scopeData.operators).toBeDefined();
            expect(scopeData.advancedOperators).toBeDefined();
            expect(advancedOperatorsCount).toEqual(5);
        });
        it("should have all advanced math buttons", function() {
            var scopeData = compiled.isolateScope().data,
                advancedOperatorsCount = Object.keys(scopeData.advancedOperators).length,
                advancedOperators = compiled.find('.advanced-operator');

            expect(advancedOperators.length).toEqual(advancedOperatorsCount);
        });


        it("should solve exponent", function() {
            var scopeData = compiled.isolateScope().data,
                number = 5,
                firstNumber = compiled.find('.digit:contains("'+ number +'")'),
                sqrtOperatorButton = compiled.find('.advanced-operator:contains("sqrt")');

                firstNumber.click();
                sqrtOperatorButton.click();
            
            expect(scopeData.result).toEqual(Math.pow(number, 2));
        });
        it("should solve factorial", function() {
            var scopeData = compiled.isolateScope().data,
                number = 5,
                result = 1,
                firstNumber = compiled.find('.digit:contains("'+ number +'")'),
                factorialOperatorButton = compiled.find('.advanced-operator:contains("n!")');

                firstNumber.click();
                factorialOperatorButton.click();
            
            for (var i = 2; i <= number; i++)
                result = result * i;

            expect(scopeData.result).toEqual(result);
        });
        it("should solve sine", function() {
            var scopeData = compiled.isolateScope().data,
                number = 5,
                result = 1,
                firstNumber = compiled.find('.digit:contains("'+ number +'")'),
                sinOperatorButton = compiled.find('.advanced-operator:contains("sin")');

                firstNumber.click();
                sinOperatorButton.click();

            expect(scopeData.result).toEqual(Math.sin(number));
        });
        it("should solve cosine", function() {
            var scopeData = compiled.isolateScope().data,
                number = 5,
                result = 1,
                firstNumber = compiled.find('.digit:contains("'+ number +'")'),
                cosOperatorButton = compiled.find('.advanced-operator:contains("cos")');

                firstNumber.click();
                cosOperatorButton.click();

            expect(scopeData.result).toEqual(Math.cos(number));
        });
        it("should solve tangent", function() {
            var scopeData = compiled.isolateScope().data,
                number = 5,
                result = 1,
                firstNumber = compiled.find('.digit:contains("'+ number +'")'),
                tanOperatorButton = compiled.find('.advanced-operator:contains("tan")');

                firstNumber.click();
                tanOperatorButton.click();

            expect(scopeData.result).toEqual(Math.tan(number));
        });
    });
});