module.exports = {
     countryCode:{
        type:'string',
        model:'country',
        via:'alpha3code'
    },
    alternateSpelling:{
        type:'string',
        notNull:true,
        required:true
    }
}