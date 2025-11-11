"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTrigger = exports.NotificationType = exports.PenaltyType = exports.TransactionStatus = exports.KitCondition = exports.ComponentStatus = exports.KitStatus = exports.AccountFlag = exports.AccountStatus = void 0;
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["INACTIVE"] = "INACTIVE";
    AccountStatus["FROZEN"] = "FROZEN";
    AccountStatus["DEACTIVATED"] = "DEACTIVATED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var AccountFlag;
(function (AccountFlag) {
    AccountFlag["MISCONDUCT"] = "MISCONDUCT";
    AccountFlag["OVERDUE"] = "OVERDUE";
    AccountFlag["DAMAGED_ITEMS"] = "DAMAGED_ITEMS";
    AccountFlag["PAYMENT_DUE"] = "PAYMENT_DUE";
})(AccountFlag || (exports.AccountFlag = AccountFlag = {}));
var KitStatus;
(function (KitStatus) {
    KitStatus["AVAILABLE"] = "AVAILABLE";
    KitStatus["BORROWED"] = "BORROWED";
    KitStatus["MAINTENANCE"] = "MAINTENANCE";
    KitStatus["LOST"] = "LOST";
})(KitStatus || (exports.KitStatus = KitStatus = {}));
var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["PRESENT"] = "PRESENT";
    ComponentStatus["MISSING"] = "MISSING";
    ComponentStatus["DAMAGED"] = "DAMAGED";
})(ComponentStatus || (exports.ComponentStatus = ComponentStatus = {}));
var KitCondition;
(function (KitCondition) {
    KitCondition["EXCELLENT"] = "EXCELLENT";
    KitCondition["GOOD"] = "GOOD";
    KitCondition["FAIR"] = "FAIR";
    KitCondition["POOR"] = "POOR";
    KitCondition["DAMAGED"] = "DAMAGED";
})(KitCondition || (exports.KitCondition = KitCondition = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["ACTIVE"] = "ACTIVE";
    TransactionStatus["RETURNED"] = "RETURNED";
    TransactionStatus["OVERDUE"] = "OVERDUE";
    TransactionStatus["LOST"] = "LOST";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PenaltyType;
(function (PenaltyType) {
    PenaltyType["DAMAGE"] = "DAMAGE";
    PenaltyType["LATE_RETURN"] = "LATE_RETURN";
    PenaltyType["LOSS"] = "LOSS";
})(PenaltyType || (exports.PenaltyType = PenaltyType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "EMAIL";
    NotificationType["SMS"] = "SMS";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationTrigger;
(function (NotificationTrigger) {
    NotificationTrigger["DUE_DATE_REMINDER"] = "DUE_DATE_REMINDER";
    NotificationTrigger["OVERDUE_NOTICE"] = "OVERDUE_NOTICE";
    NotificationTrigger["ACCOUNT_STATUS_CHANGE"] = "ACCOUNT_STATUS_CHANGE";
    NotificationTrigger["PENALTY_NOTICE"] = "PENALTY_NOTICE";
})(NotificationTrigger || (exports.NotificationTrigger = NotificationTrigger = {}));
