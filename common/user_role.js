const {
    Roles
} = require('../common/enums');
const getUserRole = () => {
    return Roles.Developer;
    //return roles.Developer;
    //return roles.Usuario;
};
exports.GetUserRole = getUserRole;