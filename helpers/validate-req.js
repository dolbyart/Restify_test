const validate = require('validate.js');
const moment = require('moment');

const validateModel = (model, constraints) => validate(model, constraints);

const setDefaultMessages = () => {
  validate.validators.numericality.options = { message: 'debe ser número' };
  validate.validators.presence.options = { message: 'debe especificar un valor válido' };
  validate.validators.length.options = { message: 'tiene una cantidad incorrecta de caracteres' };
};

validate.extend(validate.validators.datetime, {
  parse(value, options) {
    return moment(value);
  },
  format(value, options) {
    const format = options.dateOnly ? 'dd-MM-YYYY' : 'dd-MM-YYYY hh:mm:ss';
    return moment.utc(value).format(format);
  },
});

exports.validate = validateModel;
exports.setDefaultMessages = setDefaultMessages;