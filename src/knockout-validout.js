/*globals ko: true*/
/*jslint todo: true*/

/*
  Knockout simple validation.

  We want do the following:

  required
  type: integer | float | email | url
  gt, lt, gte, lte //  relations
  regular expression
  custom function
  conditional validation

  //  Simple rules
  ko.observable().extend({required: true});
  ko.observable().extend({type: "float"});

  //  Validation with custom functions
  ko.observable().extend({custom: function(){
    //  TODO: specify the behaviour
  }});


  //  conditional validation
  ko.observable().extend({
    required: {
      validate_if: function(){
        return ...;
      }
    }
  });


  //  custom message
  ko.observable().extend({
    required: {
      message: "This is custom message";
    }
  });
  ko.observable().extend({
    required: {
      message: function(){
        return "This is custom message generated by a function";
      }
    }
  });
 */


if (typeof exports !== "undefined" && exports !== null) {
  ko = require('knockout');
}
//  TODO: encapsulate everythin in a workspace to avoid conflicts (e.g. commonly used words as validate)
(function(){
  //  taken from here: http://javascript.crockford.com/remedial.html
  if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
      return this.replace(
        /\{([^{}]*)\}/g,
        function (a, b) {
          var r = o[b];
          return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
      );
    };
  }

  var validation_messages = {
    required: "{label} is required.",
    type: "{label} must be valid {options}.",
    gt: "{label} must be greater than {options}.",
    gte: "{label} must be greator or equal to {options}.",
    lt: "{label} must be less than {options}.",
    lte: "{label} must be less than or equal to {options}.",
    regexp: "{label} must be in the following format: {options}."
  };

  //  return values:
  //    true - valid
  //    false - not valid
  //    undefined - the validation is not applicable (i.e. type on empty value, numeric relation on invalid number)
  var validation_functions = {
    required: function(target, options){
      var value = target();
      if(typeof value == 'string'){
        value = value.trim();
      }

      return value !== null && value !== "";
    },

    type: function(target, options){
      //  TODO: validate with regexp as well, parseInt and parseFloat have the crappy behaviour of that kind: parseInt("12a") == 12
      return {
        integer: function(val){
          return val !== null && val !== undefined && val !== '' ? !isNaN(parseInt(val)) : null;
        },

        float: function(val){
          return val !== null && val !== undefined && val !== '' ? !isNaN(parseFloat(val)) : null;
        }

      }[options](target());
    },

    gt: function(target, options){
      var value = parseFloat(target());
      return isNaN(value) ? null : value > options;
    },

    gte: function(target, options){
      var value = parseFloat(target());
      return isNaN(value) ? null : value >= options;
    },

    lt: function(target, options){
      var value = parseFloat(target());
      return isNaN(value) ? null : value < options;
    },

    lte: function(target, options){
      var value = parseFloat(target());
      return isNaN(value) ? null : value <= options;
    },

    regexp: function(target, options){
      if(target.is_valid() !== false || target.error_type() === 'regexp'){
        var r = options.regexp !== undefined ? options.regexp : options;
        var re = new RegExp(r);
        return re.test(target());
      }

      return null;
    },

    equals: function(target, options){
      var val = ko.utils.unwrapObservable(options.equals || options);
      return target() === val;
    }
  };

  function init(target, options){
    if(!target.is_valid){
      target.is_valid = ko.observable();
    }

    if(!target.validation_message){
      target.validation_message = ko.observable();
    }

    if(!target.error_type){
      target.error_type = ko.observable();
    }

    if(!target.set_error){
      target.set_error = function(valid, message, type){
        target.is_valid(valid);
        target.validation_message(message);
        target.error_type(type);
      };
    }

    if(target.validators === undefined){
      target.validators = [];
    }

    if(options.validate_if && !ko.isObservable(options.validate_if)){
      throw "validate_if must be observable.";
    }

  }

  function validate(target, validate_func, validation_type, options){
    if(!options.validate_if ||                                             //  no conditional validation
       typeof options.validate_if === 'function' && options.validate_if()  //  conditional validation and condition met
      ){

      var res = validate_func(target, options);
      if(res === true){
        //  valid or not need to validate at all
        target.set_error(true, null, null);
      }
      else if(res === false){
        //  not valid
        target.is_valid(false);
        target.error_type(validation_type);

        if(options.message){
          //  custom message
          if(typeof options.message === 'function'){
            //  TODO: figure out the interface
            target.validation_message(options.message());
          }
          else {
            target.validation_message(options.message);
          }
        }
        else {
          //  the default message
          target.validation_message(validation_messages[validation_type].supplant({
            label: target.label || "This field",
            options: options
          }));
        }
      }
      //  undefined means the validation is not applicable, do nothing
    }
    else {
      //  the field is neither valid nor invalid, the validation is no applicable
      target.set_error(null, null, null);
    }
  }

  function get_validation_extender(type){
    return function(target, options){
      init(target, options);

      var func = validation_functions[type];
      var validator = function(){
        validate(target, func, type, options);
      };

      //  subscribe for changes
      target.subscribe(function(){
        validator();
      });
      if(options.validate_if){
        options.validate_if.subscribe(function(){
          validator();
        });
      }
      target.validators.push(validator);

      return target;
    };
  }

  ko.extenders.label = function(target, options){
    target.label = options;
  };

  //  TODO: support for relations to other model properties
  ko.extenders.required = get_validation_extender('required');
  ko.extenders.type = get_validation_extender('type');
  ko.extenders.gt = get_validation_extender('gt');
  ko.extenders.gte = get_validation_extender('gte');
  ko.extenders.lt = get_validation_extender('lt');
  ko.extenders.lte = get_validation_extender('lte');
  ko.extenders.regexp = get_validation_extender('regexp');
  ko.extenders.equals = get_validation_extender('equals');


  ko.extenders.custom = function(target, options){
    init(target, options);
    if(typeof options !== 'function'){
      throw 'Custom validator argument is not a function but ' + typeof options;
    }

    target.subscribe(function(){
      if(!(target.is_valid() === false && target.error_type() !== 'custom')){
        //  perform custom validation only if there is no failed other validation
        options();
      }
    });
  };

  var original_apply_bindings = ko.applyBindings;
  ko.applyBindings = function(viewModel, rootNode){
    original_apply_bindings(viewModel, rootNode);


    if(viewModel.is_model_valid && !viewModel.is_model_valid.knockout_simple_validation){
      throw 'The model already has different is_model_valid property, cannot attach.';
    }

    ko.simple_validation.attach_model_validation(viewModel);
  };


  function get_observables(model, validation_set){
    var res = [],
      i,
      keys,
      key;

    if(validation_set === undefined){
      keys = Object.keys(model);
    }
    else {
      keys = validation_set;
    }

    for(i=0; i<keys.length; i++){
      key = keys[i];
      if( model.hasOwnProperty(key) &&
          ko.isObservable(model[key])
      ){
        res.push(model[key]);
      }
    }

    return res;
  }

  function is_observable_array(target){
    //  observable which has push => observable array
    //  TODO: is there a better way to detect?
    return ko.isObservable(target) && target.push !== undefined;
  }

  //  TODO: see how to expose better, maybe something that can be pass to extend() and all the below implementations
  //  to operate on this
  //  official API
  ko.simple_validation = {
    get_model_validator: function(model){
      var validator_func = ko.computed(function(){
        var obs = get_observables(model),
          i,
          target;

        for(i=0; i<obs.length; i++){
          target = obs[i];
          if( target.is_valid &&
              target.is_valid() === false       //  explicit check for false, for now undefined means no validation has performed
          ){
            return false;
          }
        }

        return true;
      });
      validator_func.knockout_simple_validation = true; //  let's indicate it's our implementation
      return validator_func;
    },

    get_errors_aggregator: function(model){
      var error_func = ko.computed(function(){
        var errors = [],
          obs = get_observables(model),
          i,
          target;

        for(i=0; i<obs.length; i++){
          target = obs[i];
          if( target.is_valid &&
              target.is_valid() === false       //  explicit check for false, for now undefined means no validation has performed
          ){
            errors.push(target.validation_message !== undefined ? target.validation_message() : target.validation_messages());
          }
        }

        return errors;
      });
      error_func.knockout_simple_validation = true; //  let's indicate it's our implementation
      return error_func;
    },

    get_revalidator: function(model){
      var validate_func = function(){
        var obs = get_observables(model),
          i,
          j,
          target,
          validator;
        for(i=0; i<obs.length; i++){
          target = obs[i];
          if(target.validators){
            for(j=0; j<target.validators.length; j++){
              validator = target.validators[j];
              validator();
            }
          }
        }
      };
      return validate_func;
    },

    get_observable_array_validator: function(target){
      var res = ko.computed(function(){
        var children = target(),
        i,
        child;

        for(i=0; i<children.length; i++){
          //  TODO: handle destroyed
          child = children[i];
          if( child.is_valid && typeof child === 'function' && child.is_valid() === false ||
              child.is_model_valid && typeof child.is_model_valid === 'function' && child.is_model_valid() === false){

            return false;
          }
        }

        return true;
      });

      return res;
    },

    get_observable_array_error_aggregator: function(target){
      var res = ko.computed(function(){
        var errors = [],
          children = target(),
          i,
          child;

        for(i=0; i<children.length; i++){
          //  TODO: handle destroyed
          child = children[i];
          if(child.errors !== undefined){
            errors.push(child.errors());
          }
        }

        return errors;
      });

      return res;
    },

    get_field_set_validator: function(model, fields){
      var validator_func = ko.computed(function(){
        var obs = get_observables(model, fields),
          i,
          target;

        for(i=0; i<obs.length; i++){
          target = obs[i];
          if( target.is_valid &&
              target.is_valid() === false       //  explicit check for false, for now undefined means no validation has performed
          ){
            return false;
          }
        }

        return true;
      });
      validator_func.knockout_simple_validation = true; //  let's indicate it's our implementation
      return validator_func;
    },

    attach_model_validation: function(model){
      var obs = get_observables(model),
        i,
        target;

      for(i=0; i<obs.length; i++){
        target = obs[i];

        if(is_observable_array(target)){
          target.is_valid = ko.simple_validation.get_observable_array_validator(target);
          target.validation_messages = ko.simple_validation.get_observable_array_error_aggregator(target);
        }
      }

      model.is_model_valid = ko.simple_validation.get_model_validator(model);
      model.errors = ko.simple_validation.get_errors_aggregator(model);
      model.validate = ko.simple_validation.get_revalidator(model);


    }
  };
})();