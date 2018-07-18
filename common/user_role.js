const {
    roles
} = require("./roles");
const getUserRole = () => {
    return roles.Developer;
    //return roles.Developer;
    //return roles.Usuario;
};
exports.GetUserRole = getUserRole;