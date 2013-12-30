/*globals
 describe: true,
 it: true,
 expect: true,
 ko: true,
 beforeEach: true
 */

if (typeof exports !== 'undefined' && exports !== null) {
  var vo = require('../src/knockout-validout');
}

(function () {
  function custom_validator(){
    //  validats only if prop is 5
    if(parseInt(model.prop()) === 5){
      model.prop.is_valid(true);
      model.prop.validation_message(null);
      model.prop.error_type(null);
    }
    else {
      model.prop.is_valid(false);
      model.prop.validation_message('Should be five');
      model.prop.error_type('custom');
    }
  }

  var dummy_called = false;
  function dummy_validator(){
    dummy_called = true;
  }

  var model = {
    prop: ko.observable('some initial value').extend({custom: custom_validator}),
    prop_dummy: ko.observable('some initial value').extend({custom: dummy_validator})
  };

  beforeEach(function(){
    dummy_called = false;
  });


  describe('custom validation', function(){

    it('custom function is called on property change', function(){
      expect(dummy_called).toBe(false);
      model.prop_dummy(123);
      expect(dummy_called).toBe(true);
    });

    it('the validation properties are initialized (exist)', function(){
      expect(ko.isObservable(model.prop_dummy.is_valid)).toBe(true);
      expect(ko.isObservable(model.prop_dummy.validation_message)).toBe(true);
      expect(ko.isObservable(model.prop_dummy.error_type)).toBe(true);
    });

    it('the custom validator does nothing by default', function(){
      model.prop_dummy(123);

      //  all of these are null because the function has not set them
      expect(model.prop_dummy.is_valid()).toBe(undefined);
      expect(model.prop_dummy.validation_message()).toBe(undefined);
      expect(model.prop_dummy.error_type()).toBe(undefined);
    });

    it('validates as expected', function(){
      model.prop(5);
      expect(model.prop.is_valid()).toBe(true);
      expect(model.prop.validation_message()).toBe(null);
      expect(model.prop.error_type()).toBe(null);

      model.prop(3);
      expect(model.prop.is_valid()).toBe(false);
      expect(model.prop.validation_message()).toBe('Should be five');
      expect(model.prop.error_type()).toBe('custom');
    });

    it('accepts only function as custom validator', function(){
      var f = function(){
        ko.observable().extend({custom: "string is not accepted as custom validator"});
      };

      expect(f).toThrow();
    });

  });
}());
