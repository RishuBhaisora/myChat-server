import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Route from "@ioc:Adonis/Core/Route";
import Mail from "@ioc:Adonis/Addons/Mail";
import Hash from "@ioc:Adonis/Core/Hash";
const jwt = require("jsonwebtoken");

// const baseUrl = "https://chat-api-e6rf.onrender.com";
const baseUrl = "http://127.0.0.1:39349";
const secret = "mySuperSecretKey";
function generateNumericOtp(length) {
  const otp = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  return otp;
}

export default class UsersController {
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
      return response.badRequest({
        success: false,
        message: "something went wrong",
      });
    }
  }
  public async login({ request, response }: HttpContextContract) {
    const reqToken = request.all().token;
    if (reqToken) {
      try {
        const decoded = jwt.verify(reqToken, secret);
        if (decoded.email) {
          const user = await User.findByOrFail("email", decoded.email);
          return response.json({ user, token: reqToken });
        }
      } catch (e) {
        return response.unauthorized({message: "jwt expired"});
      }
    }
    const { email, password } = request.all();
    const user = await User.findBy("email", email);
    if (!user) {
      return response.unauthorized({message: "Invalid Email"});
    }
    if (!user.verified_email) {
      return response.unauthorized({message: "Email is not varified, Please check your gmail to varify"});
    }
    const varified = await Hash.verify(user.password, password);
    if (!varified) {
      return response.unauthorized({message: "Invalid Password"});
    }
    const token = jwt.sign({ email }, secret, {
      expiresIn: "10h",
    });
    return response.json({ user, token });
  }
  public async requestPasswordResetOtp({ request, response }: HttpContextContract) {
    const email = request.all().email;
    const user = await User.findBy("email", email);
    if (!user || !user.verified_email) {
      return response.unauthorized({message: "Invalid Email"});
    }

    // Generate a random OTP
    const otp = generateNumericOtp(5);

    // Store the OTP in the verification_token column
    user.verification_token = otp;
    await user.save();

    // Send the OTP to the user's email
    await Mail.send((message) => {
      message
        .to(user.email)
        .subject("Password Reset OTP")
        .html(`<p>Your OTP for password reset is: ${otp}</p>`);
    });

    return response.created({
      success: true,
      message: "Recovery Mail sent successfully, Please check your email.",
    });
  }
}
