import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Dto } from 'src/dto'
import { Pto } from '@rtx/types'
import { Auth, SystemAuth } from 'src/decorators'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @SystemAuth()
  @Post()
  create(@Body() createCategoryDto: Dto.Categories.CreateCategoryDto): Promise<Pto.Categories.Category> {
    return this.categoriesService.create(createCategoryDto)
  }

  @Auth()
  @Get()
  findAll(): Promise<Pto.Categories.CategoryList> {
    return this.categoriesService.findAll()
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Pto.Categories.Category> {
    return this.categoriesService.findOne(id)
  }

  @SystemAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Dto.Categories.UpdateCategoryDto
  ): Promise<Pto.Categories.Category> {
    return this.categoriesService.update(id, updateCategoryDto)
  }

  @SystemAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id)
  }
}
