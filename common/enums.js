const activo = {
    Eliminado: 0,
    Vigente: 1,
};

const personaTipo = {
    Persona: 1,
    Funcionario: 2,
    Fiscal: 3,
    Juez: 4,
};

const personaTipoData = [{
        Id: personaTipo.Persona,
        Nombre: 'Persona',
    },
    {
        Id: personaTipo.Funcionario,
        Nombre: 'Funcionario',
    },
    {
        Id: personaTipo.Fiscal,
        Nombre: 'Fiscal',
    },
    {
        Id: personaTipo.Juez,
        Nombre: 'Juez',
    },
];

const roles = {
    Public: -1,
    Developer: 0,
    Admin: 1,
    Usuario: 2
};

exports.Roles = roles;

exports.Activo = activo;
exports.PersonaTipo = personaTipo;
exports.PersonaTipoData = personaTipoData;