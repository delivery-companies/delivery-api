import { Router } from "express";

import { AuthController } from "./auth.controller";

import { isAutherized } from "../../middlewares/isAutherized";
import { isLoggedIn } from "../../middlewares/isLoggedIn";

const router = Router();
const authController = new AuthController();

router.route("/auth/signin").post(
    authController.signin
    /*
        #swagger.tags = ['Auth Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/UserSigninSchema" },
                    examples: {
                        UserSigninExample: { $ref: "#/components/examples/UserSigninExample" }
                    }
                }
            }
        }

        #swagger.responses[201-1] = {
            description: 'User Signined Successfully',
            schema: {
                status: "success",
                token: 'token'
            }
        }
    */
);

router.route("/auth/validate-token").post(
    isLoggedIn,
    (_req, res) => {
        res.status(200).json({
            status: "valid"
        });
    }
    /*
        #swagger.tags = ['Auth Routes']

        #swagger.description = 'User needs to be logged in'

        #swagger.security = [{
            "bearerAuth": []
        }]

        #swagger.responses[200-1] = {
            description: 'Token is valid',
            schema: {
                status: "valid"
            }
        }

        #swagger.responses[401-1] = {
            schema: {
                status: "invalid token"
            },
            description: 'Token is invalid'
        }

        #swagger.responses[401-2] = {
            schema: {
                status: "fail",
                message: 'Please Log In!'
            },
            description: 'Please Log In!'
        }
    */
);

router.route("/auth/refresh-token").post(
    authController.refreshToken
    /*
        #swagger.tags = ['Auth Routes']
    */
);

router.route("/auth/signout").post(
    isLoggedIn,
    authController.signout
    /*
        #swagger.tags = ['Auth Routes']
    */
);

router.route("/auth/signout/:userID").post(
    isLoggedIn,
    isAutherized(["ADMIN", "ADMIN_ASSISTANT", "COMPANY_MANAGER"]),
    authController.signoutUser
    /*
        #swagger.tags = ['Auth Routes']
    */
);

export default router;
