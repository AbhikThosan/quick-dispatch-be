import User from "../../../models/userModel.js";
import jwt from "jsonwebtoken";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (request, response, next) => {
  try {
    const { email, password, firstName, lastName, color, profilePicture } =
      request.body;

    if (!email || !password) {
      return response.status(400).send("Email and Password are required.");
    }

    const hasAllProfileInfo = firstName && lastName && color && profilePicture;

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      color,
      profilePicture,
      profileSetup: Boolean(hasAllProfileInfo),
    });

    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
