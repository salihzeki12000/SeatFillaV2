module.exports = {
    attributes: {
        hotelUserComments: {
            collection: 'HotelUserComment',
            via: 'hotel'
        },
        hotelUserRating: {
            collection: 'HotelUserRating',
            via: 'hotel'
        },
        hotelInfo: {
            collection: 'HotelInfo',
            via: 'hotel',
        },
        user: {
            model: 'user',
            defaultsTo: null
        }
    }
}