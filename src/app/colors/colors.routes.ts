import {Router} from "express";

import {ClientRole, EmployeeRole} from "@prisma/client";
import {isAutherized} from "../../middlewares/isAutherized";
// import { Role } from "@prisma/client";
// import { isAutherized } from "../../middlewares/isAutherized.middleware";
import {isLoggedIn} from "../../middlewares/isLoggedIn";
import {ColorsController} from "./colors.controller";

const router = Router();
const colorsController = new ColorsController();

router.route("/colors").post(
  isLoggedIn,
  isAutherized([EmployeeRole.CLIENT_ASSISTANT, ClientRole.CLIENT]),
  colorsController.createColor
  /*
        #swagger.tags = ['Colors Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    "schema": { $ref: "#/components/schemas/ColorCreateSchema" },
                    "examples": {
                        "ColorCreateExample": { $ref: "#/components/examples/ColorCreateExample" }
                    }
                }
            }
        }
    */
);

router.route("/colors").get(
  isLoggedIn,
  isAutherized([
    EmployeeRole.CLIENT_ASSISTANT,
    ClientRole.CLIENT,
    //TODO: Remove later
    ...Object.values(EmployeeRole),
    ...Object.values(ClientRole),
  ]),
  colorsController.getAllColors
  /*
        #swagger.tags = ['Colors Routes']

        #swagger.parameters['page'] = {
            in: 'query',
            description: 'Page Number',
            required: false
        }

        #swagger.parameters['size'] = {
            in: 'query',
            description: 'Page Size (Number of Items per Page) (Default: 10)',
            required: false
        }
    */
);

router.route("/colors/:colorID").get(
  isLoggedIn,
  isAutherized([EmployeeRole.CLIENT_ASSISTANT, ClientRole.CLIENT]),
  colorsController.getColor
  /*
        #swagger.tags = ['Colors Routes']
    */
);

router.route("/colors/:colorID").patch(
  isLoggedIn,
  isAutherized([EmployeeRole.CLIENT_ASSISTANT, ClientRole.CLIENT]),
  colorsController.updateColor
  /*
        #swagger.tags = ['Colors Routes']

        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    "schema": { $ref: "#/components/schemas/ColorUpdateSchema" },
                    "examples": {
                        "ColorUpdateExample": { $ref: "#/components/examples/ColorUpdateExample" }
                    }
                }
            }
        }
    */
);

router.route("/colors/:colorID").delete(
  isLoggedIn,
  isAutherized([EmployeeRole.CLIENT_ASSISTANT, ClientRole.CLIENT]),
  colorsController.deleteColor
  /*
        #swagger.tags = ['Colors Routes']
    */
);

export default router;
