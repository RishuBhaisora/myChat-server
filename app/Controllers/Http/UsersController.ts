import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Route from "@ioc:Adonis/Core/Route";
import Mail from "@ioc:Adonis/Addons/Mail";
import Hash from "@ioc:Adonis/Core/Hash";
const jwt = require("jsonwebtoken");

const baseUrl='https://chat-api-e6rf.onrender.com'
// const baseUrl = "http://127.0.0.1:3333";
const secret = "mySuperSecretKey";
export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async create({ request, response }: HttpContextContract) {
    const validationSchema = schema.create({
      name: schema.string(),
      email: schema.string({}, [
        rules.email(),
        rules.unique({ table: "users", column: "email" }),
      ]),
      password: schema.string({}, [rules.minLength(8)]),
    });

    const validatedData = await request.validate({
      schema: validationSchema,
    });
    const user = new User();
    user.fill({ ...validatedData });

    try {
      const verificationUrl = Route.makeSignedUrl(
        "/verify/:email",
        {
          email: validatedData.email,
        },
        {
          expiresIn: "20m",
        }
      );

      await user.save();
      await Mail.send((message) => {
        message
          .to(user.email)
          .subject("Welcome to TalkBase, Please verify your email address ")
          .html(`Hi ${user.name},<br><br>
          Please click on the following link to verify your email address:<br>
          <a href="${baseUrl}${verificationUrl}">Click to varify</a><br><br>
          If you didn't request this email, you can safely ignore it.`);
      });
      return response.created({
        success: true,
        message:
          "User created successfully, Please check your email for verification.",
      });
    } catch (error) {
      await user.delete();
      return response.badRequest({ success: false, message: error.message });
    }
  }
  public async login({ request, response }: HttpContextContract) {
    const reqToken = request.all().token;
    if (reqToken) {
      const decoded = jwt.verify(reqToken, secret);
      const user = await User.findBy("email", decoded.email);
      if (user) {
        return response.json({ user, token: reqToken });
      }
    }
    const { email, password } = request.all();
    const user = await User.findBy("email", email);
    if (!user) {
      return response.unauthorized("Invalid Email");
    }
    if (!user.verified_email) {
      return response.unauthorized(
        "Email is not varified, Please check your gmail to varify"
      );
    }
    const varified = await Hash.verify(user.password, password);
    if (!varified) {
      return response.unauthorized("Invalid Password");
    }
    const token = jwt.sign({ email }, secret, {
      expiresIn: "10s",
    });
    return response.json({ user, token });
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
