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

  // Create a new category
  async create(createCategoryData: Pto.Categories.CreateCategory) {
    const category = await this.categoryRepo.create(createCategoryData)
    return this.mapEntityToPto(category)
  }

  // Get all categories
  async findAll(): Promise<Pto.Categories.Category[]> {
    const categories = await this.categoryRepo.findAll()
    return categories.map((category) => this.mapEntityToPto(category))
  }

  // Get one category by ID
  async findOne(id: string): Promise<Pto.Categories.Category> {
    const category = await this.categoryRepo.findOne({
      where: { id }
    })

    if (!category) throw new NotFoundException('Category not found')
    return this.mapEntityToPto(category)
  }

  // Update an existing category
  async update(id: string, updateCategoryData: Pto.Categories.UpdateCategory) {
    const category = await this.categoryRepo.findOne({
      where: { id }
    })
    if (!category) {
      throw new Error(`Category with id ${id} not found`)
    }
    await category.update(updateCategoryData)
  }

  // Delete a category by ID
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
