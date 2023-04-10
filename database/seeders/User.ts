import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
 
  public async run () {
    await User.createMany([
      {
        name:"user1",
        email: 'virk@adonisjs.com',
        password: 'secret',
      },
      {
        name:"user2",
        email: 'romain@adonisjs.com',
        password: 'supersecret'
      }
    ])
  }
}
