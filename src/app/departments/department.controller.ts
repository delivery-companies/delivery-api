import { prisma } from "../../database/db";
import { catchAsync } from "../../lib/catchAsync";
import { loggedInUserType } from "../../types/user";

export class DepartmentController{
    createDepartment=catchAsync(async(req,res)=>{
        const name=req.body.name as string
        const loggedInUser=res.locals.user as loggedInUserType
        const createdDepartment=await prisma.department.create({
            data:{
                name:name,
                companyId:loggedInUser.companyID,
                createdBy:loggedInUser.name
            },
            select:{
                id:true,
                name:true,
                companyId:true,
                createdBy:true,
            }
        })
        res.status(200).json({
            status: "success",
            data: createdDepartment
        });
    })
    getAllDepartments=catchAsync(async(req,res)=>{
        const {page,size}=req.query
        const loggedInUser=res.locals.user as loggedInUserType

        const departments=await prisma.department.findManyPaginated({
            where:{
                companyId:loggedInUser.companyID
            },
            select:{
                id:true,
                name:true,
                companyId:true,
                createdBy:true,
                employees:{
                    select:{
                        user:{
                            select:{
                                name:true,
                                id:true
                            }
                        }
                    }
                }
            }
        },
        {
            page: page ? +page : 1,
            size: size ? +size : 10
        })

        res.status(200).json({
            status: "success",
            data: departments.data,
            page:departments.currentPage,
            count:departments.dataCount,
            pagesCount: departments.pagesCount
        });
    })
    assignDepartmentsToEmployees=catchAsync(async (req,res)=>{
        const {departmentId,employeesIds}=req.body


        let employees:number[]=[]
        
        if(employeesIds){
            const parsedEmployessIDS = JSON.parse(employeesIds) as number[];
            employees = parsedEmployessIDS.map(id => +id);
        }
        await prisma.employee.updateMany({
            where:{
                departmentId:+departmentId
            },
            data:{
                departmentId:null
            }
        })

        await prisma.employee.updateMany({
            where:{
                id:{in:employees}
            },
            data:{
                departmentId:+departmentId
            }
        })
        res.status(200).json({
            status: "success",
            message: "Departments assigned to employees successfully"
        })
    })
    getOne=catchAsync(async(req,res)=>{
        const {id}=req.params
        const department=await prisma.department.findUnique({
            where:{
                id:+id
            },
            select:{
                id:true,
                name:true,
                companyId:true,
                createdBy:true
            }
        })
        res.status(200).json({
            status: "success",
            data: department
        })

    })
    editOne=catchAsync(async(req,res)=>{
        const {id}=req.params
        const {name}=req.body
        const department=await prisma.department.update({
            where:{
                id:+id
            },
            data:{
                name:name
            },
            select:{
                id:true,
                name:true,
                companyId:true,
                createdBy:true
            }
        })
        res.status(200).json({
            status: "success",
            data: department
        })
    })
    deleteOne=catchAsync(async(req,res)=>{
        const {id}=req.params
        await prisma.department.delete({
            where:{
                id:+id
            },
        })
        res.status(204).json({status:"success"})
    })
}