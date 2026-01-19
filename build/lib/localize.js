"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localizeReportType = exports.localizeGovernorate = exports.localizePermission = exports.localizeRole = exports.localizeReportStatus = exports.localizeDeliveryType = exports.localizeOrderStatusTimeLine = exports.localizeOrderStatus = void 0;
const localizeOrderStatus = (text) => {
    switch (text) {
        case "REGISTERED":
            return "تم تسجيل الطلب";
        case "READY_TO_SEND":
            return "جاهز للارسال";
        case "WITH_DELIVERY_AGENT":
            return "بالطريق مع المندوب";
        case "DELIVERED":
            return "تم تسليم الطلب";
        case "REPLACED":
            return "استبدال الطلب";
        case "PARTIALLY_RETURNED":
            return "راجع جزئى";
        case "RETURNED":
            return "راجع كلي";
        case "POSTPONED":
            return "مؤجل";
        case "CHANGE_ADDRESS":
            return "تغيير العنوان";
        case "RESEND":
            return "اعاده الارسال";
        case "WITH_RECEIVING_AGENT":
            return "عند مندوب الاستلام";
        case "PROCESSING":
            return "قيد المعالجه";
        case "IN_GOV_REPOSITORY":
            return "في مخزن فرز المحافظه";
        case "IN_MAIN_REPOSITORY":
            return "في مخزن الفرز الرئيسي";
        default:
            return text;
    }
};
exports.localizeOrderStatus = localizeOrderStatus;
const localizeOrderStatusTimeLine = (text) => {
    switch (text) {
        case "REGISTERED":
            return "تم تسجيل الطلب";
        case "READY_TO_SEND":
            return "جاهز للارسال";
        case "WITH_DELIVERY_AGENT":
            return "بالطريق مع المندوب";
        case "DELIVERED":
            return "تم تسليم الطلب";
        case "REPLACED":
            return "استبدال الطلب";
        case "PARTIALLY_RETURNED":
            return "راجع جزئى";
        case "RETURNED":
            return "راجع كلي";
        case "POSTPONED":
            return "مؤجل";
        case "CHANGE_ADDRESS":
            return "تغيير العنوان";
        case "RESEND":
            return "اعاده الارسال";
        case "WITH_RECEIVING_AGENT":
            return "تم استلام الطلب من العميل بواسطه مندوب الاستلام ";
        case "PROCESSING":
            return "قيد المعالجه";
        case "IN_GOV_REPOSITORY":
            return "في مخزن فرز المحافظه";
        case "IN_MAIN_REPOSITORY":
            return "في مخزن الفرز الرئيسي";
        default:
            return text;
    }
};
exports.localizeOrderStatusTimeLine = localizeOrderStatusTimeLine;
const localizeDeliveryType = (text) => {
    switch (text) {
        case "NORMAL":
            return "توصيل عادي";
        case "REPLACEMENT":
            return "استبدال";
        default:
            return text;
    }
};
exports.localizeDeliveryType = localizeDeliveryType;
const localizeReportStatus = (text) => {
    switch (text) {
        case "UNPAID":
            return "لم يتم التحاسب";
        case "PAID":
            return "تم التحاسب";
        default:
            return text;
    }
};
exports.localizeReportStatus = localizeReportStatus;
const localizeRole = (text) => {
    switch (text) {
        case "COMPANY_MANAGER":
            return "مدير الشركه";
        case "ACCOUNT_MANAGER":
            return "مدير الحسابات";
        case "ACCOUNTANT":
            return "محاسب";
        case "DELIVERY_AGENT":
            return "مندوب توصيل";
        case "RECEIVING_AGENT":
            return "مندوب استلام";
        case "BRANCH_MANAGER":
            return "مدير فرع";
        case "EMERGENCY_EMPLOYEE":
            return "موظف متابعة";
        case "DATA_ENTRY":
            return "مدخل بيانات";
        case "REPOSITORIY_EMPLOYEE":
            return "موظف مخزن";
        case "INQUIRY_EMPLOYEE":
            return "موظف استعلامات";
        case "CLIENT_ASSISTANT":
            return "مساعد عميل";
        case "CLIENT":
            return "عميل";
        case "ADMIN":
            return "ادمن";
        case "ADMIN_ASSISTANT":
            return "مساعد ادمن";
        default:
            return text;
    }
};
exports.localizeRole = localizeRole;
const localizePermission = (text) => {
    switch (text) {
        case "ADD_STORE":
            return "اضافة متجر";
        case "ADD_CLIENT":
            return "اضافة عميل";
        case "ADD_LOCATION":
            return "اضافة منطقة";
        case "ADD_DELIVERY_AGENT":
            return "اضافة مندوب";
        case "ADD_ORDER":
            return "اضافة طلبية";
        case "DELETE_ORDER":
            return "مسح طلبية";
        case "CHANGE_ORDER_STATUS":
            return "تغيير حالة طلبية";
        case "CHANGE_CLOSED_ORDER_STATUS":
            return "تغيير حالة طلبية مغلقة";
        case "CHANGE_ORDER_TOTAL_AMOUNT":
            return "تعديل المبلغ الكلي لطلبية";
        case "LOCK_ORDER_STATUS":
            return "قفل حالة طلبية";
        case "CHANGE_ORDER_DELIVERY_AGENT":
            return "احالة طلبية من مندوب الي اخر";
        case "CHANGE_ORDER_BRANCH":
            return "احالة طلبية من فرع الي اخر";
        case "CHANGE_ORDER_CLIENT":
            return "احالة طلبية من عميل الي اخر";
        case "CHANGE_ORDER_COMPANY":
            return "احالة طلبية من شركة الي اخرى";
        case "CREATE_DELIVERY_AGENT_REPORT":
            return "انشاء كشف مندوب";
        case "CREATE_CLIENT_REPORT":
            return "انشاء كشف عميل";
        case "CREATE_REPOSITORY_REPORT":
            return "انشاء كشف مخزن";
        case "CREATE_COMPANY_REPORT":
            return "انشاء كشف شركة";
        case "CREATE_GOVERNMENT_REPORT":
            return "انشاء كشف محافظة";
        case "CREATE_BRANCH_REPORT":
            return "انشاء كشف فرع";
        case "DELETE_COMPANY_REPORT":
            return "مسح كشف شركة";
        case "DELETE_REPOSITORY_REPORT":
            return "مسح كشف مخزن";
        case "DELETE_GOVERNMENT_REPORT":
            return "مسح كشف محافظة";
        case "DELETE_DELIVERY_AGENT_REPORT":
            return "مسح كشف مندوب";
        case "DELETE_CLIENT_REPORT":
            return "مسح كشف عميل";
        case "DELETE_BRANCH_REPORT":
            return "مسح كشف فرع";
        default:
            return text;
    }
};
exports.localizePermission = localizePermission;
const localizeGovernorate = (text) => {
    switch (text) {
        case "AL_ANBAR":
            return "الانبار";
        case "BABIL":
            return "بابل";
        case "BABIL_COMPANIES":
            return "بابل (شركات)";
        case "BAGHDAD":
            return "بغداد";
        case "BASRA":
            return "البصرة";
        case "DHI_QAR":
            return "ذي قار";
        case "AL_QADISIYYAH":
            return "القادسية";
        case "DIYALA":
            return "ديالى";
        case "DUHOK":
            return "دهوك";
        case "ERBIL":
            return "اربيل";
        case "KARBALA":
            return "كربلاء";
        case "KIRKUK":
            return "كركوك";
        case "MAYSAN":
            return "ميسان";
        case "MUTHANNA":
            return "المثنى";
        case "NAJAF":
            return "النجف";
        case "NINAWA":
            return "نينوى";
        case "SALAH_AL_DIN":
            return "صلاح الدين";
        case "SULAYMANIYAH":
            return "السليمانية";
        case "WASIT":
            return "واسط";
        default:
            return text;
    }
};
exports.localizeGovernorate = localizeGovernorate;
const localizeReportType = (text) => {
    switch (text) {
        case "COMPANY":
            return "شركة";
        case "REPOSITORY":
            return "مخزن";
        case "GOVERNORATE":
            return "محافظة";
        case "DELIVERY_AGENT":
            return "مندوب";
        case "BRANCH":
            return "فرع";
        case "CLIENT":
            return "عميل";
        default:
            return text;
    }
};
exports.localizeReportType = localizeReportType;
//# sourceMappingURL=localize.js.map