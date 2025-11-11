"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitService = void 0;
const data_source_1 = __importDefault(require("../config/data-source"));
const Kit_1 = require("../entities/Kit");
const KitComponent_1 = require("../entities/KitComponent");
const types_1 = require("../../../shared/src/types");
const redisDB_1 = __importDefault(require("../config/redisDB"));
class KitService {
    constructor() {
        this.kitRepository = data_source_1.default.getRepository(Kit_1.Kit);
        this.componentRepository = data_source_1.default.getRepository(KitComponent_1.KitComponent);
    }
    async getAllKits() {
        const cacheKey = 'kits:all';
        const cachedKits = await redisDB_1.default.get(cacheKey);
        if (cachedKits) {
            return JSON.parse(cachedKits);
        }
        const kits = await this.kitRepository.find({
            relations: ['components'],
        });
        await redisDB_1.default.set(cacheKey, JSON.stringify(kits), 'EX', 300);
        return kits;
    }
    async getKitById(id) {
        const cacheKey = `kit:${id}`;
        const cachedKit = await redisDB_1.default.get(cacheKey);
        if (cachedKit) {
            return JSON.parse(cachedKit);
        }
        const kit = await this.kitRepository.findOne({
            where: { id },
            relations: ['components'],
        });
        if (kit) {
            await redisDB_1.default.set(cacheKey, JSON.stringify(kit), 'EX', 300);
        }
        return kit;
    }
    async createKit(data) {
        const kit = this.kitRepository.create(data);
        await this.kitRepository.save(kit);
        await redisDB_1.default.del('kits:all');
        return kit;
    }
    async updateKit(id, data) {
        await this.kitRepository.update(id, data);
        const kit = await this.getKitById(id);
        if (kit) {
            await redisDB_1.default.del(`kit:${id}`);
            await redisDB_1.default.del('kits:all');
        }
        return kit;
    }
    async updateKitStatus(id, status) {
        await this.kitRepository.update(id, { status });
        const kit = await this.getKitById(id);
        if (kit) {
            await redisDB_1.default.del(`kit:${id}`);
            await redisDB_1.default.del('kits:all');
        }
        return kit;
    }
    async addComponent(kitId, data) {
        const kit = await this.getKitById(kitId);
        if (!kit) {
            throw new Error('Kit not found');
        }
        const component = this.componentRepository.create({
            ...data,
            kit,
        });
        await this.componentRepository.save(component);
        await redisDB_1.default.del(`kit:${kitId}`);
        await redisDB_1.default.del('kits:all');
        return component;
    }
    async updateComponent(kitId, componentId, data) {
        await this.componentRepository.update(componentId, data);
        const component = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['kit'],
        });
        if (component) {
            await redisDB_1.default.del(`kit:${kitId}`);
            await redisDB_1.default.del('kits:all');
        }
        return component;
    }
    async removeComponent(kitId, componentId) {
        await this.componentRepository.delete(componentId);
        await redisDB_1.default.del(`kit:${kitId}`);
        await redisDB_1.default.del('kits:all');
    }
    async updateKitConditionBasedOnComponents(kitId) {
        const kit = await this.getKitById(kitId);
        if (!kit)
            return;
        const components = kit.components;
        let worstCondition = types_1.KitCondition.EXCELLENT;
        for (const component of components) {
            if (component.status === types_1.ComponentStatus.DAMAGED) {
                worstCondition = types_1.KitCondition.DAMAGED;
                break;
            }
            // if (component.condition === KitCondition.POOR && worstCondition !== KitCondition.DAMAGED) {
            //   worstCondition = KitCondition.POOR;
            // } else if (component.condition === KitCondition.FAIR && 
            //           worstCondition !== KitCondition.DAMAGED && 
            //           worstCondition !== KitCondition.POOR) {
            //   worstCondition = KitCondition.FAIR;
            // } else if (component.condition === KitCondition.GOOD && 
            //           worstCondition === KitCondition.EXCELLENT) {
            //   worstCondition = KitCondition.GOOD;
            // }
        }
        await this.updateKit(kitId, { condition: worstCondition });
    }
}
exports.KitService = KitService;
