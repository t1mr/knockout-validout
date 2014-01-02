/*globals
 describe: true,
 it: true,
 expect: true,
 ko: true,
 beforeEach: true
 */

/*
* TODO:
* 1) float type
* 2) add email type
* 3) behaviour when values are missing
* 4) error messages
* */

if (typeof exports !== "undefined" && exports !== null) {
  var vo = require('../src/knockout-validout');
}

(function () {
  var model = {
    integer_property: ko.observable().extend({ type: 'integer' }),
  };

  describe('integer validator', function () {
    it('approves valid integers', function () {
      model.integer_property('5');
      expect(model.integer_property.is_valid()).toBe(true);
    });

    it('does not approve undefined values', function () {
      model.integer_property(undefined);
      expect(model.integer_property.is_valid()).toBe(false);
    });

    it('does not approve complex objects', function () {
      model.integer_property({not: 'a number'});
      expect(model.integer_property.is_valid()).toBe(false);
    });

    it('does not approve NaN', function () {
      model.integer_property(NaN);
      expect(model.integer_property.is_valid()).toBe(false);
    });

    it('does not approve mixing numbers with text', function () {
      model.integer_property('123qswasd');
      expect(model.integer_property.is_valid()).toBe(false);
    });

    it('does not approve float numbers', function () {
      model.integer_property('3.14');
      expect(model.integer_property.is_valid()).toBe(false);
    });
  });


}());
