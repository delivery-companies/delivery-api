// import { PrismaClient } from "@prisma/client";
// import * as bcrypt from "bcrypt";
// import { env } from "../config";
// // import { Logger } from "../lib/logger";

// import companies from "./data/mock/companies";
// import users from "./data/mock/users";

// const prisma = new PrismaClient();

// async function main() {
//     /*****************************************************************/
//     /*************************** COMPANIES ***************************/
//     /*****************************************************************/

//     const albarq1 = await prisma.company.upsert({
//         where: {
//             name: companies.albarq1.name
//         },
//         update: companies.albarq1,
//         create: companies.albarq1
//     });

//     // const albarq2 = await prisma.company.upsert({
//     //     where: {
//     //         name: companies.albarq2.name
//     //     },
//     //     update: companies.albarq2,
//     //     create: companies.albarq2
//     // });

//     /*****************************************************************/
//     /***************************** USERS *****************************/
//     /*****************************************************************/

//     const admin = await prisma.user.upsert({
//         where: {
//             username: users.admin.username
//         },
//         update: {
//             name: users.admin.name,
//             phone: users.admin.phone,
//             password: bcrypt.hashSync(users.admin.password + (env.PASSWORD_SALT as string), 12),
//             admin: {
//                 update: {
//                     role: users.admin.role
//                 }
//             }
//         },
//         create: {
//             name: users.admin.name,
//             username: users.admin.username,
//             phone: users.admin.phone,
//             password: bcrypt.hashSync(users.admin.password + (env.PASSWORD_SALT as string), 12),
//             admin: {
//                 create: {
//                     role: users.admin.role
//                 }
//             }
//         }
//     });

//     const adminAssistant = await prisma.user.upsert({
//         where: {
//             username: users.adminAssistant.username
//         },
//         update: {
//             name: users.adminAssistant.name,
//             password: bcrypt.hashSync(users.adminAssistant.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.adminAssistant.phone,
//             admin: {
//                 update: {
//                     role: users.adminAssistant.role
//                 }
//             }
//         },
//         create: {
//             name: users.adminAssistant.name,
//             username: users.adminAssistant.username,
//             phone: users.adminAssistant.phone,
//             password: bcrypt.hashSync(users.adminAssistant.password + (env.PASSWORD_SALT as string), 12),
//             admin: {
//                 create: {
//                     role: users.adminAssistant.role
//                 }
//             }
//         }
//     });

//     const albarq1CompanyManager = await prisma.user.upsert({
//         where: {
//             username: users.albarq1CompanyManager.username
//         },
//         update: {
//             name: users.albarq1CompanyManager.name,
//             password: bcrypt.hashSync(users.albarq1CompanyManager.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1CompanyManager.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1CompanyManager.salary,
//                     role: users.albarq1CompanyManager.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1CompanyManager.name,
//             username: users.albarq1CompanyManager.username,
//             phone: users.albarq1CompanyManager.phone,
//             password: bcrypt.hashSync(users.albarq1CompanyManager.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1CompanyManager.salary,
//                     role: users.albarq1CompanyManager.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1AccountManager = await prisma.user.upsert({
//         where: {
//             username: users.albarq1AccountManager.username
//         },
//         update: {
//             name: users.albarq1AccountManager.name,
//             password: bcrypt.hashSync(users.albarq1AccountManager.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1AccountManager.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1AccountManager.salary,
//                     role: users.albarq1AccountManager.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1AccountManager.name,
//             username: users.albarq1AccountManager.username,
//             phone: users.albarq1AccountManager.phone,
//             password: bcrypt.hashSync(users.albarq1AccountManager.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1AccountManager.salary,
//                     role: users.albarq1AccountManager.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1Accountant = await prisma.user.upsert({
//         where: {
//             username: users.albarq1Accountant.username
//         },
//         update: {
//             name: users.albarq1Accountant.name,
//             password: bcrypt.hashSync(users.albarq1Accountant.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1Accountant.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1Accountant.salary,
//                     role: users.albarq1Accountant.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1Accountant.name,
//             username: users.albarq1Accountant.username,
//             phone: users.albarq1Accountant.phone,
//             password: bcrypt.hashSync(users.albarq1Accountant.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1Accountant.salary,
//                     role: users.albarq1Accountant.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1DeliveryAgent = await prisma.user.upsert({
//         where: {
//             username: users.albarq1DeliveryAgent.username
//         },
//         update: {
//             name: users.albarq1DeliveryAgent.name,
//             password: bcrypt.hashSync(users.albarq1DeliveryAgent.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1DeliveryAgent.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1DeliveryAgent.salary,
//                     role: users.albarq1DeliveryAgent.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1DeliveryAgent.name,
//             username: users.albarq1DeliveryAgent.username,
//             phone: users.albarq1DeliveryAgent.phone,
//             password: bcrypt.hashSync(users.albarq1DeliveryAgent.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1DeliveryAgent.salary,
//                     role: users.albarq1DeliveryAgent.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1ReceivingAgent = await prisma.user.upsert({
//         where: {
//             username: users.albarq1ReceivingAgent.username
//         },
//         update: {
//             name: users.albarq1ReceivingAgent.name,
//             password: bcrypt.hashSync(users.albarq1ReceivingAgent.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1ReceivingAgent.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1ReceivingAgent.salary,
//                     role: users.albarq1ReceivingAgent.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1ReceivingAgent.name,
//             username: users.albarq1ReceivingAgent.username,
//             phone: users.albarq1ReceivingAgent.phone,
//             password: bcrypt.hashSync(users.albarq1ReceivingAgent.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1ReceivingAgent.salary,
//                     role: users.albarq1ReceivingAgent.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1BranchManager = await prisma.user.upsert({
//         where: {
//             username: users.albarq1BranchManager.username
//         },
//         update: {
//             name: users.albarq1BranchManager.name,
//             password: bcrypt.hashSync(users.albarq1BranchManager.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1BranchManager.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1BranchManager.salary,
//                     role: users.albarq1BranchManager.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1BranchManager.name,
//             username: users.albarq1BranchManager.username,
//             phone: users.albarq1BranchManager.phone,
//             password: bcrypt.hashSync(users.albarq1BranchManager.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1BranchManager.salary,
//                     role: users.albarq1BranchManager.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1EmergencyEmployee = await prisma.user.upsert({
//         where: {
//             username: users.albarq1EmergencyEmployee.username
//         },
//         update: {
//             name: users.albarq1EmergencyEmployee.name,
//             password: bcrypt.hashSync(users.albarq1EmergencyEmployee.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1EmergencyEmployee.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1EmergencyEmployee.salary,
//                     role: users.albarq1EmergencyEmployee.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1EmergencyEmployee.name,
//             username: users.albarq1EmergencyEmployee.username,
//             phone: users.albarq1EmergencyEmployee.phone,
//             password: bcrypt.hashSync(users.albarq1EmergencyEmployee.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1EmergencyEmployee.salary,
//                     role: users.albarq1EmergencyEmployee.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1DataEntry = await prisma.user.upsert({
//         where: {
//             username: users.albarq1DataEntry.username
//         },
//         update: {
//             name: users.albarq1DataEntry.name,
//             password: bcrypt.hashSync(users.albarq1DataEntry.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1DataEntry.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1DataEntry.salary,
//                     role: users.albarq1DataEntry.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1DataEntry.name,
//             username: users.albarq1DataEntry.username,
//             phone: users.albarq1DataEntry.phone,
//             password: bcrypt.hashSync(users.albarq1DataEntry.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1DataEntry.salary,
//                     role: users.albarq1DataEntry.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1RepositoryEmployee = await prisma.user.upsert({
//         where: {
//             username: users.albarq1RepositoryEmployee.username
//         },
//         update: {
//             name: users.albarq1RepositoryEmployee.name,
//             password: bcrypt.hashSync(users.albarq1RepositoryEmployee.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1RepositoryEmployee.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1RepositoryEmployee.salary,
//                     role: users.albarq1RepositoryEmployee.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1RepositoryEmployee.name,
//             username: users.albarq1RepositoryEmployee.username,
//             phone: users.albarq1RepositoryEmployee.phone,
//             password: bcrypt.hashSync(users.albarq1RepositoryEmployee.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1RepositoryEmployee.salary,
//                     role: users.albarq1RepositoryEmployee.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1InquiryEmployee = await prisma.user.upsert({
//         where: {
//             username: users.albarq1InquiryEmployee.username
//         },
//         update: {
//             name: users.albarq1InquiryEmployee.name,
//             password: bcrypt.hashSync(users.albarq1InquiryEmployee.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1InquiryEmployee.phone,
//             employee: {
//                 update: {
//                     salary: users.albarq1InquiryEmployee.salary,
//                     role: users.albarq1InquiryEmployee.role
//                 }
//             }
//         },
//         create: {
//             name: users.albarq1InquiryEmployee.name,
//             username: users.albarq1InquiryEmployee.username,
//             phone: users.albarq1InquiryEmployee.phone,
//             password: bcrypt.hashSync(users.albarq1InquiryEmployee.password + (env.PASSWORD_SALT as string), 12),
//             employee: {
//                 create: {
//                     salary: users.albarq1InquiryEmployee.salary,
//                     role: users.albarq1InquiryEmployee.role,
//                     company: {
//                         connect: {
//                             id: albarq1.id
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     const albarq1Client = await prisma.user.upsert({
//         where: {
//             username: users.albarq1Client.username
//         },
//         update: {
//             name: users.albarq1Client.name,
//             password: bcrypt.hashSync(users.albarq1Client.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1Client.phone
//         },
//         create: {
//             name: users.albarq1Client.name,
//             username: users.albarq1Client.username,
//             phone: users.albarq1Client.phone,
//             password: bcrypt.hashSync(users.albarq1Client.password + (env.PASSWORD_SALT as string), 12)
//         }
//     });

//     const albarq1ClientClient = await prisma.client.upsert({
//         where: {
//             id: albarq1Client.id
//         },
//         update: {
//             role: users.albarq1Client.role
//         },
//         create: {
//             role: users.albarq1Client.role,
//             user: {
//                 connect: {
//                     id: albarq1Client.id
//                 }
//             },
//             company: {
//                 connect: {
//                     id: albarq1.id
//                 }
//             },
//             createdBy: {
//                 connect: {
//                     id: albarq1CompanyManager.id
//                 }
//             }
//         }
//     });

//     const albarq1ClientAssistant = await prisma.user.upsert({
//         where: {
//             username: users.albarq1ClientAssistant.username
//         },
//         update: {
//             name: users.albarq1ClientAssistant.name,
//             password: bcrypt.hashSync(users.albarq1ClientAssistant.password + (env.PASSWORD_SALT as string), 12),
//             phone: users.albarq1ClientAssistant.phone
//         },
//         create: {
//             name: users.albarq1ClientAssistant.name,
//             username: users.albarq1ClientAssistant.username,
//             phone: users.albarq1ClientAssistant.phone,
//             password: bcrypt.hashSync(users.albarq1ClientAssistant.password + (env.PASSWORD_SALT as string), 12)
//         }
//     });

//     const albarq1ClientAssistantClient = await prisma.client.upsert({
//         where: {
//             id: albarq1ClientAssistant.id
//         },
//         update: {
//             role: users.albarq1ClientAssistant.role
//         },
//         create: {
//             role: users.albarq1ClientAssistant.role,
//             user: {
//                 connect: {
//                     id: albarq1ClientAssistant.id
//                 }
//             },
//             company: {
//                 connect: {
//                     id: albarq1.id
//                 }
//             },
//             createdBy: {
//                 connect: {
//                     id: albarq1CompanyManager.id
//                 }
//             }
//         }
//     });

//     /*****************************************************************/
//     /*************************** NOTIFICATIONS ***********************/
//     /*****************************************************************/

//     // const superAdmin = await prisma.admin.upsert({
//     //     where: {
//     //         userId: 1
//     //     },
//     //     update: {
//     //         user: {
//     //             update: {
//     //                 name: "Super Admin",
//     //                 username: "superadmin",
//     //                 password: bcrypt.hashSync(
//     //                     "superadmin" + (env.PASSWORD_SALT as string),
//     //                     12
//     //                 ),
//     //                 phone: "01000000000"
//     //             }
//     //         },
//     //         role: AdminRole.ADMIN
//     //     },
//     //     create: {
//     //         user: {
//     //             create: {
//     //
//     //                 name: "Super Admin",
//     //                 username: "superadmin",
//     //                 password: bcrypt.hashSync(
//     //                     "superadmin" + (env.PASSWORD_SALT as string),
//     //                     12
//     //                 ),
//     //                 phone: "01000000000"
//     //             }
//     //         },
//     //         role: AdminRole.ADMIN
//     //     }
//     // });

//     // const user2 = await prisma.user.create({
//     //   data: {
//     //     name: 'Wagih Mohamed',
//     //     username: 'wagihmohamed',
//     //     password: 'password',
//     //   },
//     // });

//     // await prisma.notification.createMany({
//     //     data: notifications
//     // });

//     // console.log({ superAdmin });
//     // Logger.info({ superAdmin });

//     /*****************************************************************/
//     /*************************** BRANCHES ***********************/
//     /*****************************************************************/

//     // await createData(prisma, albarq1.id);

//     console.info({
//         albarq1,
//         // albarq2,
//         admin,
//         adminAssistant,
//         albarq1CompanyManager,
//         albarq1AccountManager,
//         albarq1Accountant,
//         albarq1DeliveryAgent,
//         albarq1ReceivingAgent,
//         albarq1BranchManager,
//         albarq1EmergencyEmployee,
//         albarq1DataEntry,
//         albarq1RepositoryEmployee,
//         albarq1InquiryEmployee,
//         albarq1Client,
//         albarq1ClientClient,
//         albarq1ClientAssistant,
//         albarq1ClientAssistantClient
//     });
// }

// // execute the main function
// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         // close Prisma Client at the end
//         await prisma.$disconnect();
//     });
