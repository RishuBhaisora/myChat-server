import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async create({ request, response }: HttpContextContract) {
    // Define the validation schema
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

    try {
      // Create the user instance and fill it with the validated data
      // const verificationToken = Math.random().toString(36).substring(2)
      // const verificationUrl = `http://127.0.0.1:3333/verify/${verificationToken}`

      const user = new User()
      user.fill({...validatedData})
      
      // Save the user instance to the database
      await user.save()
      // await Mail.Pend((message) => {
      //   message
      //     .to(user.email)
      //     .subject('Please verify your email address')
      //     .htmlView('emails/verify', { user, verificationUrl })
      // })
      
      // Return a success response
      return response.created({ success: true, message: 'User created successfully, Please check your email for verification.' })
    } catch (error) {
      // Return an error response
      return response.badRequest({ success: false, message: error.message })
    }
  }
  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
