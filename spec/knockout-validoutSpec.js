/*globals describe: true, it: true, expect: true, ko: true*/

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
  });
}());
