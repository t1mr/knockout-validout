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
  var model = {
    prop: ko.observable('some initial value').extend({required: true}),
    prop_label: ko.observable('some initial value').extend({
      required: true,
      label: 'Property'
    }),
    prop_custom_msg: ko.observable('some initial value').extend({
      required: {message: 'Some custom message'}
    })
  };

  describe('required validation', function(){
    beforeEach(function(){
      //  makes them invalid
      model.prop('');
      model.prop_label('');
      model.prop_custom_msg('');
    });

    it('valid properties', function(){
      model.prop('non-empty');

      expect(model.prop.is_valid()).toBe(true);
      expect(model.prop.validation_message()).toBeNull();
      expect(model.prop.error_type()).toBeNull();
    });

    it('invalid properties', function(){
      expect(model.prop.is_valid()).toBe(false);
      expect(model.prop.error_type()).toBe('required');
    });

    it('default error message (w/o label)', function(){
      expect(model.prop.validation_message()).toBe("This field is required.");
    });

    it('default error message (w/ label)', function(){
      expect(model.prop_label.validation_message()).toBe("Property is required.");
    });

    it('custom error message', function(){
      expect(model.prop_custom_msg.validation_message()).toBe("Some custom message");
    });

    it('does not accept whitespaces only', function(){
      model.prop("   ");
      expect(model.prop.is_valid()).toBe(false);
    });
  });
}());
