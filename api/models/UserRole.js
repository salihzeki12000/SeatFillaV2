/**
 * UserRole.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoPk:false,
  seedData:[],
  attributes: {
    id:{
      type:'number',
      integer:true,
      notNull:true,
      primaryKey:true
    },
    role:{
      type:'string',
      notNull:true,
    },
    user: {
      collection: 'User',
      via: 'roles'
    }
  }
};
