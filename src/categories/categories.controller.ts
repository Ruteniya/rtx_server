import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Dto } from 'src/dto'
import { Pto } from '@rtx/types'
import { JwtAuth } from 'src/decorators'
import { User } from 'src/decorators/user.decorator'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: Dto.Categories.CreateCategoryDto): Promise<Pto.Categories.Category> {
    return this.categoriesService.create(createCategoryDto)
  }

  @JwtAuth()
  @Get()
  findAll(@User() user): Promise<Pto.Categories.CategoryList> {
    console.log('user: ', user)
    return this.categoriesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Pto.Categories.Category> {
    return this.categoriesService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Dto.Categories.UpdateCategoryDto
  ): Promise<Pto.Categories.Category> {
    return this.categoriesService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id)
  }
}
