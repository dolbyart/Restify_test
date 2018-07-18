const {
    roles
} = require("./roles");
const getUserRole = () => {
    return roles.Admin;
    //return roles.Developer;
    //return roles.Usuario;
};
exports.GetUserRole = getUserRole;