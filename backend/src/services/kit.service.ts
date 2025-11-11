import { Repository } from 'typeorm';
import AppDataSource from '../config/data-source';
import { Kit } from '../entities/Kit';
import { KitComponent } from '../entities/KitComponent';
import { KitStatus, KitCondition, ComponentStatus } from '../../../shared/src/types';
import redis from '../config/redisDB';

export class KitService {
  private kitRepository: Repository<Kit>;
  private componentRepository: Repository<KitComponent>;

  constructor() {
    this.kitRepository = AppDataSource.getRepository(Kit);
    this.componentRepository = AppDataSource.getRepository(KitComponent);
  }

  async getAllKits(): Promise<Kit[]> {
    const cacheKey = 'kits:all';
    const cachedKits = await redis.get(cacheKey);

    if (cachedKits) {
      return JSON.parse(cachedKits);
    }

    const kits = await this.kitRepository.find({
      relations: ['components'],
    });
    await redis.set(cacheKey, JSON.stringify(kits), 'EX', 300);
    return kits;
  }

  async getKitById(id: string): Promise<Kit | null> {
    const cacheKey = `kit:${id}`;
    const cachedKit = await redis.get(cacheKey);

    if (cachedKit) {
      return JSON.parse(cachedKit);
    }

    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: ['components'],
    });

    if (kit) {
      await redis.set(cacheKey, JSON.stringify(kit), 'EX', 300);
    }
    return kit;
  }

  async createKit(data: Partial<Kit>): Promise<Kit> {
    const kit = this.kitRepository.create(data);
    await this.kitRepository.save(kit);
    await redis.del('kits:all');
    return kit;
  }

  async updateKit(id: string, data: Partial<Kit>): Promise<Kit | null> {
    await this.kitRepository.update(id, data);
    const kit = await this.getKitById(id);
    if (kit) {
      await redis.del(`kit:${id}`);
      await redis.del('kits:all');
    }
    return kit;
  }

  async updateKitStatus(id: string, status: KitStatus): Promise<Kit | null> {
    await this.kitRepository.update(id, { status });
    const kit = await this.getKitById(id);
    if (kit) {
      await redis.del(`kit:${id}`);
      await redis.del('kits:all');
    }
    return kit;
  }

  async addComponent(kitId: string, data: Partial<KitComponent>): Promise<KitComponent> {
    const kit = await this.getKitById(kitId);
    if (!kit) {
      throw new Error('Kit not found');
    }

    const component = this.componentRepository.create({
      ...data,
      kit,
    });
    await this.componentRepository.save(component);
    await redis.del(`kit:${kitId}`);
    await redis.del('kits:all');
    return component;
  }

  async updateComponent(
    kitId: string,
    componentId: string,
    data: Partial<KitComponent>
  ): Promise<KitComponent | null> {
    await this.componentRepository.update(componentId, data);
    const component = await this.componentRepository.findOne({
      where: { id: componentId },
      relations: ['kit'],
    });

    if (component) {
      await redis.del(`kit:${kitId}`);
      await redis.del('kits:all');
    }
    return component;
  }

  async removeComponent(kitId: string, componentId: string): Promise<void> {
    await this.componentRepository.delete(componentId);
    await redis.del(`kit:${kitId}`);
    await redis.del('kits:all');
  }

  async updateKitConditionBasedOnComponents(kitId: string): Promise<void> {
    const kit = await this.getKitById(kitId);
    if (!kit) return;

    const components = kit.components;
    let worstCondition: KitCondition = KitCondition.EXCELLENT;

    for (const component of components) {
      if (component.status === ComponentStatus.DAMAGED) {
        worstCondition = KitCondition.DAMAGED;
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