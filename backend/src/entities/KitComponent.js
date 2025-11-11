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
exports.KitComponent = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../shared/src/types");
const Kit_1 = require("./Kit");
let KitComponent = class KitComponent {
};
exports.KitComponent = KitComponent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KitComponent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KitComponent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], KitComponent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Kit_1.Kit, kit => kit.components),
    __metadata("design:type", Kit_1.Kit)
], KitComponent.prototype, "kit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.ComponentStatus,
        default: types_1.ComponentStatus.PRESENT
    }),
    __metadata("design:type", String)
], KitComponent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.KitCondition,
        default: types_1.KitCondition.EXCELLENT
    }),
    __metadata("design:type", String)
], KitComponent.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KitComponent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KitComponent.prototype, "updatedAt", void 0);
exports.KitComponent = KitComponent = __decorate([
    (0, typeorm_1.Entity)('kit_components')
], KitComponent);
