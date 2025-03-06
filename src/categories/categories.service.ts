import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CategoryEntity } from './entities/category.entity'
import { Pto } from '@rtx/types'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategoryEntity)
    private readonly categoryRepo: typeof CategoryEntity
  ) {}

  private mapEntityToPto(category: CategoryEntity): Pto.Categories.Category {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color
    }
  }

  async create(createCategoryData: Pto.Categories.CreateCategory): Promise<Pto.Categories.Category> {
    const category = await this.categoryRepo.create(createCategoryData)
    return this.mapEntityToPto(category)
  }

  async findAll(): Promise<Pto.Categories.CategoryList> {
    const categories = await this.categoryRepo.findAll()
    return {
      total: categories?.length,
      items: categories?.map((category) => this.mapEntityToPto(category))
    }
  }

  async findOne(id: string): Promise<Pto.Categories.Category> {
    const category = await this.categoryRepo.findOne({
      where: { id }
    })

    if (!category) throw new NotFoundException('Category not found')
    return this.mapEntityToPto(category)
  }

  async update(id: string, updateCategoryData: Pto.Categories.UpdateCategory): Promise<Pto.Categories.Category> {
    const category = await this.categoryRepo.findOne({
      where: { id }
    })
    if (!category) {
      throw new Error(`Category with id ${id} not found`)
    }
    await category.update(updateCategoryData)

    return this.mapEntityToPto(category)
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id }
    })
    if (!category) {
      throw new Error(`Category with id ${id} not found`)
    }
    return category.destroy()
  }
}
