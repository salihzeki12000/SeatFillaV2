module.exports = {
    attributes: {
        hotelInfo: {
            model: 'HotelInfo',
            required: true,
            notNull: true
        },
        fileDescriptor: {
            type: 'string',
            notNull: true,
            required: true
        },
        width: {
            type: 'integer',
            notNull: true,
            required: true
        },
        height: {
            type: 'integer',
            notNull: true,
            required: true
        },
        mimeType: {
            type: 'string',
            notNull: true,
            required: true
        },
        fileName: {
            type: 'string',
            notNull: true,
            required: true
        },
        fileExt: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}