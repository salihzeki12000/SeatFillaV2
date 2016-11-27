module.exports = {
  attributes:{
    hotel:{
      model:'hotel',
      required:true,
      notNull:true
    },
    agent:{
      model:'HotelAgents',
      notNull:true,
      required:true
    },
    price_total:{
      type:integer,
      notNull:true,
      required:true
    }
  }
}
