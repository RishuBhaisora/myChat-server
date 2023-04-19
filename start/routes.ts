/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import User from 'App/Models/User'

Route.get('/', async () => {
  
  return { hello: "world" }
})


Route.get('/verify/:token', async ({ params, response }) => {
  const user = await User.findBy('verification_token', params.token)

  if (!user) {
    return response.status(404).send('Invalid verification token.')
  }

  user.verified_email = true
  user.verification_token = null
  await user.save()

  response.send('Email address verified successfully.')
})

Route.post('/register','UsersController.create')
