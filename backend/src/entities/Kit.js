"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kit = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../shared/src/types");
const KitComponent_1 = require("./KitComponent");
let Kit = class Kit {
};
exports.Kit = Kit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Kit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Kit.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Kit.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => KitComponent_1.KitComponent, component => component.kit),
    __metadata("design:type", Array)
], Kit.prototype, "components", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.KitStatus,
        default: types_1.KitStatus.AVAILABLE
    }),
    __metadata("design:type", String)
], Kit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.KitCondition,
        default: types_1.KitCondition.EXCELLENT
    }),
    __metadata("design:type", String)
], Kit.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Kit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Kit.prototype, "updatedAt", void 0);
exports.Kit = Kit = __decorate([
    (0, typeorm_1.Entity)('kits')
], Kit);
