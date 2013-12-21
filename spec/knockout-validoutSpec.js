/*globals
  describe: true,
  it: true,
  expect: true,
  ko: true,
  beforeEach: true
*/

(function () {
  var model = {};

  model.integer_property = ko.observable().extend({
    type: 'integer'
  });

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
}());
