import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
 
  public async run () {
    await User.createMany([
      {
        name:"Virk",
        email: 'virk@adonisjs.com',
        password: 'secret12',
        verified_email:true
      },
      {
        name:"Romain",
        email: 'romain@adonisjs.com',
        password: 'secret12',
        verified_email:true
      },
      {
        name:"John",
        email: 'john@adonisjs.com',
        password: 'secret12',
        verified_email:true
      },
      {
        name:"Mike",
        email: 'mike@adonisjs.com',
        password: 'secret12',
        verified_email:true
      },
      {
        name:"Denial",
        email: 'denial@adonisjs.com',
        password: 'secret12',
        verified_email:true
      },
      {
        name:"Stephen",
        email: 'stephen@adonisjs.com',
        password: 'secret12',
        verified_email:true
      }
    ])
  }
}
