import model from "../models";
import * as helper from "../util/helper";

import dotenv from "dotenv";

dotenv.config();

const { Users, UserLogins } = model;

export default class UsersController {
  /**
   * update user fullname
   * @param {object} req
   * @param {object} res
   * @returns {object} returns updated user data
   */
  static async updateUserFullname(req, res) {
    try {
      const { id } = req.params;
      const { newFullname } = req.body;
      const updatedUser = await Users.update(
        { fullname: newFullname },
        {
          where: { id },
          returning: true
        }
      );
      return res.status(201).json(updatedUser[1][0]);
    } catch (err) {
      return res.status(401).json(err);
    }
  }

  /**
   * update username
   * @param {object} req
   * @param {object} res
   * @returns {object} returns updated user data
   */
  static async updateUsername(req, res) {
    try {
      const { id } = req.params;
      const { newUsername } = req.body;
      // update UserLogins
      const response = await UserLogins.update(
        {
          username: newUsername
        },
        {
          where: { user_id: id },
          returning: true
        }
      );
      const updatedUsername = {
        username: response[1][0].username
      };
      return res.status(201).json(updatedUsername);
    } catch (err) {
      return res.status(401).json(err);
    }
  }

  /**
   * update user status
   * @param {object} req
   * @param {object} res
   * @returns {object} returns updated user data
   */
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { newStatus } = req.body;
      const updatedUser = await Users.update(
        { status: newStatus },
        {
          where: { id },
          returning: true
        }
      );
      return res.status(201).json(updatedUser[1][0]);
    } catch (err) {
      return res.status(401).json(err);
    }
  }

  /**
   * update user avatar
   * @param {object} req
   * @param {object} res
   * @returns {object} returns updated user data
   */
  static async updateAvatarUrl(req, res) {
    try {
      const { id } = req.params;
      const { newAvatarUrl } = req.body;
      const updatedUser = await Users.update(
        { avatarUrl: newAvatarUrl },
        {
          where: { id },
          returning: true
        }
      );
      return res.status(201).json(updatedUser[1][0]);
    } catch (err) {
      return res.status(401).json(err);
    }
  }
}