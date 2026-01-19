"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const admin = {
    username: "admin",
    name: "أدمن",
    password: "password",
    phone: "07345678903",
    role: client_1.AdminRole.ADMIN
};
const adminAssistant = {
    username: "adminassistant",
    name: "أدمن مساعد",
    password: "password",
    phone: "07345678904",
    role: client_1.AdminRole.ADMIN_ASSISTANT
};
const albarq1CompanyManager = {
    username: "albarq1companymanager",
    name: "مدير الشركة",
    password: "password",
    phone: "07345678906",
    salary: 50000.0,
    role: client_1.EmployeeRole.COMPANY_MANAGER
};
const albarq1AccountManager = {
    username: "albarq1accountmanager",
    name: "مدير حسابات",
    password: "password",
    phone: "07345678907",
    salary: 50000.0,
    role: client_1.EmployeeRole.ACCOUNT_MANAGER
};
const albarq1Accountant = {
    username: "albarq1accountant",
    name: "محاسب",
    password: "password",
    phone: "07345678908",
    salary: 50000.0,
    role: client_1.EmployeeRole.ACCOUNTANT
};
const albarq1DeliveryAgent = {
    username: "albarq1deliveryagent",
    name: "مندوب توصيل",
    password: "password",
    phone: "07345678909",
    salary: 50000.0,
    role: client_1.EmployeeRole.DELIVERY_AGENT
};
const albarq1ReceivingAgent = {
    username: "albarq1receivingagent",
    name: "مندوب استلام",
    password: "password",
    phone: "07345678910",
    salary: 50000.0,
    role: client_1.EmployeeRole.RECEIVING_AGENT
};
const albarq1BranchManager = {
    username: "albarq1branchmanager",
    name: "مدير فرع",
    password: "password",
    phone: "07345678911",
    salary: 50000.0,
    role: client_1.EmployeeRole.BRANCH_MANAGER
};
const albarq1EmergencyEmployee = {
    username: "albarq1emergencyemployee",
    name: "موظف طوارئ",
    password: "password",
    phone: "07345678912",
    salary: 50000.0,
    role: client_1.EmployeeRole.EMERGENCY_EMPLOYEE
};
const albarq1DataEntry = {
    username: "albarq1dataentry",
    name: "موظف ادخال بيانات",
    password: "password",
    phone: "07345678913",
    salary: 50000.0,
    role: client_1.EmployeeRole.DATA_ENTRY
};
const albarq1RepositoryEmployee = {
    username: "albarq1repositoryemployee",
    name: "موظف مستودع",
    password: "password",
    phone: "07345678914",
    salary: 50000.0,
    role: client_1.EmployeeRole.REPOSITORIY_EMPLOYEE
};
const albarq1InquiryEmployee = {
    username: "albarq1inquiryemployee",
    name: "موظف استفسارات",
    password: "password",
    phone: "07345678915",
    salary: 50000.0,
    role: client_1.EmployeeRole.INQUIRY_EMPLOYEE
};
const albarq1Client = {
    username: "albarq1client",
    name: "عميل",
    password: "password",
    phone: "07345678908",
    role: client_1.ClientRole.CLIENT
};
const albarq1ClientAssistant = {
    username: "albarq1clientassistant",
    name: "مساعد عميل",
    password: "password",
    phone: "07345678909",
    role: client_1.EmployeeRole.CLIENT_ASSISTANT
};
exports.default = {
    admin,
    adminAssistant,
    albarq1CompanyManager,
    albarq1AccountManager,
    albarq1Accountant,
    albarq1DeliveryAgent,
    albarq1ReceivingAgent,
    albarq1BranchManager,
    albarq1EmergencyEmployee,
    albarq1DataEntry,
    albarq1RepositoryEmployee,
    albarq1InquiryEmployee,
    albarq1Client,
    albarq1ClientAssistant
};
//# sourceMappingURL=users.js.map