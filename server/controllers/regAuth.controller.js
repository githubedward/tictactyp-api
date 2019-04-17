import model from "../models";
import * as authHelper from "../util/auth.helper";

import dotenv from "dotenv";

dotenv.config();

const { Users, UserLogins } = model;
export default class regAuth {
  /**
   * register a user
   * @param {object} req
   * @param {object} res
   * @returns {object} returns user object
   */
  static async register(req, res) {
    let { fullname, username, password } = req.body;
    try {
      password = authHelper.hashPassword(password);
      const userData = await Users.create({
        fullname,
        username
      });
      const userLogin = await UserLogins.create({
        username,
        password,
        user_id: userData.dataValues.id
      });
      if (!data) return res.status(500).json(authHelper.error);
      return res.status(201).json(data);
    } catch (err) {
      return res.status(401).json(err);
    }
  }

  /**
   * login a user
   * @param {object} req
   * @param {object} res
   * @returns {string} string token
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      // retrieved user - username, password
      const response = await Users.findOne({
        where: { username }
      });
      // if user not found, return an error
      if (!response)
        return res
          .status(400)
          .json(
            authHelper.generateError(
              "username",
              "Account not found. Can you please try again?"
            )
          );
      // retrieved user
      const user = response.dataValues;
      // if passwords don't match, return an error
      if (!authHelper.comparePassword(user.password, password))
        return res
          .status(400)
          .json(
            authHelper.generateError(
              "password",
              "Your username and password does not match. Can you please try again?"
            )
          );
      // otherwise, generate a token and return to client
      const token = authHelper.generateToken(user.id);
      return res.status(201).json({ token });
    } catch (err) {
      return res.status(400).send(authHelper.error);
    }
  }

  /**
   * authenticate a user
   * @param {object} req
   * @param {object} res
   * @returns {object} returns user object to client
   */
  static async authenticated(req, res) {
    try {
      const id = req.user.subject;
      const response = await Users.findOne({
        where: { id },
        attributes: { exclude: ["password", "createdAt"] }
      });
      const user = response.dataValues;
      return res.status(201).json(user);
    } catch {
      return res.status(500).json(authHelper.error);
    }
  }
}