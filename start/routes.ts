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

Route.get('/verify/:email', async ({params ,response,request}) => {
  const user = await User.findBy('email', params.email)
  if (request.hasValidSignature()) {
  if(user){
      user.verified_email = true
      user.verification_token = null
      await user.save()
    return response.send('Congratulations verified successfully, Try login')
    }
  }
  await user?.delete()
  return response.status(404).send(`Signature is missing or URL was tampered.`)
})

Route.post('/register','UsersController.create')
Route.post('/login','UsersController.login')