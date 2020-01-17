const Dev = require('../models/Dev');
const parseStringAsArray = require('./../utils/parseStringAsArray');

module.exports = {
    async index(request, response){
        // Buscar todos devs num raido de 10km
        // Filtrar por tecnologias

        const { latitude, longitude, techs } = request.query;

        // console.log('=-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-==-=');
        const techsArray = await parseStringAsArray(techs);

        const devs = await Dev.find({
            techs: {
                $in: techsArray
            },
            location:{
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 500000,
                },
            },
        });

        return response.json({ devs }); 

    }
}