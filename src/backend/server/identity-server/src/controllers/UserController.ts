import { Express } from 'express';
import path from 'path';
import { BaseController } from '@Shared/controllers/BaseController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserMethods } from '@Shared/models/user';

export class UserController extends BaseController {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    createUserToken = (user: User) => jwt.sign(
        {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        },
        process.env.JWT_KEY,
        {
            expiresIn: "2h",
        }
    );

    setupRoutes = (app: Express) => {
        app.post(path.join(this.baseUrl, '/register'), async (req, res) => {
            try {
                const user: User = req.body;
                if (!user) {
                    return res.status(500).send("There was a problem registering new user: request body was null");
                }

                if (!UserMethods.fieldsValidForRegister(user)) {
                    return res.status(400).send("All input is required");
                }

                const userExists = !!(await this.getUser(user.email));

                if (userExists) {
                    return res.status(409).send("User Already Exist. Please Login");
                }

                const encryptedPassword = await bcrypt.hash(user.password, 10);

                const response = await this.client.set(user.email, JSON.stringify({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: encryptedPassword
                }));

                if (response !== 'OK') {
                    return res.status(500).send("There was a problem saving new user");
                }

                return res.status(201).send('User successfully created.');
            } catch (err) {
                return res.status(500).send(`There was a problem registering new user. ${err}`);
            }
        });

        app.post(path.join(this.baseUrl, '/login'), async (req, res) => {
            try {
                const reqUser: User = req.body;

                if (!reqUser) {
                    return res.status(500).send("There was a problem signing in: request body was null");
                }

                if (!UserMethods.fieldsValidForLogin(reqUser)) {
                    return res.status(400).send("All input is required");
                }

                let user = await this.getUser(reqUser.email);

                if (user && (await bcrypt.compare(reqUser.password, user.password))) {
                    user.token = this.createUserToken(user);

                    return res.status(200).json(UserMethods.returnToBrowser(user));
                }
                return res.status(400).send("Invalid Credentials");
            } catch (err) {
                return res.status(500).send(`There was a problem signing in. ${err}`);
            }
        });
    }
}
