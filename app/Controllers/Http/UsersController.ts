import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'


export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async create({ request, response }: HttpContextContract) {
    // Define the validation schema
    // const baseUrl=Env.get('PG_HOST')+Env.get('PG_PORT')
    const validationSchema = schema.create({
      name: schema.string(),
      email: schema.string({}, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({}, [
        rules.minLength(6),
      ]),
    })

    // Validate the request data against the schema
    const validatedData = await request.validate({
      schema: validationSchema,
    })
    const user = new User()
    user.fill({...validatedData})

    try {
     
      const verificationUrl = Route.makeSignedUrl('/verify/:email', {
        email: validatedData.email,
      },
      {
        expiresIn: '20m',
      })
          
      await user.save()
      await Mail.send((message) => {
        message
          .to(user.email)
          .subject('Welcome to TalkBase, Please verify your email address ')
          .html(`Hi ${user.name},<br><br>
          Please click on the following link to verify your email address:<br>
          <a href="https://chat-api-e6rf.onrender.com${verificationUrl}">Click to varify</a><br><br>
          If you didn't request this email, you can safely ignore it.`)
      })
      return response.created({ success: true, message: 'User created successfully, Please check your email for verification.' })
    } catch (error) {
      // Return an error response
      await user.delete()
      return response.badRequest({ success: false, message: error.message })
    }
  }
  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
