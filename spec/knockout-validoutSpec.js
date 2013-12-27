/*globals
  describe: true,
  it: true,
  expect: true,
  ko: true,
  beforeEach: true
*/

if (typeof exports !== "undefined" && exports !== null) {
  var vo = require('../src/knockout-validout');
}

(function () {
  var model = {
    integer_property: ko.observable().extend({ type: 'integer' }),
    greater_than_five: ko.observable().extend({ gt: 5 }),
    greater_than_or_equal_to_five: ko.observable().extend({ gte: 5 }),
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
  });

  describe('greater than validator', function () {
    it('approves of number grater than the argument', function () {
      model.greater_than_five(12);
      expect(model.greater_than_five.is_valid()).toBe(true);
    });

    it('does not approve numbers less than the argument', function () {
      model.greater_than_five(3);
      expect(model.greater_than_five.is_valid()).toBe(false);
    });

    it('does not approve an equal value', function () {
      model.greater_than_five(5);
      expect(model.greater_than_five.is_valid()).toBe(false);
    });
  });

  describe('greater than or equal validator', function () {
    it('approves of number grater than the argument', function () {
      model.greater_than_or_equal_to_five(12);
      expect(model.greater_than_or_equal_to_five.is_valid()).toBe(true);
    });

    it('does not approve numbers less than the argument', function () {
      model.greater_than_or_equal_to_five(3);
      expect(model.greater_than_or_equal_to_five.is_valid()).toBe(false);
    });

    it('approves an equal value', function () {
      model.greater_than_or_equal_to_five(5);
      expect(model.greater_than_or_equal_to_five.is_valid()).toBe(true);
    });
  });
}());
