module.exports = {
    attributes: {
        hotel: {
            model: 'hotel',
            notNull: true,
            required: true
        },
        user: {
            model: 'user',
            notNull: true,
            required: true
        },
        isReply: {
            type: 'boolean',
            defaultsTo: false,
        },
        title: {
            type: 'string',
            defaultsTo: ''
        },
        message: {
            type: 'string',
            defaultsTo: ''
        },
        replies: {
            collection: 'HotelUserComment',
            via: 'id'
        }
    }
}